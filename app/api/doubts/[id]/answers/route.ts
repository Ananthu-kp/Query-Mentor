import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "Only instructors can answer doubts." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Answer content is required." },
        { status: 400 }
      );
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: "Answer must be at least 10 characters long." },
        { status: 400 }
      );
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: "Answer must not exceed 2000 characters." },
        { status: 400 }
      );
    }

    const answer = await db.answer.create({
      data: {
        content: content.trim(),
        doubtId: id,
        authorId: session.user.id!,
      },
      include: {
        author: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    console.error("POST /api/doubts/[id]/answers error:", error);
    return NextResponse.json(
      { error: "Failed to submit answer. Please try again." },
      { status: 500 }
    );
  }
}