// Lovable AI assistant edge function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  email: `You are a Smart Email Generator. Write professional emails based on the user's brief.
- Adapt tone (formal, informal, persuasive) and audience (client, manager, team) when specified.
- Output a complete email with: Subject line, greeting, body, and sign-off.
- Use Markdown. Keep it clear, concise, and ready to send.
- If critical info is missing, briefly note assumptions at the end.`,
  summarize: `You are a Meeting Notes Summarizer. Summarize the provided notes into a clear structured Markdown output:
## Summary
A 2-4 sentence overview.
## Key Points
Bullet list of the most important points.
## Decisions
Bullet list of decisions made.
## Action Items
A markdown table with columns: Task | Owner | Deadline. Use "—" if unknown.
## Risks / Open Questions
Bullets, only if applicable.
Keep it tight and skimmable.`,
  planner: `You are an AI Task Planner. From the user's tasks/goals, build a prioritized schedule.
Output Markdown:
## Priorities (Eisenhower)
- **Urgent & Important**, **Important / Not Urgent**, **Urgent / Not Important**, **Neither** — bullet each task under the right bucket.
## Schedule
A markdown table with: Time | Task | Focus Level. Use realistic time blocks (default a workday 9:00–17:30 unless otherwise specified).
## Productivity Tips
3 specific, actionable suggestions tailored to the tasks.
Be concise and practical.`,
  research: `You are a Research Assistant. Summarize complex information into clear insights.
Output Markdown:
## TL;DR
2-3 sentences.
## Key Findings
Bulleted list with brief explanations.
## Recommendations
Numbered, actionable steps.
## Caveats
Note uncertainty, gaps, or where the user should verify.
Use plain professional language.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tool, input } = await req.json();
    const systemPrompt = SYSTEM_PROMPTS[tool as string];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "Unknown tool" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!input || typeof input !== "string" || !input.trim()) {
      return new Response(JSON.stringify({ error: "Input is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input },
          ],
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error:
              "AI credits exhausted. Please add funds to your Lovable workspace.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("assistant error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
