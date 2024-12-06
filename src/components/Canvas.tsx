import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { floodFill, drawShape, saveCanvas } from "@/utils/drawingUtils";

interface CanvasProps {
  activeColor: string;
  activeTool: "pencil" | "eraser" | "fill" | "rectangle" | "circle" | "triangle" | "line";
  brushSize: number;
  fillShapes: boolean;
  onSave: () => void;
}

export const Canvas = ({ activeColor, activeTool, brushSize, fillShapes, onSave }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const undoStack = useRef<ImageData[]>([]);
  const [canUndo, setCanUndo] = useState(false);

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
    canvas.addEventListener("undoAction", handleUndo);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("undoAction", handleUndo);
    };
  }, []);

  useEffect(() => {
    if (!ctx.current) return;
    ctx.current.strokeStyle = activeTool === "eraser" ? "#ffffff" : activeColor;
    ctx.current.fillStyle = activeColor;
    ctx.current.lineWidth = brushSize;
    ctx.current.lineCap = "round";
    ctx.current.lineJoin = "round";
  }, [activeColor, activeTool, brushSize]);

  const saveState = () => {
    if (!ctx.current || !canvasRef.current) return;
    const imageData = ctx.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    undoStack.current.push(imageData);
    setCanUndo(true);
  };

  const handleUndo = () => {
    if (!ctx.current || !canvasRef.current || undoStack.current.length === 0) return;
    const previousState = undoStack.current.pop();
    if (previousState) {
      ctx.current.putImageData(previousState, 0, 0);
      setCanUndo(undoStack.current.length > 0);
      toast("Undo successful!");
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const pos = getPosition(e);
    lastX.current = pos.x;
    lastY.current = pos.y;
    startX.current = pos.x;
    startY.current = pos.y;

    if (activeTool === "fill") {
      saveState();
      if (ctx.current && canvasRef.current) {
        floodFill(
          ctx.current,
          Math.floor(pos.x),
          Math.floor(pos.y),
          activeColor,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
      isDrawing.current = false;
    } else {
      saveState();
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
    } else {
      // Create temporary canvas for preview
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tempCtx = tempCanvas.getContext("2d");
      
      if (tempCtx) {
        // Draw the previous state
        tempCtx.putImageData(undoStack.current[undoStack.current.length - 1], 0, 0);
        
        // Set the same styles as the main context
        tempCtx.strokeStyle = ctx.current.strokeStyle;
        tempCtx.fillStyle = ctx.current.fillStyle;
        tempCtx.lineWidth = ctx.current.lineWidth;
        
        if (activeTool === "line") {
          tempCtx.beginPath();
          tempCtx.moveTo(startX.current, startY.current);
          tempCtx.lineTo(pos.x, pos.y);
          tempCtx.stroke();
        } else if (["rectangle", "circle", "triangle"].includes(activeTool)) {
          drawShape(
            tempCtx,
            activeTool as "rectangle" | "circle" | "triangle",
            startX.current,
            startY.current,
            pos.x,
            pos.y,
            fillShapes
          );
        }
        
        // Update the main canvas with the preview
        ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.current.drawImage(tempCanvas, 0, 0);
      }
    }

    lastX.current = pos.x;
    lastY.current = pos.y;
  };

  const stopDrawing = () => {
    if (!isDrawing.current || !ctx.current || !canvasRef.current) return;

    if (activeTool === "rectangle" || activeTool === "circle" || activeTool === "triangle") {
      drawShape(
        ctx.current,
        activeTool,
        startX.current,
        startY.current,
        lastX.current,
        lastY.current,
        fillShapes
      );
    } else if (activeTool === "line") {
      ctx.current.beginPath();
      ctx.current.moveTo(startX.current, startY.current);
      ctx.current.lineTo(lastX.current, lastY.current);
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

  const handleSave = () => {
    if (!canvasRef.current) return;
    saveCanvas(canvasRef.current);
    onSave();
    toast("Drawing saved successfully!");
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