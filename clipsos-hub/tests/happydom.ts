import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Component tests never talk to a real backend, but the Supabase client
// (constructed eagerly by module-level singletons like UploadManager)
// throws at import time when these are absent — e.g. in CI or a fresh
// clone where .env doesn't exist. Provide inert placeholders.
process.env.VITE_SUPABASE_URL ??= "https://placeholder.supabase.co";
process.env.SUPABASE_URL ??= "https://placeholder.supabase.co";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??= "sb_publishable_test_placeholder";
process.env.SUPABASE_PUBLISHABLE_KEY ??= "sb_publishable_test_placeholder";
process.env.VITE_SUPABASE_ANON_KEY ??= "test_placeholder";

GlobalRegistrator.register();
