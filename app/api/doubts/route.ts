import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET all doubts
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to continue." },
        { status: 401 }
      );
    }

    let doubts;

    if (session.user.role === "INSTRUCTOR") {
      // Instructors see all doubts
      doubts = await db.doubt.findMany({
        include: {
          author: {
            select: { name: true, email: true },
          },
          answers: {
            include: {
              author: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Students see only their own doubts
      doubts = await db.doubt.findMany({
        where: { authorId: session.user.id },
        include: {
          answers: {
            include: {
              author: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(doubts, { status: 200 });
  } catch (error) {
    console.error("GET /api/doubts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doubts. Please try again later." },
      { status: 500 }
    );
  }
}

// POST create new doubt
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can create doubts." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    // Validation
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    if (title.trim().length < 5) {
      return NextResponse.json(
        { error: "Title must be at least 5 characters long." },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: "Title must not exceed 100 characters." },
        { status: 400 }
      );
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: "Content must be at least 10 characters long." },
        { status: 400 }
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: "Content must not exceed 1000 characters." },
        { status: 400 }
      );
    }

    const doubt = await db.doubt.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId: session.user.id!,
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(doubt, { status: 201 });
  } catch (error) {
    console.error("POST /api/doubts error:", error);
    return NextResponse.json(
      { error: "Failed to create doubt. Please try again." },
      { status: 500 }
    );
  }
}