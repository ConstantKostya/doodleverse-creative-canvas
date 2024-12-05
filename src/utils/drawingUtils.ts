export const floodFill = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string,
  width: number,
  height: number
) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  const startPos = (startY * width + startX) * 4;
  const startR = pixels[startPos];
  const startG = pixels[startPos + 1];
  const startB = pixels[startPos + 2];

  const fillR = parseInt(fillColor.slice(1, 3), 16);
  const fillG = parseInt(fillColor.slice(3, 5), 16);
  const fillB = parseInt(fillColor.slice(5, 7), 16);

  if (colorMatch(startR, startG, startB, fillR, fillG, fillB)) {
    return;
  }

  const stack = [[startX, startY]];
  
  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const pos = (y * width + x) * 4;

    if (
      x < 0 ||
      x >= width ||
      y < 0 ||
      y >= height ||
      !colorMatch(pixels[pos], pixels[pos + 1], pixels[pos + 2], startR, startG, startB)
    ) {
      continue;
    }

    pixels[pos] = fillR;
    pixels[pos + 1] = fillG;
    pixels[pos + 2] = fillB;
    pixels[pos + 3] = 255;

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
};

export const colorMatch = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
  const tolerance = 30;
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
};

export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: "rectangle" | "circle" | "triangle",
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  fillShapes: boolean
) => {
  if (shape === "rectangle") {
    const width = endX - startX;
    const height = endY - startY;
    if (fillShapes) {
      ctx.fillRect(startX, startY, width, height);
    }
    ctx.strokeRect(startX, startY, width, height);
  } else if (shape === "circle") {
    const radius = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    if (fillShapes) {
      ctx.fill();
    }
    ctx.stroke();
  } else if (shape === "triangle") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(startX - (endX - startX), endY);
    ctx.closePath();
    if (fillShapes) {
      ctx.fill();
    }
    ctx.stroke();
  }
};

export const saveCanvas = (canvas: HTMLCanvasElement) => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();
  link.click();
};