import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    const raw = await req.text();
    console.log("RAW BODY:", raw);

    let text = "";
    try {
      ({ text } = JSON.parse(raw));
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    const prompt = `
You're a smart travel assistant extracting flight information from noisy OCR outputs of boarding passes or e-tickets.

Your task: Extract the following fields as clean JSON:
- from_airport (IATA code or city)
- to_airport (IATA code or city)
- airline (full name if possible)
- flight_number
- date (ISO 8601 format: YYYY-MM-DD)

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
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert travel assistant that extracts structured JSON data from noisy boarding pass OCR text.",
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

    // Extract JSON from response text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Could not parse JSON." };

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("Error in Edge Function:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: err.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});