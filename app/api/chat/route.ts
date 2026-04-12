import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = body?.question?.trim();
    const image: string | undefined = body?.image; // Expected to be a base64 string "data:image/jpeg;base64,..."

    if (!question && !image) {
      return NextResponse.json(
        { answer: "⚠️ Please enter a question or upload an image." },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { answer: "❌ API key not configured." },
        { status: 500 }
      );
    }

    // Construct user content payload
    let userContent: string | { type: string; text?: string; image_url?: { url: string } }[] = question;
    
    if (image) {
      userContent = [];
      if (question) {
        userContent.push({ type: "text", text: question });
      }
      userContent.push({
        type: "image_url",
        image_url: { url: image },
      });
    }

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://campuscilot.vercel.app",
        "X-Title": "Campus Copilot",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-nano-12b-v2-vl:free",
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
        messages: [
          {
            role: "system",
            content: `
You are an advanced AI assistant with vision capabilities.

## 🧠 Core Behavior
- Answer ANY type of question (not just studies)
- Handle casual, fun, serious, and emotional conversations
- If an image is provided, analyze it deeply and answer the user's prompt based on the image.

## 💬 Human-Like Conversation
- Talk naturally like a human
- Be friendly, engaging, and helpful

## ✨ Response Style
- Use headings (##) when helpful
- Use bullet points (-) for lists
- Highlight key terms using **bold**
- Avoid long messy paragraphs

## 🧹 Output
- Clean, structured, readable markdown
            `,
          },
          {
            role: "user",
            content: userContent,
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

    return new NextResponse(aiRes.body as ReadableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    console.error("Server Error:", error);

    return NextResponse.json(
      { answer: "❌ Server error. Please try again." },
      { status: 500 }
    );
  }
}