import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import exifr from "exifr";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Info,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteCase,
  useGetCaseById,
  useUpdateCase,
  useUserRole,
} from "../hooks/useQueries";
import type { CaseStatus } from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorage";
import { runELA } from "../utils/ela";
import { formatExifTable } from "../utils/exif";
import type { ExifData } from "../utils/exif";

const statusClass: Record<string, string> = {
  clean: "bg-status-clean/15 text-status-clean border-status-clean/30",
  suspicious:
    "bg-status-suspicious/15 text-status-suspicious border-status-suspicious/30",
  tampered:
    "bg-status-tampered/15 text-status-tampered border-status-tampered/30",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "clean") return <CheckCircle className="w-4 h-4" />;
  if (status === "suspicious") return <AlertTriangle className="w-4 h-4" />;
  return <XCircle className="w-4 h-4" />;
};

export function CaseDetail() {
  const { id } = useParams({ from: "/case/$id" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const storageClient = useStorageClient();

  const { data: forensicsCase, isLoading, isError } = useGetCaseById(id);
  const { data: role } = useUserRole();
  const updateCase = useUpdateCase();
  const deleteCase = useDeleteCase();

  const [status, setStatus] = useState<CaseStatus>("clean" as CaseStatus);
  const [notes, setNotes] = useState("");
  const [findings, setFindings] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [elaUrl, setElaUrl] = useState<string | null>(null);
  const [elaVariance, setElaVariance] = useState<number | null>(null);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [isRunningEla, setIsRunningEla] = useState(false);

  const isAdmin = role === "admin";
  const canEdit = !!identity;

  // Initialize form from case data
  useEffect(() => {
    if (forensicsCase) {
      setStatus(forensicsCase.status);
      setNotes(forensicsCase.notes);
      setFindings(forensicsCase.findings);
    }
  }, [forensicsCase]);

  // Load image URL from storage
  useEffect(() => {
    if (!storageClient || !forensicsCase?.imageId) return;
    storageClient
      .getDirectURL(forensicsCase.imageId)
      .then(setImageUrl)
      .catch(() => null);
  }, [storageClient, forensicsCase?.imageId]);

  // Run ELA when image is available
  useEffect(() => {
    if (!imageUrl) return;
    setIsRunningEla(true);

    const doAnalysis = async () => {
      try {
        // Fetch image as blob for ELA + EXIF
        const resp = await fetch(imageUrl);
        const blob = await resp.blob();
        const file = new File([blob], "image", { type: blob.type });

        const [elaResult, exif] = await Promise.all([
          runELA(file),
          exifr.parse(file).catch(() => null) as Promise<ExifData | null>,
        ]);

        setElaUrl(elaResult.elaDataUrl);
        setElaVariance(elaResult.variance);
        setExifData(exif);
      } catch {
        // ELA failed silently
      } finally {
        setIsRunningEla(false);
      }
    };

    doAnalysis();
  }, [imageUrl]);

  const handleSave = async () => {
    if (!forensicsCase) return;
    try {
      await updateCase.mutateAsync({
        id: forensicsCase.id,
        status,
        notes,
        findings,
      });
      toast.success("Case updated successfully.");
    } catch {
      toast.error("Failed to update case.");
    }
  };

  const handleDelete = async () => {
    if (!forensicsCase) return;
    try {
      await deleteCase.mutateAsync(forensicsCase.id);
      toast.success("Case deleted.");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete case.");
    }
  };

  if (isLoading) {
    return (
      <div
        data-ocid="case.loading_state"
        className="p-6 max-w-6xl mx-auto space-y-5"
      >
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="aspect-video" />
          <Skeleton className="aspect-video" />
        </div>
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (isError || !forensicsCase) {
    return (
      <div data-ocid="case.error_state" className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive/80">
            Case not found or failed to load.
          </span>
        </div>
      </div>
    );
  }

  const date = new Date(Number(forensicsCase.createdAt) / 1_000_000);
  const formattedDate = date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
          className="text-muted-foreground hover:text-foreground gap-1.5 text-xs mt-0.5 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="font-display text-xl font-bold text-foreground tracking-tight truncate">
              {forensicsCase.title}
            </h1>
            <Badge
              className={cn(
                "font-mono text-[10px] shrink-0",
                statusClass[forensicsCase.status as string],
              )}
            >
              <StatusIcon status={forensicsCase.status as string} />
              <span className="ml-1">
                {String(forensicsCase.status).toUpperCase()}
              </span>
            </Badge>
          </div>
          <p className="text-xs font-mono text-muted-foreground">
            Created {formattedDate} · Case #{forensicsCase.id.slice(0, 8)}
          </p>
        </div>
      </motion.div>

      {/* Image comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Original Image
            </span>
          </div>
          <div className="rounded-lg border border-border overflow-hidden bg-muted/20 aspect-video flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Original"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-muted-foreground/40 animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-status-suspicious" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              ELA Analysis
            </span>
            {elaVariance !== null && (
              <span className="ml-auto text-[10px] font-mono text-muted-foreground/40">
                σ={elaVariance.toFixed(1)}
              </span>
            )}
          </div>
          <div className="rounded-lg border border-border overflow-hidden bg-black aspect-video flex items-center justify-center">
            {isRunningEla ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 text-primary/50 animate-spin" />
                <span className="text-xs font-mono text-muted-foreground/40">
                  Running ELA…
                </span>
              </div>
            ) : elaUrl ? (
              <img
                src={elaUrl}
                alt="ELA"
                className="w-full h-full object-contain ela-canvas"
              />
            ) : (
              <span className="text-xs font-mono text-muted-foreground/30">
                ELA unavailable
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Edit form */}
        <div className="space-y-4">
          {/* Status */}
          <div>
            <Label className="text-xs font-mono text-muted-foreground mb-1.5 block">
              Verdict Status
            </Label>
            <Select
              value={status as string}
              onValueChange={(v) => setStatus(v as CaseStatus)}
              disabled={!canEdit}
            >
              <SelectTrigger
                data-ocid="case.status.select"
                className="bg-card border-border font-mono text-sm h-9"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="clean" className="font-mono text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-status-clean" />
                    Clean
                  </span>
                </SelectItem>
                <SelectItem value="suspicious" className="font-mono text-sm">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-status-suspicious" />
                    Suspicious
                  </span>
                </SelectItem>
                <SelectItem value="tampered" className="font-mono text-sm">
                  <span className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-status-tampered" />
                    Tampered
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-mono text-muted-foreground mb-1.5 block">
              Analyst Notes
            </Label>
            <Textarea
              data-ocid="case.notes.textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add investigative notes…"
              disabled={!canEdit}
              className="bg-card border-border font-mono text-xs resize-none h-28"
            />
          </div>

          {/* Findings */}
          <div>
            <Label className="text-xs font-mono text-muted-foreground mb-1.5 block flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-primary" />
              Findings Summary
            </Label>
            <Textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Document findings…"
              disabled={!canEdit}
              className="bg-card border-border font-mono text-xs resize-none h-28"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              data-ocid="case.save_button"
              onClick={handleSave}
              disabled={!canEdit || updateCase.isPending}
              className="flex-1 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 gap-2 text-sm"
              variant="ghost"
            >
              {updateCase.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {updateCase.isPending ? "Saving…" : "Save Changes"}
            </Button>

            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    data-ocid="case.delete_button"
                    variant="ghost"
                    className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 gap-2 text-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-popover border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">
                      Delete Case?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground text-sm">
                      This will permanently delete &ldquo;{forensicsCase.title}
                      &rdquo; and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-card border-border text-foreground hover:bg-accent">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30"
                    >
                      {deleteCase.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {!canEdit && (
            <p className="text-xs font-mono text-muted-foreground/50">
              ⚠ Sign in to edit this case
            </p>
          )}
        </div>

        {/* Right: Metadata */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              EXIF Metadata
            </span>
          </div>
          {exifData ? (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-border/50">
                    <TableHead className="text-[11px] font-mono text-muted-foreground/60 w-2/5 py-2">
                      Field
                    </TableHead>
                    <TableHead className="text-[11px] font-mono text-muted-foreground/60 py-2">
                      Value
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formatExifTable(exifData).map((row) => (
                    <TableRow key={row.label} className="border-b-border/30">
                      <TableCell className="text-[11px] font-mono text-muted-foreground/70 py-1.5">
                        {row.label}
                      </TableCell>
                      <TableCell className="text-[11px] font-mono text-foreground/80 py-1.5 break-all">
                        {row.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : isRunningEla ? (
            <div className="space-y-1.5">
              {["e1", "e2", "e3", "e4", "e5", "e6"].map((k) => (
                <Skeleton key={k} className="h-7" />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-card">
              <AlertTriangle className="w-3.5 h-3.5 text-status-suspicious" />
              <span className="text-xs font-mono text-muted-foreground/60">
                No EXIF metadata found
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
