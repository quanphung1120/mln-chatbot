"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState, useCallback } from "react";
import { CheckCircle, FileText, Loader2, Upload, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Stage = "idle" | "uploading" | "processing" | "done" | "error";

interface UploadResult {
  documentId: string;
  chunkCount: number;
}

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

function validateFile(file: File): string | null {
  const ext = ("." + file.name.split(".").pop()?.toLowerCase()) as string;
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return `Unsupported file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    // Some OSes report empty MIME for .md — allow it as long as extension is OK
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
// Step indicator
// ---------------------------------------------------------------------------
const STEPS: { id: Stage; label: string }[] = [
  { id: "uploading", label: "Uploading to storage" },
  { id: "processing", label: "Chunking document" },
  { id: "done", label: "Saved to database" },
];

function StepList({ stage }: { stage: Stage }) {
  const order: Stage[] = ["uploading", "processing", "done"];
  const currentIndex = order.indexOf(stage);

  return (
    <ol className="space-y-3 w-full max-w-sm">
      {STEPS.map(({ id, label }, i) => {
        const isPast = currentIndex > i;
        const isActive = currentIndex === i;
        const isError = stage === "error" && isActive;

        return (
          <li key={id} className="flex items-center gap-3">
            <span
              className={[
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                isPast
                  ? "bg-emerald-500 text-white"
                  : isActive && !isError
                  ? "bg-primary text-primary-foreground"
                  : isError
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {isPast ? (
                <CheckCircle className="size-4" />
              ) : isActive && !isError ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isError ? (
                <XCircle className="size-4" />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={[
                "text-sm transition-colors",
                isPast
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : isActive && !isError
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Drop zone
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
        "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer",
        "transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled
          ? "opacity-40 cursor-not-allowed border-border"
          : dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/60 hover:bg-accent/30",
      ].join(" ")}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Upload className="size-7 text-primary" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-semibold text-foreground">
          Drop your document here
        </p>
        <p className="text-sm text-muted-foreground">
          or click to browse &mdash; .txt &amp; .md, up to 10 MB
        </p>
      </div>
      {/* Hidden native file input */}
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
// Main page
// ---------------------------------------------------------------------------
export default function UploadPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setSelectedFile(null);
    setResult(null);
    setErrorMsg(null);
  };

  const handleFile = useCallback(async (file: File) => {
    // Client-side validation
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMsg(validationError);
      setStage("error");
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    setResult(null);

    try {
      // ── Step 1: upload to Vercel Blob ──────────────────────────────────
      setStage("uploading");
      setProgress(0);

      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload/token",
        onUploadProgress: ({ percentage }) => {
          setProgress(Math.round(percentage));
        },
      });

      // ── Step 2: Poll ingestion status from API ──────────────────────────
      setStage("processing");

      const pollIntervalMs = 1000;
      const maxAttempts = 30;
      let attempts = 0;
      let ingestData: UploadResult | null = null;

      while (attempts < maxAttempts) {
        attempts++;
        const pollRes = await fetch(
          `/api/documents?blobUrl=${encodeURIComponent(blob.url)}`
        );

        if (!pollRes.ok) {
          const data = await pollRes.json().catch(() => ({}));
          throw new Error(
            (data as { error?: string }).error ?? "Ingestion status check failed."
          );
        }

        const data = (await pollRes.json()) as {
          status: "pending" | "completed";
          documentId?: string;
          chunkCount?: number;
          error?: string;
        };

        if (data.status === "completed") {
          ingestData = {
            documentId: data.documentId!,
            chunkCount: data.chunkCount!,
          };
          break;
        }

        // Wait before next check
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      }

      if (!ingestData) {
        throw new Error("Ingestion processing timed out. Please try again or contact support.");
      }

      // ── Step 3: done ───────────────────────────────────────────────────
      setStage("done");
      setResult(ingestData);
    } catch (err) {
      // Log technical detail for developers, show generic message to user
      console.error("[upload page] workflow error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setStage("error");
    }
  }, []);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-0 p-6 md:p-12">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Upload a Document
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload a plain-text or Markdown file. It will be chunked by
            sentence and stored for use as reference material.
          </p>
        </div>

        {/* Drop zone — visible while idle or on error */}
        {(stage === "idle" || stage === "error") && (
          <DropZone onFile={handleFile} disabled={false} />
        )}

        {/* Error message */}
        {stage === "error" && errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <XCircle className="size-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* In-progress steps */}
        {(stage === "uploading" || stage === "processing") && (
          <div className="space-y-6">
            {/* File info */}
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

            {/* Progress bar (only during blob upload) */}
            {stage === "uploading" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-200 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <StepList stage={stage} />
          </div>
        )}

        {/* Success state */}
        {stage === "done" && result && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
              <CheckCircle className="size-12 text-emerald-500" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-lg">
                  Document ingested successfully!
                </p>
                <p className="text-sm text-muted-foreground">
                  Stored{" "}
                  <span className="font-semibold text-foreground">
                    {result.chunkCount}
                  </span>{" "}
                  sentence chunks in the database.
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1 break-all">
                  ID: {result.documentId}
                </p>
              </div>
            </div>

            <button
              id="upload-another-btn"
              onClick={reset}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Upload another document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
