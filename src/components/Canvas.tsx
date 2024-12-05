import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface CanvasProps {
  activeColor: string;
  activeTool: "pencil" | "eraser";
  brushSize: number;
}

export const Canvas = ({ activeColor, activeTool, brushSize }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);

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
    ctx.current.lineWidth = brushSize;
    ctx.current.lineCap = "round";
    ctx.current.lineJoin = "round";
  }, [activeColor, activeTool, brushSize]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const pos = getPosition(e);
    lastX.current = pos.x;
    lastY.current = pos.y;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !ctx.current) return;

    e.preventDefault();
    const pos = getPosition(e);

    ctx.current.beginPath();
    ctx.current.moveTo(lastX.current, lastY.current);
    ctx.current.lineTo(pos.x, pos.y);
    ctx.current.stroke();

    lastX.current = pos.x;
    lastY.current = pos.y;
  };

  const stopDrawing = () => {
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