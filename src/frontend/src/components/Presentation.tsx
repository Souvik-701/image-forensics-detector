import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Layers,
  Search,
  Terminal,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const TOTAL_SLIDES = 12;

function SlideWrapper({
  children,
  id,
}: { children: React.ReactNode; id: number }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="absolute inset-0 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

function SlideTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2 leading-tight">
      {children}
    </h2>
  );
}

function TealLine() {
  return <div className="w-16 h-1 bg-primary rounded-full mb-8" />;
}

function BulletPoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-lg text-muted-foreground leading-relaxed">
      <span className="mt-1 text-primary flex-shrink-0">
        <span className="inline-block w-2 h-2 rounded-full bg-primary mt-2" />
      </span>
      <span>{children}</span>
    </li>
  );
}

// Slide 1: Title
function Slide1() {
  return (
    <SlideWrapper id={1}>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full border border-primary/10" />
          <div className="absolute w-[450px] h-[450px] rounded-full border border-primary/15" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-primary/20" />
        </div>
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-8">
            <Search size={14} className="text-primary" />
            <span className="text-primary text-sm font-mono tracking-wider">
              FORENSIQ v1.0
            </span>
          </div>
          <h1 className="font-display text-8xl md:text-[120px] font-black tracking-tight text-foreground mb-4">
            Forens<span className="text-primary">IQ</span>
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground font-display font-medium mb-6">
            Image Forensics Detector
          </p>
          <div className="w-24 h-px bg-primary/50 mx-auto mb-6" />
          <p className="text-lg text-muted-foreground/80 font-body tracking-wide">
            Detect Digital Manipulation. Uncover the Truth.
          </p>
        </motion.div>
      </div>
    </SlideWrapper>
  );
}

const PROBLEM_POINTS = [
  "Digital image manipulation is rampant — Photoshop, compositing, and cloning are widespread",
  "Fake images spread misinformation in news, legal proceedings, and social media",
  "Traditional forensics tools are expensive, complex, and require expert knowledge",
  "No accessible, browser-based tool existed for quick forensic inspection",
];

function Slide2() {
  return (
    <SlideWrapper id={2}>
      <div className="flex-1 flex flex-col justify-center px-12 md:px-20 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
            <AlertTriangle size={28} className="text-destructive" />
          </div>
          <SlideTitle>The Problem</SlideTitle>
        </div>
        <TealLine />
        <ul className="space-y-5">
          {PROBLEM_POINTS.map((point, idx) => (
            <motion.div
              key={point}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
            >
              <BulletPoint>{point}</BulletPoint>
            </motion.div>
          ))}
        </ul>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 p-4 bg-destructive/5 border border-destructive/20 rounded-xl"
        >
          <p className="text-destructive font-mono text-sm">
            ⚠ &nbsp;In 2024, over 500,000 manipulated images were detected in
            news media alone
          </p>
        </motion.div>
      </div>
    </SlideWrapper>
  );
}

const SOLUTION_POINTS = [
  "Browser-based image forensics tool — no installation required",
  "Runs entirely in the browser using client-side analysis engines",
  "Detects manipulation via Error Level Analysis (ELA) and EXIF metadata",
  "Case management dashboard to track and flag investigations",
];

function Slide3() {
  return (
    <SlideWrapper id={3}>
      <div className="flex-1 flex gap-8 px-12 md:px-16 py-8 items-center max-w-6xl mx-auto w-full">
        <div className="flex-1">
          <SlideTitle>Our Solution: ForensIQ</SlideTitle>
          <TealLine />
          <ul className="space-y-5">
            {SOLUTION_POINTS.map((point, idx) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
              >
                <BulletPoint>{point}</BulletPoint>
              </motion.div>
            ))}
          </ul>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden md:flex flex-col items-center w-[380px] flex-shrink-0"
        >
          <div className="border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_40px_oklch(0.72_0.13_195/0.15)]">
            <img
              src="/assets/uploads/Screenshot-2026-03-15-152113-5.png"
              alt="Dashboard"
              className="w-full object-cover"
            />
          </div>
          <p className="text-xs text-muted-foreground/60 font-mono mt-2">
            ForensIQ Dashboard
          </p>
        </motion.div>
      </div>
    </SlideWrapper>
  );
}

const FEATURES = [
  {
    icon: <Search size={22} />,
    title: "ELA Analysis",
    desc: "Highlights digitally altered regions using compression artifact analysis",
  },
  {
    icon: <Database size={22} />,
    title: "EXIF Metadata",
    desc: "Extracts camera data, GPS, timestamps, and software signatures (e.g. Photoshop)",
  },
  {
    icon: <Layers size={22} />,
    title: "Case Dashboard",
    desc: "Manage investigations with tamper status badges: Clean, Suspicious, Tampered",
  },
  {
    icon: <GitBranch size={22} />,
    title: "Noise Analysis",
    desc: "Detects inconsistent noise patterns indicating compositing or cloning",
  },
];

function Slide4() {
  return (
    <SlideWrapper id={4}>
      <div className="flex-1 flex flex-col justify-center px-12 md:px-16 max-w-5xl mx-auto w-full">
        <SlideTitle>Key Features</SlideTitle>
        <TealLine />
        <div className="grid grid-cols-2 gap-4">
          {FEATURES.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-foreground text-lg">
                  {f.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrapper>
  );
}

function Slide5() {
  return (
    <SlideWrapper id={5}>
      <div className="flex-1 flex flex-col justify-center px-12 md:px-16 max-w-5xl mx-auto w-full">
        <SlideTitle>Error Level Analysis (ELA)</SlideTitle>
        <TealLine />
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
          ELA re-compresses the image and compares artifacts. Edited areas show
          higher error levels — visualized as bright regions indicating
          potential manipulation.
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_40px_oklch(0.72_0.13_195/0.12)]"
        >
          <img
            src="/assets/uploads/Screenshot-2026-03-15-152236-6.png"
            alt="ELA Analysis Result"
            className="w-full object-cover"
          />
        </motion.div>
        <p className="text-xs text-muted-foreground/60 font-mono mt-3 text-center">
          Left: Original image &nbsp;|&nbsp; Right: ELA output — bright areas
          indicate manipulation
        </p>
      </div>
    </SlideWrapper>
  );
}

const DASHBOARD_POINTS = [
  "Centralized view of all forensic investigations",
  "Color-coded status: Green (Clean), Yellow (Suspicious), Red (Tampered)",
  "Search and filter capabilities across all cases",
  "One-click to start a new analysis from the dashboard",
];

const STATUS_BADGES = [
  {
    label: "Clean",
    cls: "border-status-clean/50 text-status-clean bg-status-clean/10",
  },
  {
    label: "Suspicious",
    cls: "border-status-suspicious/50 text-status-suspicious bg-status-suspicious/10",
  },
  {
    label: "Tampered",
    cls: "border-status-tampered/50 text-status-tampered bg-status-tampered/10",
  },
];

function Slide6() {
  return (
    <SlideWrapper id={6}>
      <div className="flex-1 flex gap-8 px-12 md:px-16 py-8 items-center max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:flex flex-col items-center w-[380px] flex-shrink-0"
        >
          <div className="border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_40px_oklch(0.72_0.13_195/0.15)]">
            <img
              src="/assets/uploads/Screenshot-2026-03-15-152152-4.png"
              alt="Case Dashboard"
              className="w-full object-cover"
            />
          </div>
        </motion.div>
        <div className="flex-1">
          <SlideTitle>Case Management Dashboard</SlideTitle>
          <TealLine />
          <ul className="space-y-5">
            {DASHBOARD_POINTS.map((point, idx) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.08 }}
              >
                <BulletPoint>{point}</BulletPoint>
              </motion.div>
            ))}
          </ul>
          <div className="flex gap-3 mt-8">
            {STATUS_BADGES.map((s) => (
              <span
                key={s.label}
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${s.cls}`}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}

const UPLOAD_POINTS = [
  "Supports JPEG, PNG, TIFF, and WebP image formats",
  "Drag-and-drop or browse file upload interface",
  "Instant analysis — no server-side processing required",
  "Auto-generated findings with severity indicators",
];

function Slide7() {
  return (
    <SlideWrapper id={7}>
      <div className="flex-1 flex gap-8 px-12 md:px-16 py-8 items-center max-w-6xl mx-auto w-full">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl">
              <Upload size={26} className="text-primary" />
            </div>
            <SlideTitle>Upload &amp; Analyze</SlideTitle>
          </div>
          <TealLine />
          <ul className="space-y-5">
            {UPLOAD_POINTS.map((point, idx) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
              >
                <BulletPoint>{point}</BulletPoint>
              </motion.div>
            ))}
          </ul>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden md:flex flex-col items-center w-[380px] flex-shrink-0"
        >
          <div className="border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_40px_oklch(0.72_0.13_195/0.15)]">
            <img
              src="/assets/uploads/Screenshot-2026-03-15-152113-5.png"
              alt="Upload Interface"
              className="w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </SlideWrapper>
  );
}

const FRONTEND_TECHS = [
  {
    name: "React 19",
    desc: "Component-based UI framework for reactive interfaces",
  },
  { name: "TypeScript", desc: "Static typing for reliable, maintainable code" },
  {
    name: "Tailwind CSS",
    desc: "Utility-first styling for responsive, custom design",
  },
  { name: "Vite", desc: "Lightning-fast build tool and development server" },
  { name: "exifr", desc: "Lightweight EXIF metadata extraction library" },
  {
    name: "Lucide React",
    desc: "Icon library for clean, consistent UI elements",
  },
  { name: "TanStack Router", desc: "Type-safe client-side routing solution" },
  {
    name: "Canvas API",
    desc: "Browser-native ELA computation and rendering engine",
  },
];

function Slide8() {
  return (
    <SlideWrapper id={8}>
      <div className="flex-1 flex flex-col justify-center px-12 md:px-16 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <Cpu size={28} className="text-primary" />
          <SlideTitle>Frontend Technologies</SlideTitle>
        </div>
        <TealLine />
        <div className="grid grid-cols-2 gap-3">
          {FRONTEND_TECHS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + idx * 0.06 }}
              className="flex items-start gap-3 bg-card/50 border border-border rounded-lg p-3"
            >
              <span className="font-mono text-primary font-bold text-sm min-w-[120px]">
                {t.name}
              </span>
              <span className="text-muted-foreground text-sm leading-relaxed">
                {t.desc}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrapper>
  );
}

const BACKEND_TECHS = [
  {
    name: "Motoko",
    desc: "Smart contract language for Internet Computer Protocol",
  },
  {
    name: "ICP",
    desc: "Decentralized cloud platform for on-chain app hosting",
  },
  {
    name: "Caffeine AI",
    desc: "Full-stack AI development platform powering the build",
  },
  {
    name: "Candid",
    desc: "Interface description language for ICP canister communication",
  },
  {
    name: "DFINITY SDK",
    desc: "CLI toolchain for building and deploying ICP canisters",
  },
  {
    name: "@dfinity/agent",
    desc: "JS library for frontend-to-canister communication",
  },
];

function Slide9() {
  return (
    <SlideWrapper id={9}>
      <div className="flex-1 flex flex-col justify-center px-12 md:px-16 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={28} className="text-primary" />
          <SlideTitle>Backend Technologies</SlideTitle>
        </div>
        <TealLine />
        <div className="grid grid-cols-1 gap-3">
          {BACKEND_TECHS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + idx * 0.07 }}
              className="flex items-start gap-4 bg-card/50 border border-border rounded-lg p-4"
            >
              <span className="font-mono text-primary font-bold text-sm min-w-[130px]">
                {t.name}
              </span>
              <span className="text-muted-foreground leading-relaxed">
                {t.desc}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </SlideWrapper>
  );
}

const DEV_STEPS = [
  "Install WSL (Windows Subsystem for Linux)",
  "Install Node.js v18+ and pnpm package manager",
  'Install DFINITY SDK: sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"',
  "Download project and run: pnpm install",
  "Start dev server: npx vite --host",
  "Open in browser: http://localhost:5173",
];

function Slide10() {
  return (
    <SlideWrapper id={10}>
      <div className="flex-1 flex gap-8 px-12 md:px-16 py-8 items-center max-w-6xl mx-auto w-full">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Terminal size={26} className="text-primary" />
            <SlideTitle>Development Setup</SlideTitle>
          </div>
          <TealLine />
          <ol className="space-y-3">
            {DEV_STEPS.map((step, idx) => (
              <motion.li
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + idx * 0.07 }}
                className="flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-mono font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-muted-foreground text-sm leading-relaxed font-mono">
                  {step}
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden md:flex flex-col items-center w-[340px] flex-shrink-0"
        >
          <div className="border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_40px_oklch(0.72_0.13_195/0.15)]">
            <img
              src="/assets/uploads/nextss-3.png"
              alt="VS Code setup"
              className="w-full object-cover"
            />
          </div>
          <p className="text-xs text-muted-foreground/60 font-mono mt-2">
            VS Code + TypeScript environment
          </p>
        </motion.div>
      </div>
    </SlideWrapper>
  );
}

const CLIENT_TAGS = [
  "React 19 + TypeScript",
  "Canvas API (ELA Engine)",
  "EXIF Parser (exifr)",
  "TanStack Router",
];
const BACKEND_TAGS = [
  "Motoko Smart Contract",
  "Case Storage (On-chain)",
  "Identity / Auth",
];
const NETWORK_TAGS = [
  "Internet Computer Protocol",
  "Decentralized Nodes",
  "DFINITY Foundation",
];

function Slide11() {
  return (
    <SlideWrapper id={11}>
      <div className="flex-1 flex flex-col justify-center px-12 md:px-16 max-w-5xl mx-auto w-full">
        <SlideTitle>System Architecture</SlideTitle>
        <TealLine />
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-primary/30 rounded-xl p-5"
          >
            <p className="text-xs font-mono text-primary mb-3 tracking-wider">
              CLIENT LAYER (Browser)
            </p>
            <div className="flex gap-4 flex-wrap">
              {CLIENT_TAGS.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm text-foreground font-mono"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground/50">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-mono">
              Candid Interface / @dfinity/agent
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <p className="text-xs font-mono text-muted-foreground mb-3 tracking-wider">
              BACKEND LAYER (ICP Canister)
            </p>
            <div className="flex gap-4 flex-wrap">
              {BACKEND_TAGS.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-muted-foreground font-mono"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground/50">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-mono">ICP Network Protocol</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <p className="text-xs font-mono text-muted-foreground mb-3 tracking-wider">
              NETWORK LAYER
            </p>
            <div className="flex gap-4 flex-wrap">
              {NETWORK_TAGS.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-muted-foreground font-mono"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
        <p className="text-xs text-muted-foreground/50 font-mono mt-4">
          * All analysis runs client-side. Backend stores cases on-chain.
        </p>
      </div>
    </SlideWrapper>
  );
}

const CONCLUSION_POINTS = [
  "Built on Internet Computer Protocol — decentralized, censorship-resistant hosting",
  "100% browser-based forensic analysis — no backend AI or external services required",
  "Open for export to GitHub and local development via VS Code + WSL",
  "Empowers journalists, researchers, lawyers, and security analysts",
];

function Slide12() {
  return (
    <SlideWrapper id={12}>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-12 md:px-20 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-primary text-sm font-mono tracking-wider">
              SUMMARY
            </span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-black text-foreground mb-6">
            Forens<span className="text-primary">IQ</span>
          </h2>
          <ul className="text-left space-y-4 mb-10">
            {CONCLUSION_POINTS.map((point, idx) => (
              <motion.li
                key={point}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
                className="flex items-start gap-3 text-muted-foreground"
              >
                <span className="text-primary mt-1">✦</span>
                <span>{point}</span>
              </motion.li>
            ))}
          </ul>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-3 bg-primary/10 border border-primary/40 rounded-2xl px-8 py-4 glow-cyan"
          >
            <Globe size={20} className="text-primary" />
            <span className="text-primary font-display font-bold text-xl">
              Try it now at caffeine.ai
            </span>
          </motion.div>
          <p className="text-muted-foreground/40 font-mono text-sm mt-8">
            Thank You
          </p>
        </motion.div>
      </div>
    </SlideWrapper>
  );
}

const SLIDES = [
  Slide1,
  Slide2,
  Slide3,
  Slide4,
  Slide5,
  Slide6,
  Slide7,
  Slide8,
  Slide9,
  Slide10,
  Slide11,
  Slide12,
];

const SLIDE_TITLES = [
  "Title",
  "The Problem",
  "Our Solution",
  "Key Features",
  "ELA Analysis",
  "Case Dashboard",
  "Upload & Analyze",
  "Frontend Tech",
  "Backend Tech",
  "Dev Setup",
  "Architecture",
  "Summary",
];

export function Presentation() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(
    () => setCurrent((c) => Math.min(TOTAL_SLIDES - 1, c + 1)),
    [],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  const SlideComponent = SLIDES[current];

  return (
    <div className="fixed inset-0 bg-background overflow-hidden flex flex-col select-none">
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent flex-shrink-0" />
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <SlideComponent key={current} />
        </AnimatePresence>
        <button
          type="button"
          data-ocid="presentation.pagination_prev"
          onClick={prev}
          disabled={current === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card/80 backdrop-blur border border-border hover:border-primary/50 hover:bg-primary/10 transition-all flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={22} className="text-foreground" />
        </button>
        <button
          type="button"
          data-ocid="presentation.pagination_next"
          onClick={next}
          disabled={current === TOTAL_SLIDES - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-card/80 backdrop-blur border border-border hover:border-primary/50 hover:bg-primary/10 transition-all flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight size={22} className="text-foreground" />
        </button>
      </div>
      <div className="flex-shrink-0 h-12 border-t border-border/50 flex items-center justify-between px-6 bg-card/30 backdrop-blur">
        <span className="text-xs font-mono text-muted-foreground/60 hidden sm:block">
          ForensIQ &nbsp;/&nbsp;{" "}
          <span className="text-primary/80">{SLIDE_TITLES[current]}</span>
        </span>
        <div className="flex gap-1.5 absolute left-1/2 -translate-x-1/2">
          {SLIDES.map((_, i) => (
            <button
              key={SLIDE_TITLES[i]}
              type="button"
              data-ocid="presentation.tab"
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current
                  ? "bg-primary w-4"
                  : "bg-border hover:bg-muted-foreground w-1.5"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-muted-foreground/60">
          {current + 1} / {TOTAL_SLIDES}
        </span>
      </div>
    </div>
  );
}
