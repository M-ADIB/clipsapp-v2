/**
 * use-primary-conversation — find-or-create one eternal Ask Clips conversation per user.
 *
 * All Ask Clips messages append to this single row, mirroring the Jarvis pattern
 * from Hormone Harmony Hub. Title is always `__primary__` so we can find it back
 * regardless of any auto-titling we add later.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PRIMARY_TITLE = "__primary__";

export function usePrimaryConversation() {
  const { user, tenantId } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !tenantId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);

      const { data: existing } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", PRIMARY_TITLE)
        .is("deleted_at", null)
        .maybeSingle();

      if (existing) {
        if (!cancelled) {
          setConversationId(existing.id);
          setLoading(false);
        }
        return;
      }

      const { data: created } = await supabase
        .from("ai_conversations")
        .insert({ user_id: user.id, tenant_id: tenantId, title: PRIMARY_TITLE })
        .select("id")
        .single();

      if (!cancelled) {
        if (created) setConversationId(created.id);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, tenantId]);

  return { conversationId, loading };
}
