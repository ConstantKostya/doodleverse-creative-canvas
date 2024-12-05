interface ColorPickerProps {
  activeColor: string;
  setActiveColor: (color: string) => void;
}

export const ColorPicker = ({ activeColor, setActiveColor }: ColorPickerProps) => {
  const colors = [
    "#1A1F2C",
    "#9b87f5",
    "#7E69AB",
    "#ff5757",
    "#4CAF50",
    "#2196F3",
    "#FFD700", // Added yellow
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Color:</span>
      <div className="flex gap-2">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
              activeColor === color ? "border-primary" : "border-transparent"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setActiveColor(color)}
          />
        ))}
        <input
          type="color"
          value={activeColor}
          onChange={(e) => setActiveColor(e.target.value)}
          className="w-8 h-8 rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
};