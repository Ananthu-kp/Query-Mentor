import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET all doubts
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(doubts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch doubts" },
      { status: 500 }
    );
  }
}

// POST create new doubt
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const doubt = await db.doubt.create({
      data: {
        title,
        content,
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
    return NextResponse.json(
      { error: "Failed to create doubt" },
      { status: 500 }
    );
  }
}