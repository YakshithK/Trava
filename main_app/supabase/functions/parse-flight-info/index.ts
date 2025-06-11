import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

function isDate2BeforeDate1(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d2 < d1;
}


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
    console.log("[parse-flight-info] Received request:", req.method, req.url);
    try {
      console.log("[parse-flight-info] Received request1:", req.method, req.url);
      const formData = await req.formData();
      const imageFile = formData.get("image") as File; // This is valid in Deno Edge Functions

      // Use directly in new FormData
      const uploadForm = new FormData();
      uploadForm.append("image", imageFile); // no need to reconstruct

      console.log(uploadForm)
      const response1 = await fetch("https://kqrvuazjzcnlysbrndmq.supabase.co/functions/v1/get-ocr", {
        method: "POST",
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxcnZ1YXpqemNubHlzYnJuZG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4OTM4MTksImV4cCI6MjA2MjQ2OTgxOX0.Q8ZwRfb3mxIkFHZT2gPUR5KsANNvXi1v1Cjnm3YFW9U`,
        },
        body: uploadForm,
      });

      const result = await response1.json();
      console.log("OCR & GPT response:", result);

      const text = result.text;

    const prompt = `
    You're a smart travel assistant extracting flight information from noisy OCR outputs of boarding passes or e-tickets.

    Your task: Extract the following fields as clean JSON:
    - from_airport (IATA code strictly)
    - to_airport (IATA code strictly)
    - airline (full name if possible)
    - flight_number (or identifier )
    - date (MM-DD)

    Example OCR text:
    """
    ${text}
    """

    Return **only** valid JSON. No markdown. No explanations.
    If you are unsure about any field, return null for it.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content:
              `You are an expert travel assistant that extracts structured JSON data from noisy boarding pass OCR text. by the way the date right now is ${Date.now().toString()} so use this to help you determine the date of the flight. for example if the day has already passed the current year, its obvisously the year after the year.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";

    // Extract JSON from GPT output
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Could not parse JSON." };

    const date = parsed.date 

    if (date && !isDate2BeforeDate1(new Date().toISOString(), date)) {
      parsed.date = new Date().getFullYear().toString() + "-" + date 
    } else {
      parsed.date = (new Date().getFullYear()+1).toString() + "-" + date 
    }
    const finalJson = JSON.stringify(parsed);

    return new Response(finalJson, {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
      console.error("[parse-flight-info] Error calling edge function:", error);
  } 

  } catch (err) {
    console.error("[parse-flight-info] Error in Edge Function:", err);
    return new Response(JSON.stringify({
      error: "Internal error",
      details: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
