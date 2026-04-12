import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, type } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question required" },
        { status: 400 }
      );
    }

    const prompt = `
Answer this question for a ${type}-mark exam.

Format:
## Title
## Definition
## Key Points
## Conclusion

Question: ${question}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
          { role: "user", content: prompt }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("AI Error:", err);
        return NextResponse.json({ error: "API Failure" }, { status: 500 });
    }

    return new Response(response.body, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    });

  } catch (error) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}