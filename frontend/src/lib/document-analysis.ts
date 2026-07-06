/**
 * ============================================================================
 * lib/document-analysis.ts
 * ----------------------------------------------------------------------------
 * Pipeline de validation documentaire 100% navigateur, réutilisable et
 * indépendant de React : validation fichier -> rendu PDF/Image -> prétraitement
 * Canvas -> OCR (Tesseract.js) -> recherche floue -> score qualité/fraude.
 *
 * Ce module ne dépend d'aucun composant : il peut être utilisé depuis
 * n'importe quel formulaire/dropzone du projet (voir hooks/use-document-analysis.ts
 * et components/FileDropzone.tsx pour l'intégration React + react-hook-form).
 * ============================================================================
 */

import { createWorker, type Worker as TesseractWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/* ----------------------------------------------------------------------- *
 * Types publics
 * ----------------------------------------------------------------------- */

export type DocumentStatus = "OK" | "WARNING" | "SUSPICIOUS";
export type AcceptedMime = "image/jpeg" | "image/png" | "application/pdf";

export interface PageOcrResult {
  readonly pageNumber: number;
  readonly text: string;
  readonly confidence: number;
  readonly wordCount: number;
  readonly charCount: number;
  readonly durationMs: number;
}

export interface ImageQualityMetrics {
  readonly brightnessMean: number;
  readonly contrastStdDev: number;
  readonly blurVariance: number;
  readonly emptyRatio: number;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly isTooDark: boolean;
  readonly isTooBright: boolean;
  readonly isBlurry: boolean;
  readonly isLowContrast: boolean;
  readonly isLowResolution: boolean;
  readonly isNearlyEmpty: boolean;
}

export interface FraudScoreBreakdown {
  readonly label: string;
  readonly penalty: number;
}

export interface AnalysisResult {
  readonly fileName: string;
  readonly status: DocumentStatus;
  readonly fraudScore: number;
  readonly averageOCRConfidence: number;
  readonly processingTimeMs: number;
  readonly occurrences: number;
  readonly matchedWords: string[];
  readonly warnings: string[];
  readonly pages: number;
  readonly text: string;
  readonly imageQuality: number;
  readonly scoreBreakdown: FraudScoreBreakdown[];
  readonly perPage: PageOcrResult[];
}

/** Options de configuration du pipeline, toutes surchargeables par appel. */
export interface PipelineOptions {
  /** Mots à rechercher dans le document (recherche floue). */
  targetWords: string[];
  /** Nombre minimal d'occurrences TOTAL requis pour ne pas pénaliser le score. */
  minOccurrences: number;
  /** Distance de Levenshtein normalisée max tolérée pour un "match" flou (0-1). */
  maxNormalizedDistance: number;
  /** Taille de fichier max acceptée, en octets. */
  maxFileSizeBytes: number;
  /** Nombre de pages PDF max accepté. */
  maxPdfPages: number;
  /** Résolution cible (grand côté, px) utilisée pour le rendu/OCR. */
  ocrTargetLongEdge: number;
  /** Dimension minimale (px) acceptée pour une image/page. */
  minImageDimension: number;
  /** Dimension maximale (px) acceptée pour une image/page. */
  maxImageDimension: number;
}

export const DEFAULT_PIPELINE_OPTIONS: PipelineOptions = {
  targetWords: ["pamplemousse"],
  minOccurrences: 4,
  maxNormalizedDistance: 0.3,
  maxFileSizeBytes: 15 * 1024 * 1024,
  maxPdfPages: 25,
  ocrTargetLongEdge: 2000,
  minImageDimension: 200,
  maxImageDimension: 8000,
};

export interface AnalysisCallbacks {
  onProgress: (progress: number, label: string) => void;
  signal: AbortSignal;
}

/** Erreur "métier" du pipeline (validation, décodage, annulation…). */
export class PipelineError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "PipelineError";
  }
}

/* ----------------------------------------------------------------------- *
 * Validation rapide du fichier
 * ----------------------------------------------------------------------- */

const ACCEPTED_MIME_TYPES: readonly AcceptedMime[] = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

const MAGIC_NUMBERS: Record<AcceptedMime, readonly number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
};

async function readFileHeader(file: File, length: number): Promise<Uint8Array> {
  return new Uint8Array(await file.slice(0, length).arrayBuffer());
}

function matchesMagicNumber(
  header: Uint8Array,
  signature: readonly number[],
): boolean {
  if (header.length < signature.length) return false;
  return signature.every((byte, i) => header[i] === byte);
}

function guessMimeFromExtension(fileName: string): AcceptedMime | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return null;
}

/** Détermine si un fichier est éligible au pipeline (extension acceptée). */
export function isAcceptedFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

async function validateFileFast(
  file: File,
  options: PipelineOptions,
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const lowerName = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
    return {
      ok: false,
      code: "BAD_EXTENSION",
      message: `Extension non supportée pour "${file.name}".`,
    };
  }
  if (file.size === 0) {
    return { ok: false, code: "EMPTY_FILE", message: "Le fichier est vide." };
  }
  if (file.size > options.maxFileSizeBytes) {
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: `Fichier trop volumineux (max ${(options.maxFileSizeBytes / 1024 / 1024).toFixed(0)} Mo).`,
    };
  }

  const declaredMime =
    (file.type as AcceptedMime) || guessMimeFromExtension(file.name);
  if (!declaredMime || !ACCEPTED_MIME_TYPES.includes(declaredMime)) {
    return {
      ok: false,
      code: "BAD_MIME",
      message: `Type de fichier non supporté ("${file.type || "inconnu"}").`,
    };
  }

  const header = await readFileHeader(file, 12);
  const signatures = MAGIC_NUMBERS[declaredMime];
  if (!signatures.some((sig) => matchesMagicNumber(header, sig))) {
    return {
      ok: false,
      code: "BAD_MAGIC_NUMBER",
      message:
        "Le contenu du fichier ne correspond pas à son extension (fichier corrompu ou renommé).",
    };
  }
  return { ok: true };
}

function validateDimensions(
  width: number,
  height: number,
  options: PipelineOptions,
): { ok: true } | { ok: false; code: string; message: string } {
  if (width < options.minImageDimension || height < options.minImageDimension) {
    return {
      ok: false,
      code: "TOO_SMALL",
      message: `Dimensions trop faibles (${width}x${height}).`,
    };
  }
  if (width > options.maxImageDimension || height > options.maxImageDimension) {
    return {
      ok: false,
      code: "TOO_LARGE",
      message: `Dimensions trop grandes (${width}x${height}).`,
    };
  }
  return { ok: true };
}

function assertNotAborted(signal: AbortSignal): void {
  if (signal.aborted)
    throw new PipelineError(
      "CANCELLED",
      "Traitement annulé par l'utilisateur.",
    );
}

/* ----------------------------------------------------------------------- *
 * Prétraitement Canvas
 * ----------------------------------------------------------------------- */

function createCanvasFromBitmap(
  bitmap: ImageBitmap,
  maxLongEdge: number,
): HTMLCanvasElement {
  const longEdge = Math.max(bitmap.width, bitmap.height);
  const scale = longEdge > maxLongEdge ? maxLongEdge / longEdge : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx)
    throw new PipelineError(
      "CANVAS_UNAVAILABLE",
      "Contexte Canvas 2D indisponible.",
    );
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

function toGrayscale(imageData: ImageData): void {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

function stretchContrast(imageData: ImageData): void {
  const { data } = imageData;
  let min = 255;
  let max = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }
  const range = max - min;
  if (range < 1) return;
  for (let i = 0; i < data.length; i += 4) {
    const v = ((data[i] - min) / range) * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
}

function computeOtsuThreshold(imageData: ImageData): number {
  const histogram = new Array<number>(256).fill(0);
  const { data } = imageData;
  const total = data.length / 4;
  for (let i = 0; i < data.length; i += 4) histogram[data[i]] += 1;

  let sum = 0;
  for (let t = 0; t < 256; t += 1) sum += t * histogram[t];

  let sumBackground = 0;
  let weightBackground = 0;
  let maxVariance = 0;
  let threshold = 127;

  for (let t = 0; t < 256; t += 1) {
    weightBackground += histogram[t];
    if (weightBackground === 0) continue;
    const weightForeground = total - weightBackground;
    if (weightForeground === 0) break;
    sumBackground += t * histogram[t];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sum - sumBackground) / weightForeground;
    const betweenVariance =
      weightBackground *
      weightForeground *
      (meanBackground - meanForeground) ** 2;
    if (betweenVariance > maxVariance) {
      maxVariance = betweenVariance;
      threshold = t;
    }
  }
  return threshold;
}

function binarize(imageData: ImageData, threshold: number): void {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i] >= threshold ? 255 : 0;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
}

function convolve3x3(
  imageData: ImageData,
  kernel: readonly number[],
): Float32Array {
  const { width, height, data } = imageData;
  const output = new Float32Array(width * height);
  const kSum = kernel.reduce((a, b) => a + b, 0) || 1;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      let acc = 0;
      let k = 0;
      for (let ky = -1; ky <= 1; ky += 1) {
        for (let kx = -1; kx <= 1; kx += 1) {
          acc += data[((y + ky) * width + (x + kx)) * 4] * kernel[k];
          k += 1;
        }
      }
      output[y * width + x] = acc / kSum;
    }
  }
  return output;
}

function sharpen(imageData: ImageData): void {
  const sharpened = convolve3x3(imageData, [0, -1, 0, -1, 5, -1, 0, -1, 0]);
  const { data, width, height } = imageData;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = (y * width + x) * 4;
      const v = Math.min(255, Math.max(0, sharpened[y * width + x]));
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
    }
  }
}

function estimateSkewAngleDegrees(sourceCanvas: HTMLCanvasElement): number {
  const probeSize = 300;
  const scale = probeSize / Math.max(sourceCanvas.width, sourceCanvas.height);
  const probeCanvas = document.createElement("canvas");
  probeCanvas.width = Math.round(sourceCanvas.width * scale);
  probeCanvas.height = Math.round(sourceCanvas.height * scale);
  const probeCtx = probeCanvas.getContext("2d", { willReadFrequently: true });
  if (!probeCtx) return 0;
  probeCtx.drawImage(sourceCanvas, 0, 0, probeCanvas.width, probeCanvas.height);

  let bestAngle = 0;
  let bestVariance = -Infinity;

  for (let angle = -5; angle <= 5; angle += 1) {
    const rotated = document.createElement("canvas");
    rotated.width = probeCanvas.width;
    rotated.height = probeCanvas.height;
    const rCtx = rotated.getContext("2d", { willReadFrequently: true });
    if (!rCtx) continue;
    rCtx.translate(rotated.width / 2, rotated.height / 2);
    rCtx.rotate((angle * Math.PI) / 180);
    rCtx.drawImage(
      probeCanvas,
      -probeCanvas.width / 2,
      -probeCanvas.height / 2,
    );

    const imgData = rCtx.getImageData(0, 0, rotated.width, rotated.height);
    const rowSums = new Float64Array(rotated.height);
    for (let y = 0; y < rotated.height; y += 1) {
      let s = 0;
      for (let x = 0; x < rotated.width; x += 1)
        s += imgData.data[(y * rotated.width + x) * 4];
      rowSums[y] = s;
    }
    const mean = rowSums.reduce((a, b) => a + b, 0) / rowSums.length;
    const variance =
      rowSums.reduce((acc, v) => acc + (v - mean) ** 2, 0) / rowSums.length;
    if (variance > bestVariance) {
      bestVariance = variance;
      bestAngle = angle;
    }
  }
  return bestAngle;
}

function rotateCanvas(
  source: HTMLCanvasElement,
  angleDegrees: number,
): HTMLCanvasElement {
  if (Math.abs(angleDegrees) < 0.5) return source;
  const output = document.createElement("canvas");
  output.width = source.width;
  output.height = source.height;
  const ctx = output.getContext("2d");
  if (!ctx) return source;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, output.width, output.height);
  ctx.translate(output.width / 2, output.height / 2);
  ctx.rotate((angleDegrees * Math.PI) / 180);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return output;
}

function trimWhiteMargins(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;
  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);
  const WHITE_THRESHOLD = 245;

  const isRowContent = (y: number): boolean => {
    for (let x = 0; x < width; x += 4)
      if (data[(y * width + x) * 4] < WHITE_THRESHOLD) return true;
    return false;
  };
  const isColContent = (x: number): boolean => {
    for (let y = 0; y < height; y += 4)
      if (data[(y * width + x) * 4] < WHITE_THRESHOLD) return true;
    return false;
  };

  let top = 0;
  while (top < height - 1 && !isRowContent(top)) top += 1;
  let bottom = height - 1;
  while (bottom > top && !isRowContent(bottom)) bottom -= 1;
  let left = 0;
  while (left < width - 1 && !isColContent(left)) left += 1;
  let right = width - 1;
  while (right > left && !isColContent(right)) right -= 1;

  const cropWidth = right - left;
  const cropHeight = bottom - top;
  if (cropWidth < width * 0.2 || cropHeight < height * 0.2) return canvas;

  const cropped = document.createElement("canvas");
  cropped.width = cropWidth;
  cropped.height = cropHeight;
  cropped
    .getContext("2d")
    ?.drawImage(
      canvas,
      left,
      top,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );
  return cropped;
}

function preprocessCanvas(rawCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const skewAngle = estimateSkewAngleDegrees(rawCanvas);
  const deskewed = rotateCanvas(rawCanvas, -skewAngle);
  const ctx = deskewed.getContext("2d", { willReadFrequently: true });
  if (!ctx) return deskewed;

  const imageData = ctx.getImageData(0, 0, deskewed.width, deskewed.height);
  toGrayscale(imageData);
  stretchContrast(imageData);
  sharpen(imageData);
  const threshold = computeOtsuThreshold(imageData);
  binarize(imageData, threshold);
  ctx.putImageData(imageData, 0, 0);

  return trimWhiteMargins(deskewed);
}

/* ----------------------------------------------------------------------- *
 * Qualité image
 * ----------------------------------------------------------------------- */

function computeImageQualityMetrics(
  rawCanvas: HTMLCanvasElement,
): ImageQualityMetrics {
  const ctx = rawCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx)
    throw new PipelineError(
      "CANVAS_UNAVAILABLE",
      "Contexte Canvas 2D indisponible.",
    );
  const imageData = ctx.getImageData(0, 0, rawCanvas.width, rawCanvas.height);
  const gray = new Float32Array(imageData.width * imageData.height);
  const { data } = imageData;

  let sum = 0;
  let nearWhiteCount = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const v = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[p] = v;
    sum += v;
    if (v > 240) nearWhiteCount += 1;
  }
  const pixelCount = gray.length;
  const brightnessMean = sum / pixelCount;

  let varianceSum = 0;
  for (let p = 0; p < pixelCount; p += 1)
    varianceSum += (gray[p] - brightnessMean) ** 2;
  const contrastStdDev = Math.sqrt(varianceSum / pixelCount);

  const grayImageData = new ImageData(imageData.width, imageData.height);
  for (let p = 0, i = 0; p < pixelCount; p += 1, i += 4) {
    grayImageData.data[i] = gray[p];
    grayImageData.data[i + 1] = gray[p];
    grayImageData.data[i + 2] = gray[p];
    grayImageData.data[i + 3] = 255;
  }
  const laplacian = convolve3x3(grayImageData, [0, 1, 0, 1, -4, 1, 0, 1, 0]);
  let lapMean = 0;
  for (let i = 0; i < laplacian.length; i += 1) lapMean += laplacian[i];
  lapMean /= laplacian.length;
  let lapVarianceSum = 0;
  for (let i = 0; i < laplacian.length; i += 1)
    lapVarianceSum += (laplacian[i] - lapMean) ** 2;
  const blurVariance = lapVarianceSum / laplacian.length;

  const emptyRatio = nearWhiteCount / pixelCount;

  return {
    brightnessMean,
    contrastStdDev,
    blurVariance,
    emptyRatio,
    widthPx: rawCanvas.width,
    heightPx: rawCanvas.height,
    isTooDark: brightnessMean < 60,
    // Augmentation du seuil de surexposition de 225 à 235 pour éviter les faux positifs
    isTooBright: brightnessMean > 235,
    isBlurry: blurVariance < 80,
    isLowContrast: contrastStdDev < 15,
    isLowResolution: Math.max(rawCanvas.width, rawCanvas.height) < 800,
    isNearlyEmpty: emptyRatio > 0.97,
  };
}

function qualityMetricsToScore(metrics: ImageQualityMetrics): number {
  let score = 100;
  if (metrics.isTooDark) score -= 20;
  if (metrics.isTooBright) score -= 15;
  if (metrics.isBlurry) score -= 25;
  if (metrics.isLowContrast) score -= 15;
  if (metrics.isLowResolution) score -= 15;
  if (metrics.isNearlyEmpty) score -= 30;
  return Math.max(0, Math.min(100, score));
}

/* ----------------------------------------------------------------------- *
 * Recherche floue (Levenshtein) - version améliorée
 * ----------------------------------------------------------------------- */

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let previousRow = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) previousRow[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    const currentRow = new Array<number>(b.length + 1);
    currentRow[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(
        currentRow[j - 1] + 1,
        previousRow[j] + 1,
        previousRow[j - 1] + cost,
      );
    }
    previousRow = currentRow;
  }
  return previousRow[b.length];
}

// Normalisation : minuscules, suppression des accents, conservation des lettres et chiffres
function normalizeForMatching(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ""); // ← modification clé : on garde les chiffres
}

function fuzzyCountOccurrences(
  text: string,
  targetWords: string[],
  maxNormalizedDistance: number,
): { occurrences: number; matchedWords: string[] } {
  const normalizedTargets = targetWords.map((w) => normalizeForMatching(w));

  const tokens = (text.match(/[a-zA-Z0-9]+/g) || [])
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const matched: string[] = [];
  let totalOccurrences = 0;

  for (const token of tokens) {
    const normalizedToken = normalizeForMatching(token);
    if (normalizedToken.length === 0) continue;

    for (let i = 0; i < normalizedTargets.length; i++) {
      const target = normalizedTargets[i];
      if (target.length === 0) continue;

      // Calcul de la distance de Levenshtein normalisée
      const distance = levenshteinDistance(normalizedToken, target);
      const normalizedDistance = distance / Math.max(target.length, 1);

      // Seulement la distance normalisée, plus de sous-chaîne
      if (normalizedDistance <= maxNormalizedDistance) {
        matched.push(token);
        totalOccurrences++;
        break;
      }
    }
  }

  return {
    occurrences: totalOccurrences,
    matchedWords: Array.from(new Set(matched)),
  };
}
/* ----------------------------------------------------------------------- *
 * Score de fraude (complet)
 * ----------------------------------------------------------------------- */

function computeFraudScore(params: {
  averageOcrConfidence: number;
  occurrences: number;
  qualityFlags: ImageQualityMetrics[];
  targetWords: string[];
  minOccurrences: number;
}): { score: number; breakdown: FraudScoreBreakdown[]; warnings: string[] } {
  const breakdown: FraudScoreBreakdown[] = [];
  const warnings: string[] = [];
  let score = 100;

  const applyPenalty = (label: string, penalty: number, warning?: string) => {
    score -= penalty;
    breakdown.push({ label, penalty });
    if (warning) warnings.push(warning);
  };

  // Pénalité liée à la confiance OCR
  if (params.averageOcrConfidence < 50) {
    applyPenalty(
      "Confiance OCR très faible (<50%)",
      30,
      "Confiance OCR très faible.",
    );
  } else if (params.averageOcrConfidence < 70) {
    applyPenalty("Confiance OCR faible (<70%)", 15, "Confiance OCR faible.");
  }

  // Pénalité liée à l'absence / insuffisance d'occurrences
  if (params.occurrences === 0) {
    applyPenalty(
      "Aucun mot cible trouvé",
      40,
      `Aucun des mots "${params.targetWords.join(", ")}" détecté.`,
    );
  } else if (params.occurrences < params.minOccurrences) {
    applyPenalty(
      `Occurrences totales insuffisantes (${params.occurrences}/${params.minOccurrences})`,
      25,
      `Occurrences totales insuffisantes (${params.occurrences}/${params.minOccurrences}).`,
    );
  }

  // Qualité image : on applique les pénalités pour chaque page (flags)
  for (const q of params.qualityFlags) {
    if (q.isBlurry) {
      applyPenalty(
        "Image floue détectée",
        20,
        "Image floue détectée sur au moins une page.",
      );
      break;
    }
  }
  for (const q of params.qualityFlags) {
    if (q.isTooDark) {
      applyPenalty("Image trop sombre", 10, "Image trop sombre détectée.");
      break;
    }
  }
  for (const q of params.qualityFlags) {
    if (q.isTooBright) {
      applyPenalty("Image surexposée", 10, "Image surexposée détectée.");
      break;
    }
  }
  for (const q of params.qualityFlags) {
    if (q.isLowContrast) {
      applyPenalty(
        "Contraste trop faible",
        10,
        "Contraste trop faible détecté.",
      );
      break;
    }
  }
  for (const q of params.qualityFlags) {
    if (q.isLowResolution) {
      applyPenalty("Résolution faible", 15, "Résolution faible détectée.");
      break;
    }
  }
  for (const q of params.qualityFlags) {
    if (q.isNearlyEmpty) {
      applyPenalty("Document quasi vide", 30, "Document quasi vide détecté.");
      break;
    }
  }

  return { score: Math.max(0, Math.min(100, score)), breakdown, warnings };
}

function classifyStatus(fraudScore: number): DocumentStatus {
  if (fraudScore >= 70) return "OK";
  if (fraudScore >= 40) return "WARNING";
  return "SUSPICIOUS";
}

/* ----------------------------------------------------------------------- *
 * OCR (Tesseract.js) — worker partagé
 * ----------------------------------------------------------------------- */

let sharedOcrWorkerPromise: Promise<TesseractWorker> | null = null;

async function getOcrWorker(): Promise<TesseractWorker> {
  if (!sharedOcrWorkerPromise) {
    sharedOcrWorkerPromise = createWorker("fra+eng", 1, { logger: () => {} });
  }
  return sharedOcrWorkerPromise;
}

/** Libère le worker OCR partagé. À appeler éventuellement au démontage de l'app. */
export async function terminateOcrWorker(): Promise<void> {
  if (sharedOcrWorkerPromise) {
    const worker = await sharedOcrWorkerPromise;
    await worker.terminate();
    sharedOcrWorkerPromise = null;
  }
}

async function runOcrOnCanvas(
  canvas: HTMLCanvasElement,
  pageNumber: number,
): Promise<PageOcrResult> {
  const worker = await getOcrWorker();
  const startedAt = performance.now();
  const { data } = await worker.recognize(canvas);
  const durationMs = performance.now() - startedAt;
  const text = data.text ?? "";
  const words = text.trim().length > 0 ? text.trim().split(/\s+/) : [];
  return {
    pageNumber,
    text,
    confidence: data.confidence ?? 0,
    wordCount: words.length,
    charCount: text.length,
    durationMs,
  };
}

/* ----------------------------------------------------------------------- *
 * Rendu PDF
 * ----------------------------------------------------------------------- */

async function loadPdfDocument(file: File): Promise<pdfjsLib.PDFDocumentProxy> {
  const buffer = await file.arrayBuffer();
  try {
    return await pdfjsLib.getDocument({ data: buffer }).promise;
  } catch {
    throw new PipelineError(
      "PDF_CORRUPTED",
      "Le fichier PDF est invalide ou corrompu.",
    );
  }
}

async function renderPdfPageToCanvas(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  targetLongEdge: number,
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale =
    targetLongEdge / Math.max(baseViewport.width, baseViewport.height);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx)
    throw new PipelineError(
      "CANVAS_UNAVAILABLE",
      "Contexte Canvas 2D indisponible.",
    );
  await page.render({ canvasContext: ctx, viewport }).promise;
  page.cleanup(); // libère la mémoire de la page
  return canvas;
}

/* ----------------------------------------------------------------------- *
 * Décodage image
 * ----------------------------------------------------------------------- */

async function decodeImageFile(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new PipelineError(
      "IMAGE_NOT_DECODABLE",
      "Image illisible ou corrompue.",
    );
  }
}

/* ----------------------------------------------------------------------- *
 * Orchestration
 * ----------------------------------------------------------------------- */

async function processImageFile(
  file: File,
  options: PipelineOptions,
  cb: AnalysisCallbacks,
): Promise<AnalysisResult> {
  const startedAt = performance.now();
  cb.onProgress(5, "Décodage de l'image…");
  const bitmap = await decodeImageFile(file);

  const dimCheck = validateDimensions(bitmap.width, bitmap.height, options);
  if (!dimCheck.ok) throw new PipelineError(dimCheck.code, dimCheck.message);
  assertNotAborted(cb.signal);

  cb.onProgress(20, "Prétraitement de l'image…");
  const rawCanvas = createCanvasFromBitmap(bitmap, options.ocrTargetLongEdge);
  const qualityMetrics = computeImageQualityMetrics(rawCanvas);
  const preprocessed = preprocessCanvas(rawCanvas);
  assertNotAborted(cb.signal);

  cb.onProgress(50, "Reconnaissance de texte (OCR)…");
  const pageResult = await runOcrOnCanvas(preprocessed, 1);
  assertNotAborted(cb.signal);

  cb.onProgress(85, "Analyse anti-fraude…");
  const { occurrences, matchedWords } = fuzzyCountOccurrences(
    pageResult.text,
    options.targetWords,
    options.maxNormalizedDistance,
  );

  // --- NOUVEAU : Rejet si aucune occurrence trouvée ---
  if (occurrences === 0) {
    throw new PipelineError(
      "NO_OCCURRENCES",
      `Aucun des mots cibles (“${options.targetWords.join(", ")}”) n’a été trouvé dans le document.`,
    );
  }
  // ------------------------------------------------

  const fraud = computeFraudScore({
    averageOcrConfidence: pageResult.confidence,
    occurrences,
    qualityFlags: [qualityMetrics],
    targetWords: options.targetWords,
    minOccurrences: options.minOccurrences,
  });

  cb.onProgress(100, "Terminé");
  return {
    fileName: file.name,
    status: classifyStatus(fraud.score),
    fraudScore: fraud.score,
    averageOCRConfidence: pageResult.confidence,
    processingTimeMs: performance.now() - startedAt,
    occurrences,
    matchedWords,
    warnings: fraud.warnings,
    pages: 1,
    text: pageResult.text,
    imageQuality: qualityMetricsToScore(qualityMetrics),
    scoreBreakdown: fraud.breakdown,
    perPage: [pageResult],
  };
}

async function processPdfFile(
  file: File,
  options: PipelineOptions,
  cb: AnalysisCallbacks,
): Promise<AnalysisResult> {
  const startedAt = performance.now();
  cb.onProgress(5, "Chargement du PDF…");
  const pdf = await loadPdfDocument(file);

  if (pdf.numPages === 0)
    throw new PipelineError("PDF_EMPTY", "Le PDF ne contient aucune page.");
  if (pdf.numPages > options.maxPdfPages) {
    throw new PipelineError(
      "TOO_MANY_PAGES",
      `Le PDF contient trop de pages (${pdf.numPages} > ${options.maxPdfPages}).`,
    );
  }
  assertNotAborted(cb.signal);

  const perPage: PageOcrResult[] = [];
  const qualityMetrics: ImageQualityMetrics[] = [];
  const textsByPage: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    assertNotAborted(cb.signal);
    const baseProgress = 5 + ((pageNumber - 1) / pdf.numPages) * 80;
    cb.onProgress(baseProgress, `Rendu page ${pageNumber}/${pdf.numPages}…`);

    const rawCanvas = await renderPdfPageToCanvas(
      pdf,
      pageNumber,
      options.ocrTargetLongEdge,
    );
    const dimCheck = validateDimensions(
      rawCanvas.width,
      rawCanvas.height,
      options,
    );
    if (!dimCheck.ok) continue; // page ignorée plutôt que document rejeté entièrement

    qualityMetrics.push(computeImageQualityMetrics(rawCanvas));
    const preprocessed = preprocessCanvas(rawCanvas);

    cb.onProgress(
      baseProgress + 40 / pdf.numPages,
      `OCR page ${pageNumber}/${pdf.numPages}…`,
    );
    const pageResult = await runOcrOnCanvas(preprocessed, pageNumber);
    perPage.push(pageResult);
    textsByPage.push(`[Page ${pageNumber}]\n${pageResult.text}`);
  }

  // Nettoyage du document PDF (robuste)
  try {
    if (typeof pdf.destroy === "function") {
      await pdf.destroy();
    } else if (typeof pdf.cleanup === "function") {
      pdf.cleanup();
    }
  } catch (_) {
    // Ignorer les erreurs de nettoyage
  }

  assertNotAborted(cb.signal);

  if (perPage.length === 0)
    throw new PipelineError(
      "NO_VALID_PAGE",
      "Aucune page valide n'a pu être traitée.",
    );

  cb.onProgress(90, "Analyse anti-fraude…");
  const mergedText = textsByPage.join("\n\n");
  const { occurrences, matchedWords } = fuzzyCountOccurrences(
    mergedText,
    options.targetWords,
    options.maxNormalizedDistance,
  );

  // --- NOUVEAU : Rejet si aucune occurrence trouvée ---
  if (occurrences === 0) {
    throw new PipelineError(
      "NO_OCCURRENCES",
      `Aucun des mots cibles (“${options.targetWords.join(", ")}”) n’a été trouvé dans le document.`,
    );
  }
  // ------------------------------------------------

  const averageConfidence =
    perPage.reduce((sum, p) => sum + p.confidence, 0) / perPage.length;

  const fraud = computeFraudScore({
    averageOcrConfidence: averageConfidence,
    occurrences,
    qualityFlags: qualityMetrics,
    targetWords: options.targetWords,
    minOccurrences: options.minOccurrences,
  });

  const averageImageQuality =
    qualityMetrics.reduce((sum, q) => sum + qualityMetricsToScore(q), 0) /
    (qualityMetrics.length || 1);

  cb.onProgress(100, "Terminé");
  return {
    fileName: file.name,
    status: classifyStatus(fraud.score),
    fraudScore: fraud.score,
    averageOCRConfidence: averageConfidence,
    processingTimeMs: performance.now() - startedAt,
    occurrences,
    matchedWords,
    warnings: fraud.warnings,
    pages: perPage.length,
    text: mergedText,
    imageQuality: averageImageQuality,
    scoreBreakdown: fraud.breakdown,
    perPage,
  };
}

/**
 * Point d'entrée public du pipeline : valide puis analyse un fichier
 * (image ou PDF), avec support de l'annulation et de la progression.
 */
export async function analyzeDocument(
  file: File,
  partialOptions: Partial<PipelineOptions>,
  cb: AnalysisCallbacks,
): Promise<AnalysisResult> {
  const options: PipelineOptions = {
    ...DEFAULT_PIPELINE_OPTIONS,
    ...partialOptions,
    targetWords:
      partialOptions.targetWords || DEFAULT_PIPELINE_OPTIONS.targetWords,
  };

  const validation = await validateFileFast(file, options);
  if (!validation.ok)
    throw new PipelineError(validation.code, validation.message);
  assertNotAborted(cb.signal);

  const mime = (file.type as AcceptedMime) || guessMimeFromExtension(file.name);
  if (mime === "application/pdf") return processPdfFile(file, options, cb);
  return processImageFile(file, options, cb);
}
