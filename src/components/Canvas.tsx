import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface CanvasProps {
  activeColor: string;
  activeTool: "pencil" | "eraser" | "fill" | "rectangle" | "circle";
  brushSize: number;
}

export const Canvas = ({ activeColor, activeTool, brushSize }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    ctx.current = canvas.getContext("2d");

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      if (ctx.current) {
        ctx.current.fillStyle = "#ffffff";
        ctx.current.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (!ctx.current) return;
    ctx.current.strokeStyle = activeTool === "eraser" ? "#ffffff" : activeColor;
    ctx.current.fillStyle = activeColor;
    ctx.current.lineWidth = brushSize;
    ctx.current.lineCap = "round";
    ctx.current.lineJoin = "round";
  }, [activeColor, activeTool, brushSize]);

  const colorMatch = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
    const tolerance = 30; // Adjust this value to control how strict the color matching is
    return (
      Math.abs(r1 - r2) <= tolerance &&
      Math.abs(g1 - g2) <= tolerance &&
      Math.abs(b1 - b2) <= tolerance
    );
  };

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    if (!ctx.current || !canvasRef.current) return;

    const imageData = ctx.current.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const pixels = imageData.data;

    const startPos = (startY * imageData.width + startX) * 4;
    const startR = pixels[startPos];
    const startG = pixels[startPos + 1];
    const startB = pixels[startPos + 2];

    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    if (
      colorMatch(startR, startG, startB, fillR, fillG, fillB)
    ) {
      return;
    }

    const stack = [[startX, startY]];
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const pos = (y * imageData.width + x) * 4;

      if (
        x < 0 ||
        x >= imageData.width ||
        y < 0 ||
        y >= imageData.height ||
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

    ctx.current.putImageData(imageData, 0, 0);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const pos = getPosition(e);
    lastX.current = pos.x;
    lastY.current = pos.y;
    startX.current = pos.x;
    startY.current = pos.y;

    if (activeTool === "fill") {
      floodFill(Math.floor(pos.x), Math.floor(pos.y), activeColor);
      isDrawing.current = false;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !ctx.current || !canvasRef.current) return;

    e.preventDefault();
    const pos = getPosition(e);

    if (activeTool === "pencil" || activeTool === "eraser") {
      ctx.current.beginPath();
      ctx.current.moveTo(lastX.current, lastY.current);
      ctx.current.lineTo(pos.x, pos.y);
      ctx.current.stroke();
    }

    lastX.current = pos.x;
    lastY.current = pos.y;
  };

  const stopDrawing = () => {
    if (!isDrawing.current || !ctx.current || !canvasRef.current) return;

    if (activeTool === "rectangle") {
      const width = lastX.current - startX.current;
      const height = lastY.current - startY.current;
      ctx.current.strokeRect(startX.current, startY.current, width, height);
      ctx.current.fillRect(startX.current, startY.current, width, height);
    } else if (activeTool === "circle") {
      const radius = Math.sqrt(
        Math.pow(lastX.current - startX.current, 2) +
        Math.pow(lastY.current - startY.current, 2)
      );
      ctx.current.beginPath();
      ctx.current.arc(startX.current, startY.current, radius, 0, Math.PI * 2);
      ctx.current.fill();
      ctx.current.stroke();
    }

    isDrawing.current = false;
  };

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = ((e as React.TouchEvent).touches?.[0]?.clientX || (e as React.MouseEvent).clientX) - rect.left;
    const y = ((e as React.TouchEvent).touches?.[0]?.clientY || (e as React.MouseEvent).clientY) - rect.top;
    return { x, y };
  };

  const clearCanvas = () => {
    if (!canvasRef.current || !ctx.current) return;
    ctx.current.fillStyle = "#ffffff";
    ctx.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    toast("Canvas cleared!");
  };

  return (
    <div className="w-full h-[600px] bg-white rounded-lg shadow-md overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
};