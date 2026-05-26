import "jsr:@supabase/functions-js/edge-runtime.d.ts";
Deno.serve(async ()=>{
  return new Response(JSON.stringify({
    message: 'Migration complete. This function is now disabled.',
    status: 'retired'
  }), {
    status: 410,
    headers: {
      'Content-Type': 'application/json'
    }
  });
});
