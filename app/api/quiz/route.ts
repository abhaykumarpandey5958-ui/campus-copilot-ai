export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Create 5 MCQ questions on ${topic}.
Return ONLY JSON:
[
 { "question": "", "options": ["A","B","C","D"], "answer": "" }
]`,
          },
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      quiz: data.choices?.[0]?.message?.content || "[]",
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}