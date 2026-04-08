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
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          max_tokens: 1000,
        }),
      }
    );

    const data = await res.json();

    return Response.json({
      answer:
        data?.choices?.[0]?.message?.content ||
        "No response",
    });

  } catch (error) {
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}