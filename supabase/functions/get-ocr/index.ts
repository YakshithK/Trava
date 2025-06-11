import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "Missing 'image' in form data." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const ocrForm = new FormData();
    ocrForm.append("apikey", "K86959559988957"!);
    ocrForm.append("language", "eng");
    ocrForm.append("isOverlayRequired", "false");
    ocrForm.append("file", new Blob([await file.arrayBuffer()], { type: file.type }), file.name);

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: ocrForm,
    });

    const ocrJson = await ocrResponse.json();
    const text = ocrJson?.ParsedResults?.[0]?.ParsedText?.trim() || "";

    const finalJson = JSON.stringify({text: text});

    return new Response(finalJson, {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (err) {
    console.error("[get-ocr] Error in Edge Function:", err);
    return new Response(JSON.stringify({
      error: "Internal error",
      details: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
