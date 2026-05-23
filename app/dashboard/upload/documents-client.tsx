"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState, useCallback, useTransition } from "react";
import {
  CheckCircle,
  FileText,
  Loader2,
  Upload,
  XCircle,
  Trash2,
  UploadCloud,
  FileCode2,
  Database,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteDocumentAction, type DocumentRow } from "@/lib/actions/document";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ALLOWED_EXTENSIONS = [".txt", ".md"] as const;
const ALLOWED_MIME_TYPES = [
  "text/plain",
  "text/markdown",
  "text/x-markdown",
] as const;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function validateFile(file: File): string | null {
  const ext = ("." + file.name.split(".").pop()?.toLowerCase()) as string;
  if (
    !ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])
  ) {
    return `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
  }
  if (
    !ALLOWED_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_MIME_TYPES)[number]
    )
  ) {
    if (file.type !== "" && file.type !== "application/octet-stream") {
      return `Unsupported MIME type "${file.type}".`;
    }
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large (${humanSize(file.size)}). Maximum is 10 MB.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Upload Stage type
// ---------------------------------------------------------------------------
type UploadStage = "idle" | "uploading" | "done" | "error";

// ---------------------------------------------------------------------------
// Drop zone sub-component
// ---------------------------------------------------------------------------
function DropZone({
  onFile,
  disabled,
}: {
  onFile: (f: File) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onFile(files[0]);
    },
    [onFile]
  );

  return (
    <div
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      id="upload-dropzone"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={[
        "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 cursor-pointer",
        "transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled
          ? "opacity-40 cursor-not-allowed border-border"
          : dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/60 hover:bg-accent/30",
      ].join(" ")}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
        <Upload className="size-6 text-primary" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-semibold text-foreground text-sm">
          Drop your document here
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse &mdash; .txt &amp; .md, up to 10 MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload Dialog
// ---------------------------------------------------------------------------
function UploadDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setSelectedFile(null);
    setUploadedFilename(null);
    setErrorMsg(null);
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      setStage("error");
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    setUploadedFilename(null);

    try {
      setStage("uploading");
      setProgress(0);

      await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload/token",
        onUploadProgress: ({ percentage }) => {
          setProgress(percentage / 100);
          if (percentage >= 100) {
            setUploadedFilename(file.name);
            setStage("done");
          }
        },
      });

      // Ensure done state if the callback didn't fire at 100
      setUploadedFilename(file.name);
      setStage("done");
    } catch (err) {
      console.error("[upload dialog] upload error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setStage("error");
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg rounded-3xl gap-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="size-5 text-primary" />
            Upload Documentation
          </DialogTitle>
          <DialogDescription>
            Upload a plain-text or Markdown file. It will be chunked and indexed
            for use as reference material in the chatbot.
          </DialogDescription>
        </DialogHeader>

        {/* Idle / Error — show drop zone */}
        {(stage === "idle" || stage === "error") && (
          <div className="space-y-4">
            <DropZone onFile={handleFile} disabled={false} />
            {stage === "error" && errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <XCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Uploading */}
        {stage === "uploading" && (
          <div className="space-y-4">
            {selectedFile && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <FileText className="size-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {humanSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  Uploading &amp; indexing…
                </span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-200 rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Done */}
        {stage === "done" && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <CheckCircle className="size-10 text-emerald-500" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">
                Document uploaded successfully!
              </p>
              {uploadedFilename && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {uploadedFilename}
                  </span>{" "}
                  is being processed in the background.
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {stage === "done" ? (
            <>
              <Button
                id="upload-another-btn"
                variant="outline"
                className="rounded-xl"
                onClick={reset}
              >
                Upload Another
              </Button>
              <Button
                id="upload-done-btn"
                className="rounded-xl"
                onClick={() => {
                  onSuccess();
                  handleClose(false);
                }}
              >
                Done
              </Button>
            </>
          ) : (
            <DialogClose render={<Button variant="outline" className="rounded-xl">Cancel</Button>} />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation Dialog
// ---------------------------------------------------------------------------
function DeleteDocumentDialog({
  doc,
  onClose,
}: {
  doc: DocumentRow | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!doc) return;
    const formData = new FormData();
    formData.set("documentId", doc.id);
    startTransition(async () => {
      await deleteDocumentAction(formData);
      router.refresh();
      onClose();
    });
  };

  return (
    <Dialog open={!!doc} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">&quot;{doc?.filename}&quot;</strong>?
            This will remove all associated chunks and the file from storage.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 pt-2">
          <DialogClose render={<Button variant="outline" className="rounded-xl" disabled={isPending}>Cancel</Button>} />
          <Button
            id="delete-document-confirm-btn"
            variant="destructive"
            className="rounded-xl"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------
export default function DocumentsClient({
  documents,
}: {
  documents: DocumentRow[];
}) {
  const router = useRouter();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<DocumentRow | null>(null);

  const handleUploadSuccess = () => {
    // Refresh server data to show the new document
    router.refresh();
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Documentation Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the reference documents used by the RAG chatbot.
          </p>
        </div>
        <Button
          id="open-upload-dialog-btn"
          className="rounded-xl gap-2"
          onClick={() => setUploadOpen(true)}
        >
          <UploadCloud className="size-4" />
          Upload Document
        </Button>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-6 py-4 shrink-0">
        <StatCard
          icon={<FileCode2 className="size-5 text-primary" />}
          label="Total Documents"
          value={documents.length}
        />
        <StatCard
          icon={<Database className="size-5 text-violet-500" />}
          label="Total Chunks"
          value={documents.reduce((sum, d) => sum + d.chunkCount, 0)}
        />
        <StatCard
          icon={<FileText className="size-5 text-sky-500" />}
          label="Storage Used"
          value={humanSize(documents.reduce((sum, d) => sum + d.sizeBytes, 0))}
          valueClassName="tabular-nums"
        />
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="px-6 pb-6 flex-1">
        <div className="rounded-2xl border border-border overflow-hidden bg-card">
          {documents.length === 0 ? (
            <EmptyState onUpload={() => setUploadOpen(true)} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border bg-muted/30">
                  <TableHead className="pl-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Filename
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold hidden sm:table-cell">
                    Type
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold hidden md:table-cell">
                    Size
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold hidden lg:table-cell">
                    Chunks
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold hidden md:table-cell">
                    Uploaded
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold text-right pr-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="group">
                    {/* Filename */}
                    <TableCell className="pl-4 max-w-[200px]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="size-4 text-primary" />
                        </div>
                        <span
                          className="truncate text-sm font-medium text-foreground"
                          title={doc.filename}
                        >
                          {doc.filename}
                        </span>
                      </div>
                    </TableCell>

                    {/* Type badge */}
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="font-mono text-[10px] rounded-lg">
                        {doc.mimeType === "text/plain" ? ".txt" : ".md"}
                      </Badge>
                    </TableCell>

                    {/* Size */}
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground tabular-nums">
                      {humanSize(doc.sizeBytes)}
                    </TableCell>

                    {/* Chunk count */}
                    <TableCell className="hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Database className="size-3.5 text-violet-500/70" />
                        {doc.chunkCount.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Uploaded at */}
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {formatDate(doc.uploadedAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-4 text-right">
                      <Button
                        id={`delete-doc-${doc.id}`}
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteDoc(doc)}
                        title={`Delete ${doc.filename}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={handleUploadSuccess}
      />
      <DeleteDocumentDialog
        doc={deleteDoc}
        onClose={() => setDeleteDoc(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card sub-component
// ---------------------------------------------------------------------------
function StatCard({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className={`text-lg font-bold text-foreground leading-none mt-0.5 ${valueClassName ?? ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state sub-component
// ---------------------------------------------------------------------------
function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/60">
        <FileText className="size-8 text-muted-foreground/50" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">No documents yet</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Upload your first reference document to get started. The chatbot will
          use it when answering questions.
        </p>
      </div>
      <Button
        id="empty-state-upload-btn"
        className="rounded-xl gap-2 mt-2"
        onClick={onUpload}
      >
        <UploadCloud className="size-4" />
        Upload your first document
      </Button>
    </div>
  );
}
