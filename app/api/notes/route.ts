export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const systemPrompt = `
You are an expert study assistant.

Convert notes into:
- Clear summary
- Bullet points
- Key concepts
- Simple explanation

Format:
## Summary
## Key Points
## Important Concepts
`;

    const res = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://campuscilot.vercel.app",
          "X-Title": "Campus Copilot",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-nano-12b-v2-vl:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          max_tokens: 1500,
          stream: true,
        }),
      }
    );

    if (!res.ok) {
        const err = await res.text();
        console.error("Notes OpenRouter Error:", err);
        return Response.json({ error: "API Failure" }, { status: 500 });
    }

    return new Response(res.body, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    });

  } catch (error) {
    console.error("Notes Server Error:", error);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}