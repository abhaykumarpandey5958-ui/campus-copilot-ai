export const runtime = "nodejs";

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
Answer this question for ${type}-mark exam.

Format:
- Title
- Definition
- Key Points
- Conclusion

Question: ${question}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      answer: data.choices?.[0]?.message?.content || "No answer",
    });

  } catch (error) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}