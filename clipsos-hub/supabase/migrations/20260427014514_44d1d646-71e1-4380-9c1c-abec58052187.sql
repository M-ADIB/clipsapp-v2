-- ============================================================================
-- Ask Clips — AI chat foundation
-- ============================================================================

-- 1. ai_conversations: one eternal conversation per user (Jarvis pattern)
CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '__primary__',
  pinned boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_conversations_user ON public.ai_conversations(user_id, updated_at DESC);
CREATE INDEX idx_ai_conversations_tenant ON public.ai_conversations(tenant_id);
CREATE INDEX idx_ai_conversations_user_active
  ON public.ai_conversations(user_id, pinned DESC, updated_at DESC)
  WHERE deleted_at IS NULL;

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AI conversations"
  ON public.ai_conversations
  FOR ALL TO authenticated
  USING (user_id = auth.uid() AND tenant_id = public.tenant_id_for_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND tenant_id = public.tenant_id_for_user(auth.uid()));

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. ai_messages: chat history
CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content text NOT NULL DEFAULT '',
  tool_calls jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_messages_conversation ON public.ai_messages(conversation_id, created_at);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage messages in own conversations"
  ON public.ai_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- Bump conversation updated_at whenever a new message is inserted
CREATE OR REPLACE FUNCTION public.touch_ai_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_touch_ai_conversation
  AFTER INSERT ON public.ai_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_ai_conversation();

-- 3. ai_user_memory: persistent context per user
CREATE TABLE public.ai_user_memory (
  user_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  display_name text,
  brand_voice text,
  priorities text,
  custom_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_user_memory_tenant ON public.ai_user_memory(tenant_id);

ALTER TABLE public.ai_user_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AI memory"
  ON public.ai_user_memory
  FOR ALL TO authenticated
  USING (user_id = auth.uid() AND tenant_id = public.tenant_id_for_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND tenant_id = public.tenant_id_for_user(auth.uid()));

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.ai_user_memory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. ai_tool_calls: audit log of tool invocations
CREATE TABLE public.ai_tool_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.ai_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  arguments jsonb,
  result_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_tool_calls_user ON public.ai_tool_calls(user_id, created_at DESC);
CREATE INDEX idx_ai_tool_calls_tenant ON public.ai_tool_calls(tenant_id);
CREATE INDEX idx_ai_tool_calls_message ON public.ai_tool_calls(message_id);

ALTER TABLE public.ai_tool_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own AI tool calls"
  ON public.ai_tool_calls
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND tenant_id = public.tenant_id_for_user(auth.uid()));
