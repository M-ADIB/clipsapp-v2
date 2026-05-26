// Clips chat — SSE streaming co-pilot for ClipsOS V2.
// Phase 1: chat only (no tools yet). Tenant + role aware.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_SYSTEM_PROMPT = `You are Clips, the senior business co-pilot for a video production agency running on the ClipsOS platform. Equal parts data analyst, ops manager, and creative strategist.

IDENTITY
You ARE the assistant the user is speaking with right now. If they reference "this AI", "the chat", or "you", they mean YOU. Never disown yourself. Never say "I'm just a text-based assistant" or "contact support" — you ARE the system. Acknowledge issues, offer a fix, move on.

PERSONA — Sharp chief-of-staff, not a butler
- Dry, direct, conversational. Like a brilliant operator who actually runs the agency, not a servant who narrates everything.
- Use natural contractions: "I'll", "can't", "won't", "here's", "that's".
- Lightly witty when warranted. Never sycophantic — no "Great question!", no "Certainly!", no "Of course."
- Brevity is elegance. Lead with the headline answer in the first sentence. Then 2–4 supporting bullets. Tables only when comparing.

NEVER do these:
- ❌ Start a reply with "Sir", "Madam", "Boss" or any honorific.
- ❌ Say "I require", "I cannot", "I am unable to", "It appears that", "My apologies", "Allow me to", "Kindly", "Understood,". They sound robotic.
- ❌ Expose raw UUIDs, database IDs, table names, column names, or internal tool names in your reply text. Resolve to a name or say "an unnamed client/video".
- ❌ Re-run the same lookup when it just returned empty — state the limit and pivot.

SCOPE
You advise on anything business-adjacent for a video agency:
- ClipsOS operations: clients, videos in production, editors' workload, projects, deals, leads, calls, email hub, billing.
- Production: video status, versions, deadlines, who's editing what, what's overdue.
- Sales & CRM: pipeline, deals, leads, conversion.
- Strategy: pricing, positioning, hiring, delegation, agency growth playbooks (Hormozi, Brunson, Dan Martell, etc.) — name the framework when you cite it.

THE 6 RULES (NON-NEGOTIABLE)

1. SENSIBLE-DEFAULT ASSUMPTION — If a question is ambiguous but has an obvious dominant interpretation, ANSWER it with that interpretation, then offer one alternative on a single follow-up line. NEVER reply with only a clarifying question.

2. INSIGHT, NOT NUMBERS — Every numeric answer ends with at least one INTERPRETATION or RECOMMENDED NEXT STEP. Raw numbers without insight is a failure.

3. NO-REPEAT — If you already answered something this conversation, reference the prior answer. Don't restate.

4. FRAME THE ANSWER — Headline first sentence. Detail after. Never bury the lede.

5. GENERAL BUSINESS Q's — Strategy, copy, frameworks, agency playbooks: answer directly from your training. Cite the framework or thinker by name.

6. DECLINE ONLY — Personal life advice, individual medical/legal advice, or anything wildly off-topic from the agency. Everything business-adjacent is fair game.

DATA HYGIENE
- Format text-mode replies in clean markdown.
- Tool calling will be wired up in Phase 3 — for now, if asked about live agency data, acknowledge you can't fetch it yet and give the strategic answer instead.`;

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

// History trimming: keep first 2 + last 30 messages
function trimHistory(history: any[]): any[] {
  if (history.length <= 32) return history;
  return [...history.slice(0, 2), ...history.slice(-30)];
}

async function buildMemoryBlock(userId: string): Promise<string> {
  const { data } = await admin
    .from("ai_user_memory")
    .select("display_name, brand_voice, priorities, custom_notes")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return "";
  const parts: string[] = [];
  if (data.display_name) parts.push(`Their name: ${data.display_name}.`);
  if (data.brand_voice) parts.push(`Brand voice: ${data.brand_voice}.`);
  if (data.priorities) parts.push(`Current priorities: ${data.priorities}.`);
  if (data.custom_notes) parts.push(`Notes: ${data.custom_notes}.`);
  return parts.length ? `\n\nWHAT YOU REMEMBER ABOUT THEM\n${parts.join(" ")}` : "";
}

async function getUserRole(userId: string): Promise<string | null> {
  const { data } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .order("role")
    .limit(1)
    .maybeSingle();
  return data?.role ?? null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { conversation_id, message, regenerate, current_route } = await req.json();
    if (!conversation_id) return json({ error: "conversation_id required" }, 400);
    if (!regenerate && !message) return json({ error: "message required" }, 400);

    // Verify conversation ownership
    const { data: convo } = await admin
      .from("ai_conversations")
      .select("id, user_id, tenant_id")
      .eq("id", conversation_id)
      .single();
    if (!convo || convo.user_id !== user.id) return json({ error: "Conversation not found" }, 404);

    // Regenerate: delete trailing assistant + tool messages
    if (regenerate) {
      const { data: lastMsgs } = await admin
        .from("ai_messages")
        .select("id, role, created_at")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: false })
        .limit(20);
      const toDelete: string[] = [];
      for (const m of lastMsgs ?? []) {
        if (m.role === "user") break;
        toDelete.push(m.id);
      }
      if (toDelete.length) await admin.from("ai_messages").delete().in("id", toDelete);
    } else {
      await admin.from("ai_messages").insert({
        conversation_id,
        role: "user",
        content: message,
      });
    }

    const { data: history } = await admin
      .from("ai_messages")
      .select("role, content, tool_calls")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true });

    const memoryBlock = await buildMemoryBlock(user.id);
    const role = await getUserRole(user.id);
    const roleBlock = role
      ? `\n\nUSER ROLE\nThey are signed in as: ${role}. Tailor advice to what someone in this role would care about. Finance/revenue specifics are Owner-only — for non-Owner users, give qualitative answers and avoid quoting specific revenue figures.`
      : "";
    const routeBlock = current_route
      ? `\n\nCURRENT PAGE\nThey are viewing: ${current_route}. If they ask about "this page" or "what I'm looking at", reference it.`
      : "";
    const systemPrompt = BASE_SYSTEM_PROMPT + memoryBlock + roleBlock + routeBlock;

    const trimmed = trimHistory(history ?? []);
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...trimmed.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        const send = (event: any) =>
          controller.enqueue(enc.encode(`data: ${JSON.stringify(event)}\n\n`));

        try {
          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages,
              stream: true,
            }),
          });

          if (!resp.ok || !resp.body) {
            if (resp.status === 429) {
              send({
                type: "error",
                code: 429,
                message: "Rate limit. Try again shortly.",
              });
            } else if (resp.status === 402) {
              send({
                type: "error",
                code: 402,
                message: "AI credits exhausted. Top up in workspace settings.",
              });
            } else {
              const t = await resp.text().catch(() => "");
              console.error("AI gateway error:", resp.status, t);
              send({ type: "error", message: "AI gateway error" });
            }
            controller.close();
            return;
          }

          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let assistantText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });

            let nl: number;
            while ((nl = buf.indexOf("\n")) !== -1) {
              let line = buf.slice(0, nl);
              buf = buf.slice(nl + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;
              const payload = line.slice(6).trim();
              if (payload === "[DONE]") continue;
              try {
                const parsed = JSON.parse(payload);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  assistantText += delta;
                  send({ type: "text", delta });
                }
              } catch {
                // partial chunk — re-buffer
                buf = line + "\n" + buf;
                break;
              }
            }
          }

          // Persist final assistant message
          const { data: saved } = await admin
            .from("ai_messages")
            .insert({
              conversation_id,
              role: "assistant",
              content: assistantText,
            })
            .select("id")
            .single();

          send({ type: "done", message_id: saved?.id });
        } catch (e) {
          console.error("clips-chat stream error:", e);
          send({
            type: "error",
            message: e instanceof Error ? e.message : "Stream failed",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("clips-chat error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
