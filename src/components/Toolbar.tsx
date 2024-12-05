import { Pencil, Eraser, Trash2, Square, Circle, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface ToolbarProps {
  activeTool: "pencil" | "eraser" | "fill" | "rectangle" | "circle";
  setActiveTool: (tool: "pencil" | "eraser" | "fill" | "rectangle" | "circle") => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
}

export const Toolbar = ({
  activeTool,
  setActiveTool,
  brushSize,
  setBrushSize,
}: ToolbarProps) => {
  const handleClear = () => {
    const canvas = document.querySelector("canvas");
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      toast("Canvas cleared!");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-2">
        <Button
          variant={activeTool === "pencil" ? "default" : "outline"}
          size="icon"
          onClick={() => setActiveTool("pencil")}
          className="w-10 h-10"
        >
          <Pencil className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTool === "eraser" ? "default" : "outline"}
          size="icon"
          onClick={() => setActiveTool("eraser")}
          className="w-10 h-10"
        >
          <Eraser className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTool === "fill" ? "default" : "outline"}
          size="icon"
          onClick={() => setActiveTool("fill")}
          className="w-10 h-10"
        >
          <Paintbrush className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTool === "rectangle" ? "default" : "outline"}
          size="icon"
          onClick={() => setActiveTool("rectangle")}
          className="w-10 h-10"
        >
          <Square className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTool === "circle" ? "default" : "outline"}
          size="icon"
          onClick={() => setActiveTool("circle")}
          className="w-10 h-10"
        >
          <Circle className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleClear}
          className="w-10 h-10"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
      <div className="w-32 flex items-center gap-2">
        <span className="text-sm text-gray-500">Size:</span>
        <Slider
          value={[brushSize]}
          onValueChange={(value) => setBrushSize(value[0])}
          min={1}
          max={20}
          step={1}
          className="w-24"
        />
      </div>
    </div>
  );
};