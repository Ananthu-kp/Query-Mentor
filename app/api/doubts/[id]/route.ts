import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Update doubt
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to continue." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content } = body;

    // Validation
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    if (title.trim().length < 5 || title.trim().length > 100) {
      return NextResponse.json(
        { error: "Title must be between 5 and 100 characters." },
        { status: 400 }
      );
    }

    if (content.trim().length < 10 || content.trim().length > 1000) {
      return NextResponse.json(
        { error: "Content must be between 10 and 1000 characters." },
        { status: 400 }
      );
    }

    // Check if doubt exists
    const doubt = await db.doubt.findUnique({
      where: { id },
    });

    if (!doubt) {
      return NextResponse.json(
        { error: "Doubt not found." },
        { status: 404 }
      );
    }

    // Check ownership
    if (
      doubt.authorId !== session.user.id &&
      session.user.role !== "INSTRUCTOR"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to edit this doubt." },
        { status: 403 }
      );
    }

    const updatedDoubt = await db.doubt.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(updatedDoubt, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/doubts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update doubt. Please try again." },
      { status: 500 }
    );
  }
}

// Delete doubt
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to continue." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if doubt exists
    const doubt = await db.doubt.findUnique({
      where: { id },
    });

    if (!doubt) {
      return NextResponse.json(
        { error: "Doubt not found." },
        { status: 404 }
      );
    }

    // Check ownership
    if (
      doubt.authorId !== session.user.id &&
      session.user.role !== "INSTRUCTOR"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to delete this doubt." },
        { status: 403 }
      );
    }

    await db.doubt.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Doubt deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/doubts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete doubt. Please try again." },
      { status: 500 }
    );
  }
}