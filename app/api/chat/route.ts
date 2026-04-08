import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = body?.question?.trim();

    if (!question) {
      return NextResponse.json(
        { answer: "⚠️ Please enter a question." },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { answer: "❌ API key not configured." },
        { status: 500 }
      );
    }

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant.",
          },
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      return NextResponse.json(
        { answer: "❌ AI error" },
        { status: 500 }
      );
    }

    const data = await aiRes.json();
    const answer = data?.choices?.[0]?.message?.content || "No response";

    return NextResponse.json({ answer });

  } catch {
    return NextResponse.json(
      { answer: "❌ Server error" },
      { status: 500 }
    );
  }
}