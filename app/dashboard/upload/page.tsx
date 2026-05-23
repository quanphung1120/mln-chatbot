import { getDocuments } from "@/lib/actions/document";
import DocumentsClient from "./documents-client";

// ---------------------------------------------------------------------------
// Server Component — fetch documents and pass to client
// ---------------------------------------------------------------------------
export default async function DocumentsPage() {
  const documents = await getDocuments();
  return <DocumentsClient documents={documents} />;
}
