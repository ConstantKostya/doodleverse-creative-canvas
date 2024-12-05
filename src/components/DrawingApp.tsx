import { useState, useEffect } from "react";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { ColorPicker } from "./ColorPicker";
import { toast } from "sonner";

export const DrawingApp = () => {
  const [activeColor, setActiveColor] = useState("#1A1F2C");
  const [activeTool, setActiveTool] = useState<"pencil" | "eraser" | "fill" | "rectangle" | "circle">("pencil");
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    toast("Welcome to the Drawing App! Start drawing on the canvas.");
  }, []);

  return (
    <div className="min-h-screen bg-muted p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-md animate-slide-in">
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
          />
          <ColorPicker activeColor={activeColor} setActiveColor={setActiveColor} />
        </div>
        <Canvas
          activeColor={activeColor}
          activeTool={activeTool}
          brushSize={brushSize}
        />
      </div>
    </div>
  );
};