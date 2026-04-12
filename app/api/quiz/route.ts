export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

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
          {
            role: "user",
            content: `Create 5 Multiple Choice Questions (MCQ) on ${topic}.
            
Return ONLY a valid JSON array of objects. 
JSON Format:
[
 { "question": "string", "options": ["A","B","C","D"], "answer": "correct_option_string" }
]

Do not include any other text.`,
          },
        ],
      }),
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Quiz API Error:", err);
        return Response.json({ error: "Failed to generate quiz" }, { status: 500 });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "[]";
    
    // basic cleanup in case AI includes markdown code blocks
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    return Response.json({
      quiz: content,
    });

  } catch (err) {
    console.error("Quiz Server Error:", err);
    return Response.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}