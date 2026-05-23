"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState, useCallback, useEffect } from "react";
import { CheckCircle, FileText, Loader2, Upload, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Stage = "idle" | "uploading" | "done" | "error";

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
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Transition to "done" as soon as progress reaches 1 (100%).
  // This is reactive and decoupled from the upload() promise resolution.
  useEffect(() => {
    if (progress === 1 && stage === "uploading") {
      setUploadedFilename(selectedFile?.name ?? null);
      setStage("done");
    }
  }, [progress, stage, selectedFile]);

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setSelectedFile(null);
    setUploadedFilename(null);
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
    setUploadedFilename(null);

    try {
      // Upload directly to Vercel Blob.
      // onUploadCompleted on the server will handle chunking and DB persistence
      // asynchronously after Vercel confirms the upload.
      setStage("uploading");
      setProgress(0);

      await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload/token",
        onUploadProgress: ({ percentage }) => {
          // Store as 0–1 decimal; the useEffect above will fire when it hits 1.
          setProgress(percentage / 100);
        },
      });
    } catch (err) {
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

        {/* In-progress */}
        {stage === "uploading" && (
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

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  Uploading…
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

        {/* Success state */}
        {stage === "done" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
              <CheckCircle className="size-12 text-emerald-500" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-lg">
                  Document uploaded successfully!
                </p>
                {uploadedFilename && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {uploadedFilename}
                    </span>{" "}
                    has been received and is being processed in the background.
                  </p>
                )}
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
