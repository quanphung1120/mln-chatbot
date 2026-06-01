import { auth, clerkClient } from "@clerk/nextjs/server";
import { getDocuments } from "@/features/documents/actions";
import DocumentsClient from "@/features/documents/components/documents-client";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Server Component — fetch documents and pass to client
// ---------------------------------------------------------------------------
export default async function DocumentsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (user.publicMetadata?.role !== "admin") {
    redirect("/dashboard");
  }

  const documents = await getDocuments();
  return <DocumentsClient documents={documents} />;
}
