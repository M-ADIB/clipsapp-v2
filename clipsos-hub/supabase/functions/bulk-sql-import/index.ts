import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * bulk-sql-import — RETIRED.
 *
 * This function previously executed arbitrary SQL from the request body using
 * the service-role key with no authorization, which is a critical remote-code
 * (arbitrary DB read/write/DDL) hole. It has been permanently disabled.
 *
 * Follow-up (requires DB access): drop / REVOKE EXECUTE on the `exec_sql` RPC
 * this function depended on, so it cannot be invoked from anywhere else.
 */
Deno.serve(() => {
  return new Response(
    JSON.stringify({
      message:
        "bulk-sql-import has been permanently disabled for security reasons.",
      status: "retired",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json" },
    },
  );
});
