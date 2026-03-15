import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Clock,
  Folder,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useGetAllCases } from "../hooks/useQueries";
import type { ForensicsCase } from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorage";

function StatusBadge({ status }: { status: string }) {
  if (status === "clean") {
    return (
      <Badge className="bg-status-clean/15 text-status-clean border-status-clean/30 text-[10px] font-mono">
        <CheckCircle className="w-2.5 h-2.5 mr-1" />
        CLEAN
      </Badge>
    );
  }
  if (status === "suspicious") {
    return (
      <Badge className="bg-status-suspicious/15 text-status-suspicious border-status-suspicious/30 text-[10px] font-mono">
        <AlertTriangle className="w-2.5 h-2.5 mr-1" />
        SUSPICIOUS
      </Badge>
    );
  }
  return (
    <Badge className="bg-status-tampered/15 text-status-tampered border-status-tampered/30 text-[10px] font-mono">
      <XCircle className="w-2.5 h-2.5 mr-1" />
      TAMPERED
    </Badge>
  );
}

function CaseCard({
  forensicsCase,
  index,
  storageUrl,
}: { forensicsCase: ForensicsCase; index: number; storageUrl: string | null }) {
  const date = new Date(Number(forensicsCase.createdAt) / 1_000_000);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      data-ocid={`case.item.${index + 1}`}
    >
      <Link to="/case/$id" params={{ id: forensicsCase.id }}>
        <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 transition-all duration-200 hover:shadow-glow-cyan">
          {/* Thumbnail */}
          <div className="aspect-video bg-muted/50 relative overflow-hidden">
            {storageUrl ? (
              <img
                src={storageUrl}
                alt={forensicsCase.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center grid-bg">
                <Folder className="w-8 h-8 text-muted-foreground/30" />
              </div>
            )}
            {/* Status overlay */}
            <div className="absolute top-2 left-2">
              <StatusBadge status={forensicsCase.status as string} />
            </div>
          </div>

          {/* Case info */}
          <div className="p-3">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-display font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {forensicsCase.title}
              </h3>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 group-hover:text-primary/60 transition-colors" />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 font-mono">
              <Clock className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>

            {forensicsCase.findings && (
              <p className="mt-2 text-[11px] text-muted-foreground/60 line-clamp-2">
                {forensicsCase.findings.split("\n")[0]}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CaseCardWithUrl({
  forensicsCase,
  index,
}: { forensicsCase: ForensicsCase; index: number }) {
  const storageClient = useStorageClient();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!storageClient || !forensicsCase.imageId) return;
    storageClient
      .getDirectURL(forensicsCase.imageId)
      .then(setUrl)
      .catch(() => null);
  }, [storageClient, forensicsCase.imageId]);

  return (
    <CaseCard forensicsCase={forensicsCase} index={index} storageUrl={url} />
  );
}

export function Dashboard() {
  const { data: cases, isLoading, isError } = useGetAllCases();
  const [search, setSearch] = useState("");

  const filtered =
    cases?.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const stats = {
    total: cases?.length ?? 0,
    clean: cases?.filter((c) => (c.status as string) === "clean").length ?? 0,
    suspicious:
      cases?.filter((c) => (c.status as string) === "suspicious").length ?? 0,
    tampered:
      cases?.filter((c) => (c.status as string) === "tampered").length ?? 0,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8 gap-4"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
            Case Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and review image forensics investigations
          </p>
        </div>
        <Link to="/upload">
          <Button
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 gap-2"
            variant="ghost"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </Button>
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-3 mb-6"
      >
        {[
          {
            label: "Total Cases",
            value: stats.total,
            color: "text-foreground",
            bg: "bg-card",
          },
          {
            label: "Clean",
            value: stats.clean,
            color: "text-status-clean",
            bg: "bg-status-clean/5",
          },
          {
            label: "Suspicious",
            value: stats.suspicious,
            color: "text-status-suspicious",
            bg: "bg-status-suspicious/5",
          },
          {
            label: "Tampered",
            value: stats.tampered,
            color: "text-status-tampered",
            bg: "bg-status-tampered/5",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn("rounded-lg border border-border p-3", stat.bg)}
          >
            <div className={cn("font-display text-2xl font-bold", stat.color)}>
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground font-mono mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
        <Input
          placeholder="Search cases…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card border-border text-sm font-mono h-9"
          data-ocid="case.search_input"
        />
      </div>

      {/* Cases grid */}
      {isLoading && (
        <div
          data-ocid="case.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
            <div
              key={k}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <Skeleton className="aspect-video" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div
          data-ocid="case.error_state"
          className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5"
        >
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive/80">
            Failed to load cases. Please try again.
          </span>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="case.list.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Folder className="w-7 h-7 text-primary/60" />
            </div>
            <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground/70 mb-1">
            {search ? "No matching cases" : "No cases yet"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search
              ? "Try a different search term."
              : "Upload your first image to start a forensics investigation."}
          </p>
          {!search && (
            <Link to="/upload" className="mt-4">
              <Button
                size="sm"
                variant="ghost"
                className="bg-primary/10 text-primary border border-primary/20 gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Start Analysis
              </Button>
            </Link>
          )}
        </motion.div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <CaseCardWithUrl key={c.id} forensicsCase={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
