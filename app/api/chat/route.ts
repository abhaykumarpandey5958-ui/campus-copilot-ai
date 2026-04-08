import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = body?.question?.trim();

    // ❗ Validate input
    if (!question) {
      return NextResponse.json(
        { answer: "⚠️ Please enter a question." },
        { status: 400 }
      );
    }

    // 🔥 Call OpenRouter API
    const aiRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          temperature: 0.7,
          max_tokens: 1000,

          messages: [
            {
              role: "system",
              content: `
You are a highly intelligent and helpful AI assistant.

## 🧠 Understanding User Intent
- If user asks "in points" → give bullet points
- If user asks "short" → give short answer
- If user asks "detailed" → give full explanation
- Automatically adapt to user's style

## ✨ Formatting Rules
- Use headings (##)
- Use subheadings (###)
- Use bullet points (-)
- Keep spacing clean
- Avoid long paragraphs

## 🎯 Answer Quality
- ALWAYS give complete answers
- Answer ALL parts of the question
- Use simple language
- Highlight important terms using **bold**
- Add examples when helpful

## ⚡ Smart Behavior
- If vague → assume best intent and answer fully
- Be clear and confident

## 🧹 Output Style
- Clean spacing like ChatGPT/Gemini
- No unnecessary symbols
- Structured formatting
- End neatly

## 🧩 Special Instructions
- "step by step" → numbered steps
- "formula" → include formulas clearly
- "beginner" → simplify explanation
`,
            },
            {
              role: "user",
              content: question,
            },
          ],
        }),
      }
    );

    // ❗ Handle API error
    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error("OpenRouter Error:", errorText);

      return NextResponse.json(
        { answer: "❌ AI service error. Try again later." },
        { status: 500 }
      );
    }

    const data = await aiRes.json();

    // ✅ Extract response
    const answer =
      data?.choices?.[0]?.message?.content ||
      "⚠️ No response from AI.";

    return NextResponse.json({ answer }, { status: 200 });

  } catch (error) {
    console.error("Server Error:", error);

    return NextResponse.json(
      { answer: "❌ Server error. Please try again." },
      { status: 500 }
    );
  }
}