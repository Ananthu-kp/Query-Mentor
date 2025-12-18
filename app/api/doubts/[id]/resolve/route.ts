import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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

    const doubt = await db.doubt.update({
      where: { id },
      data: { status: "RESOLVED" },
    });

    return NextResponse.json(doubt);
  } catch (error) {
    console.error("Resolve error:", error);
    return NextResponse.json(
      { error: "Failed to resolve doubt" },
      { status: 500 }
    );
  }
}