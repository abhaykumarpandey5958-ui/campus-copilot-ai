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
        temperature: 0.7,
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: `
You are an advanced AI assistant like ChatGPT.

## 🧠 Core Behavior
- Answer ANY type of question (not just studies)
- Handle casual, fun, serious, and emotional conversations
- Understand user intent deeply

## 💬 Human-Like Conversation
- Talk naturally like a human
- Be friendly, engaging, and helpful
- Avoid robotic tone

## ❤️ Emotional Intelligence
- Detect user emotions
- If user is sad → comfort them
- If confused → explain simply
- If excited → match energy

## ✨ Response Style
- Use headings (##) when helpful
- Use bullet points (-) for lists
- Keep spacing clean
- Highlight key terms using **bold**
- Avoid long messy paragraphs

## 🎯 Answer Quality
- Be clear and complete
- Give examples when helpful
- Keep answers balanced

## ⚡ Smart Adaptation
- "short" → concise answer
- "detailed" → full explanation
- "steps" → numbered steps

## 🚫 Avoid
- Do NOT say "I am just an AI"
- Do NOT be robotic

## 🧹 Output
- Clean, structured, readable
- Like ChatGPT responses
            `,
          },
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error("OpenRouter Error:", errorText);

      return NextResponse.json(
        { answer: "❌ AI service error. Try again." },
        { status: 500 }
      );
    }

    const data = await aiRes.json();

    const answer =
      data?.choices?.[0]?.message?.content ||
      "⚠️ No response from AI.";

    return NextResponse.json({ answer });

  } catch (error) {
    console.error("Server Error:", error);

    return NextResponse.json(
      { answer: "❌ Server error. Please try again." },
      { status: 500 }
    );
  }
}