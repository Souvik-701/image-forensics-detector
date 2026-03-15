import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  FileImage,
  Info,
  Loader2,
  RefreshCw,
  Save,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateCase } from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorage";
import { runELA } from "../utils/ela";
import {
  autoDetectStatus,
  extractExif,
  formatExifTable,
  generateFindings,
} from "../utils/exif";
import type { ExifData } from "../utils/exif";

interface AnalysisResult {
  originalUrl: string;
  elaDataUrl: string;
  elaVariance: number;
  exif: ExifData | null;
  findings: string;
  suggestedStatus: "clean" | "suspicious" | "tampered";
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "clean")
    return <CheckCircle className="w-4 h-4 text-status-clean" />;
  if (status === "suspicious")
    return <AlertTriangle className="w-4 h-4 text-status-suspicious" />;
  return <XCircle className="w-4 h-4 text-status-tampered" />;
};

const statusLabel: Record<string, string> = {
  clean: "CLEAN",
  suspicious: "SUSPICIOUS",
  tampered: "TAMPERED",
};

const statusClass: Record<string, string> = {
  clean: "bg-status-clean/15 text-status-clean border-status-clean/30",
  suspicious:
    "bg-status-suspicious/15 text-status-suspicious border-status-suspicious/30",
  tampered:
    "bg-status-tampered/15 text-status-tampered border-status-tampered/30",
};

export function UploadAnalyze() {
  const navigate = useNavigate();
  const storageClient = useStorageClient();
  const { identity } = useInternetIdentity();
  const createCase = useCreateCase();

  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [title, setTitle] = useState("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    setCurrentFile(file);
    setIsAnalyzing(true);
    setResult(null);

    const originalUrl = URL.createObjectURL(file);
    setTitle(file.name.replace(/\.[^.]+$/, ""));

    try {
      const [elaResult, exifData] = await Promise.all([
        runELA(file),
        extractExif(file),
      ]);

      const findings = generateFindings(exifData, elaResult.variance);
      const suggestedStatus = autoDetectStatus(exifData, elaResult.variance);

      setResult({
        originalUrl,
        elaDataUrl: elaResult.elaDataUrl,
        elaVariance: elaResult.variance,
        exif: exifData,
        findings,
        suggestedStatus,
      });
    } catch {
      toast.error("Analysis failed. Please try a different image.");
      URL.revokeObjectURL(originalUrl);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) analyzeFile(file);
    },
    [analyzeFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) analyzeFile(file);
    },
    [analyzeFile],
  );

  const handleSave = async () => {
    if (!result || !currentFile || !title.trim()) {
      toast.error("Please provide a case title.");
      return;
    }
    if (!identity) {
      toast.error("Please sign in to save a case.");
      return;
    }
    if (!storageClient) {
      toast.error("Storage not ready. Please wait.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const bytes = new Uint8Array(await currentFile.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, (pct) =>
        setUploadProgress(pct),
      );

      await createCase.mutateAsync({ title: title.trim(), imageId: hash });
      toast.success("Case saved successfully!");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to save case. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    if (result?.originalUrl) URL.revokeObjectURL(result.originalUrl);
    setResult(null);
    setCurrentFile(null);
    setTitle("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          Upload &amp; Analyze
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Upload an image to perform ELA analysis and metadata inspection
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!result && !isAnalyzing && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              data-ocid="upload.dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-16 text-center transition-all duration-200 grid-bg",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border",
              )}
            >
              <label
                htmlFor="file-upload"
                className={cn(
                  "flex flex-col items-center gap-4 cursor-pointer",
                  !isDragging && "hover:opacity-80",
                )}
              >
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-200",
                    isDragging
                      ? "border-primary bg-primary/20 shadow-glow-cyan"
                      : "border-border bg-card",
                  )}
                >
                  <FileImage
                    className={cn(
                      "w-7 h-7",
                      isDragging ? "text-primary" : "text-muted-foreground/60",
                    )}
                  />
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-foreground/80">
                    Drop an image here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or <span className="text-primary">browse files</span>{" "}
                    &mdash; JPEG, PNG, TIFF, WebP supported
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground/40">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    ELA Analysis
                  </span>
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    EXIF Metadata
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Tampering Detection
                  </span>
                </div>
              </label>
            </div>
          </motion.div>
        )}

        {isAnalyzing && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <ScanIcon className="absolute inset-0 m-auto w-6 h-6 text-primary" />
            </div>
            <p className="font-display font-semibold text-foreground/70">
              Analyzing image…
            </p>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Running ELA + EXIF extraction
            </p>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* ELA Result header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon status={result.suggestedStatus} />
                <Badge
                  className={cn(
                    "font-mono text-xs",
                    statusClass[result.suggestedStatus],
                  )}
                >
                  {statusLabel[result.suggestedStatus]}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  ELA σ={result.elaVariance.toFixed(1)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
              >
                <RefreshCw className="w-3 h-3" />
                New Image
              </Button>
            </div>

            {/* Image comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Original
                  </span>
                </div>
                <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
                  <img
                    src={result.originalUrl}
                    alt="Uploaded forensics subject"
                    className="w-full object-contain max-h-72"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-status-suspicious" />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    ELA Output
                  </span>
                  <span className="ml-auto text-[10px] font-mono text-muted-foreground/40">
                    Bright = manipulated
                  </span>
                </div>
                <div className="rounded-lg border border-border overflow-hidden bg-black">
                  <img
                    src={result.elaDataUrl}
                    alt="Error Level Analysis output"
                    className="w-full object-contain max-h-72 ela-canvas"
                  />
                </div>
              </div>
            </div>

            {/* Findings */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                Auto-Generated Findings
              </h3>
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {result.findings}
              </pre>
            </div>

            {/* EXIF Table */}
            {result.exif && (
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    EXIF Metadata
                  </h3>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-border/50">
                      <TableHead className="text-xs font-mono text-muted-foreground/60 w-1/3">
                        Field
                      </TableHead>
                      <TableHead className="text-xs font-mono text-muted-foreground/60">
                        Value
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formatExifTable(result.exif).map((row) => (
                      <TableRow key={row.label} className="border-b-border/30">
                        <TableCell className="text-xs font-mono text-muted-foreground/70 py-2">
                          {row.label}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-foreground py-2">
                          {row.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!result.exif && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-status-suspicious/30 bg-status-suspicious/5">
                <AlertTriangle className="w-4 h-4 text-status-suspicious" />
                <span className="text-xs font-mono text-status-suspicious">
                  No EXIF metadata found in this image
                </span>
              </div>
            )}

            {/* Save form */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 text-primary" />
                Save as Case
              </h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label
                    htmlFor="case-title"
                    className="text-xs text-muted-foreground mb-1.5 block"
                  >
                    Case Title
                  </Label>
                  <Input
                    id="case-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a descriptive case title…"
                    className="bg-card border-border text-sm font-mono h-9"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    data-ocid="upload.submit_button"
                    onClick={handleSave}
                    disabled={isUploading || !title.trim() || !identity}
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 gap-2 h-9"
                    variant="ghost"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        {uploadProgress > 0
                          ? `${uploadProgress}%`
                          : "Uploading…"}
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save Case
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {!identity && (
                <p className="text-xs text-muted-foreground/60 mt-2 font-mono">
                  ⚠ Sign in to save cases
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}
