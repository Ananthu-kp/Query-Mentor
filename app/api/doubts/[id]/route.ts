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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await params
    const { title, content } = await request.json();

    // Check if user owns this doubt
    const doubt = await db.doubt.findUnique({
      where: { id },
    });

    if (!doubt) {
      return NextResponse.json({ error: "Doubt not found" }, { status: 404 });
    }

    if (doubt.authorId !== session.user.id && session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedDoubt = await db.doubt.update({
      where: { id },
      data: { title, content },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(updatedDoubt);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update doubt" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // Await params

    // Check if user owns this doubt
    const doubt = await db.doubt.findUnique({
      where: { id },
    });

    if (!doubt) {
      return NextResponse.json({ error: "Doubt not found" }, { status: 404 });
    }

    if (doubt.authorId !== session.user.id && session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.doubt.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Doubt deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete doubt" },
      { status: 500 }
    );
  }
}