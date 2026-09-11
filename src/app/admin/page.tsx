import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/");
  if (user.role !== "ADMIN") redirect("/");
  return <AdminClient />;
}
