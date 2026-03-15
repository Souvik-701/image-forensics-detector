function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export interface ELAResult {
  elaDataUrl: string;
  variance: number;
  width: number;
  height: number;
}

export async function runELA(imageFile: File): Promise<ELAResult> {
  const originalUrl = URL.createObjectURL(imageFile);
  let originalImg: HTMLImageElement;
  try {
    originalImg = await loadImage(originalUrl);
  } finally {
    URL.revokeObjectURL(originalUrl);
  }

  const w = originalImg.width;
  const h = originalImg.height;

  // Draw original to canvas
  const canvas1 = document.createElement("canvas");
  canvas1.width = w;
  canvas1.height = h;
  const ctx1 = canvas1.getContext("2d")!;
  ctx1.drawImage(originalImg, 0, 0);
  const originalData = ctx1.getImageData(0, 0, w, h);

  // Recompress as JPEG 75%
  const jpegDataUrl = canvas1.toDataURL("image/jpeg", 0.75);
  const recompressedImg = await loadImage(jpegDataUrl);

  // Draw recompressed
  const canvas2 = document.createElement("canvas");
  canvas2.width = w;
  canvas2.height = h;
  const ctx2 = canvas2.getContext("2d")!;
  ctx2.drawImage(recompressedImg, 0, 0);
  const recompressedData = ctx2.getImageData(0, 0, w, h);

  // Compute amplified difference
  const diffCanvas = document.createElement("canvas");
  diffCanvas.width = w;
  diffCanvas.height = h;
  const diffCtx = diffCanvas.getContext("2d")!;
  const diffImageData = diffCtx.createImageData(w, h);

  let sumBrightness = 0;
  let sumSqBrightness = 0;
  const n = w * h;

  for (let i = 0; i < originalData.data.length; i += 4) {
    const rDiff = Math.min(
      255,
      Math.abs(originalData.data[i] - recompressedData.data[i]) * 10,
    );
    const gDiff = Math.min(
      255,
      Math.abs(originalData.data[i + 1] - recompressedData.data[i + 1]) * 10,
    );
    const bDiff = Math.min(
      255,
      Math.abs(originalData.data[i + 2] - recompressedData.data[i + 2]) * 10,
    );

    diffImageData.data[i] = rDiff;
    diffImageData.data[i + 1] = gDiff;
    diffImageData.data[i + 2] = bDiff;
    diffImageData.data[i + 3] = 255;

    const brightness = (rDiff + gDiff + bDiff) / 3;
    sumBrightness += brightness;
    sumSqBrightness += brightness * brightness;
  }

  diffCtx.putImageData(diffImageData, 0, 0);

  const mean = sumBrightness / n;
  const variance = Math.sqrt(Math.max(0, sumSqBrightness / n - mean * mean));

  return {
    elaDataUrl: diffCanvas.toDataURL("image/png"),
    variance,
    width: w,
    height: h,
  };
}
