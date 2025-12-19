import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "Only instructors can use AI suggestions." },
        { status: 403 }
      );
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI service is not configured. Please contact administrator." },
        { status: 503 }
      );
    }

    // Call Groq API (OpenAI compatible)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Free and fast model
        messages: [
          {
            role: "system",
            content: "You are a helpful and knowledgeable instructor. Provide clear, comprehensive, and educational answers to student questions."
          },
          {
            role: "user",
            content: `A student has asked the following question:

Title: ${title}

Question: ${content}

Please provide a clear, comprehensive, and educational answer that:
1. Directly addresses the student's question
2. Explains the concept in simple terms
3. Provides examples if relevant
4. Is encouraging and supportive

Keep your answer concise but thorough (aim for 2-4 paragraphs).`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Groq API error:", errorData);
      throw new Error("AI service returned an error");
    }

    const data = await response.json();
    const suggestedAnswer = data.choices[0].message.content;

    return NextResponse.json(
      { suggestion: suggestedAnswer },
      { status: 200 }
    );
  } catch (error) {
    console.error("AI suggestion error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate AI suggestion. Please try again.",
      },
      { status: 500 }
    );
  }
}