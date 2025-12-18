import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getAuthSession();

  if (!session?.user?.role) redirect("/auth/login");

  if (session.user.role === "INSTRUCTOR") {
    redirect("/dashboard/instructor");
  }

  redirect("/dashboard/student");
}