import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const status = searchParams.get("status") || "ALL";

    let whereClause: any = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    };

    if (status !== "ALL") {
      whereClause.status = status;
    }

    // Students only see their own doubts or resolved doubts
    if (session.user.role === "STUDENT") {
      whereClause.OR = [
        { authorId: session.user.id },
        { status: "RESOLVED" },
      ];
    }

    const doubts = await db.doubt.findMany({
      where: whereClause,
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
      take: 50,
    });

    return NextResponse.json(doubts);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search doubts" },
      { status: 500 }
    );
  }
}