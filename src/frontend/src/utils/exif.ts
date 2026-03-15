import exifr from "exifr";

export interface ExifData {
  Make?: string;
  Model?: string;
  Software?: string;
  DateTime?: string;
  DateTimeOriginal?: string;
  GPSLatitude?: number;
  GPSLongitude?: number;
  ImageWidth?: number;
  ImageHeight?: number;
  ExifImageWidth?: number;
  ExifImageHeight?: number;
  ColorSpace?: number | string;
  Flash?: number | string;
  FNumber?: number;
  ExposureTime?: number;
  ISO?: number;
  FocalLength?: number;
  [key: string]: unknown;
}

const EDITING_SOFTWARE = [
  "Photoshop",
  "GIMP",
  "Lightroom",
  "Affinity",
  "Capture One",
  "Snapseed",
  "Pixlr",
  "Paint.NET",
  "Luminar",
  "darktable",
];

export async function extractExif(file: File): Promise<ExifData | null> {
  try {
    const result = await exifr.parse(file, {
      pick: [
        "Make",
        "Model",
        "Software",
        "DateTime",
        "DateTimeOriginal",
        "GPSLatitude",
        "GPSLongitude",
        "ImageWidth",
        "ImageHeight",
        "ExifImageWidth",
        "ExifImageHeight",
        "ColorSpace",
        "Flash",
        "FNumber",
        "ExposureTime",
        "ISO",
        "FocalLength",
      ],
    });
    return result as ExifData | null;
  } catch {
    return null;
  }
}

export function generateFindings(
  exif: ExifData | null,
  elaVariance: number,
): string {
  const findings: string[] = [];

  if (!exif) {
    findings.push("⚠ Missing metadata — EXIF data stripped or absent.");
  } else {
    // Check for editing software
    const software = exif.Software || "";
    const detected = EDITING_SOFTWARE.find((s) =>
      software.toLowerCase().includes(s.toLowerCase()),
    );
    if (detected) {
      findings.push(`🖥 Editing software detected: ${software.trim()}`);
    }

    // GPS
    if (exif.GPSLatitude !== undefined && exif.GPSLongitude !== undefined) {
      const lat =
        typeof exif.GPSLatitude === "number"
          ? exif.GPSLatitude.toFixed(5)
          : String(exif.GPSLatitude);
      const lon =
        typeof exif.GPSLongitude === "number"
          ? exif.GPSLongitude.toFixed(5)
          : String(exif.GPSLongitude);
      findings.push(`📍 GPS coordinates found: ${lat}, ${lon}`);
    }

    // Camera info
    if (exif.Make && exif.Model) {
      findings.push(`📷 Camera: ${exif.Make} ${exif.Model}`);
    }

    // Date info
    if (exif.DateTimeOriginal || exif.DateTime) {
      const dt = exif.DateTimeOriginal || exif.DateTime;
      findings.push(`📅 Capture date: ${dt}`);
    }
  }

  // ELA analysis
  if (elaVariance > 25) {
    findings.push(
      `🔍 High ELA variance detected (σ=${elaVariance.toFixed(1)}) — possible manipulation or compositing.`,
    );
  } else if (elaVariance > 12) {
    findings.push(
      `⚡ Moderate ELA variance (σ=${elaVariance.toFixed(1)}) — review ELA output for inconsistencies.`,
    );
  } else {
    findings.push(
      `✓ ELA variance within normal range (σ=${elaVariance.toFixed(1)}).`,
    );
  }

  return findings.join("\n");
}

export function autoDetectStatus(
  exif: ExifData | null,
  elaVariance: number,
): "clean" | "suspicious" | "tampered" {
  const software = exif?.Software || "";
  const editingDetected = EDITING_SOFTWARE.some((s) =>
    software.toLowerCase().includes(s.toLowerCase()),
  );

  if (elaVariance > 25 || (editingDetected && elaVariance > 15))
    return "tampered";
  if (elaVariance > 12 || editingDetected) return "suspicious";
  return "clean";
}

export function formatExifTable(
  exif: ExifData,
): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];

  const fields: Array<[string, string]> = [
    ["Make", "Camera Make"],
    ["Model", "Camera Model"],
    ["Software", "Software"],
    ["DateTime", "Date/Time"],
    ["DateTimeOriginal", "Original Date"],
    ["ImageWidth", "Width"],
    ["ImageHeight", "Height"],
    ["ExifImageWidth", "EXIF Width"],
    ["ExifImageHeight", "EXIF Height"],
    ["FNumber", "F-Number"],
    ["ExposureTime", "Exposure"],
    ["ISO", "ISO"],
    ["FocalLength", "Focal Length"],
    ["GPSLatitude", "GPS Latitude"],
    ["GPSLongitude", "GPS Longitude"],
    ["ColorSpace", "Color Space"],
    ["Flash", "Flash"],
  ];

  for (const [key, label] of fields) {
    const val = exif[key];
    if (val !== undefined && val !== null) {
      let formatted = "";
      if (key === "FNumber" && typeof val === "number") formatted = `f/${val}`;
      else if (key === "ExposureTime" && typeof val === "number") {
        formatted = val < 1 ? `1/${Math.round(1 / val)}s` : `${val}s`;
      } else if (key === "FocalLength" && typeof val === "number")
        formatted = `${val}mm`;
      else if (
        (key === "GPSLatitude" || key === "GPSLongitude") &&
        typeof val === "number"
      )
        formatted = `${val.toFixed(6)}°`;
      else formatted = String(val);

      rows.push({ label, value: formatted });
    }
  }

  return rows;
}
