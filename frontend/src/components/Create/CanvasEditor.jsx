import { useEffect, useRef, useState } from 'react';
import { Canvas, PencilBrush, Circle, Rect, IText, FabricImage } from 'fabric';
import './CanvasEditor.css';

const COLORS = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];
const BRUSH_SIZES = [2, 5, 10, 20];

const CanvasEditor = ({ initialData, onChange, readOnly = false }) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('draw'); // draw, circle, rect, text, select

  // Export canvas as PNG data URL
  const exportToPNG = () => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    return canvas.toDataURL({
      format: 'png',
      quality: 0.9,
      multiplier: 1,
    });
  };

  // Export canvas as JSON
  const exportToJSON = () => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    return JSON.stringify(canvas.toJSON());
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize fabric canvas
    const canvas = new Canvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: '#ffffff',
      isDrawingMode: !readOnly,
    });

    fabricRef.current = canvas;

    // Set up brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;

    // Disable interactions if read-only
    if (readOnly) {
      canvas.selection = false;
      canvas.hoverCursor = 'default';
    }

    // Load initial data if exists
    if (initialData) {
      try {
        const parsed = typeof initialData === 'string' ? JSON.parse(initialData) : initialData;
        canvas.loadFromJSON(parsed).then(() => {
          canvas.renderAll();
          if (readOnly) {
            // Disable selection on all objects
            canvas.getObjects().forEach(obj => {
              obj.selectable = false;
              obj.evented = false;
            });
          }
        });
      } catch (e) {
        console.error('Error loading canvas data:', e);
      }
    }

    // Save on changes - return both JSON and PNG
    const handleChange = () => {
      if (readOnly) return;
      const json = exportToJSON();
      const png = exportToPNG();
      onChange?.({ json, png });
    };

    canvas.on('object:added', handleChange);
    canvas.on('object:modified', handleChange);
    canvas.on('object:removed', handleChange);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update brush settings when they change
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [activeColor, brushSize]);

  // Handle tool changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || readOnly) return;

    canvas.isDrawingMode = tool === 'draw';

    if (tool === 'select') {
      canvas.selection = true;
    }
  }, [tool, readOnly]);

  const addShape = (type) => {
    const canvas = fabricRef.current;
    if (!canvas || readOnly) return;

    let shape;
    const center = { x: 200, y: 200 };

    if (type === 'circle') {
      shape = new Circle({
        radius: 40,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: brushSize,
        left: center.x - 40,
        top: center.y - 40,
      });
    } else if (type === 'rect') {
      shape = new Rect({
        width: 80,
        height: 80,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: brushSize,
        left: center.x - 40,
        top: center.y - 40,
      });
    } else if (type === 'text') {
      shape = new IText('Tap to edit', {
        left: center.x - 50,
        top: center.y - 10,
        fontSize: 20,
        fill: activeColor,
        fontFamily: 'sans-serif',
      });
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      setTool('select');
    }
  };

  const addImage = (file) => {
    const canvas = fabricRef.current;
    if (!canvas || readOnly) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      FabricImage.fromURL(e.target.result).then((fabricImg) => {
        // Scale image to fit canvas while maintaining aspect ratio
        const maxSize = 300;
        const scale = Math.min(maxSize / fabricImg.width, maxSize / fabricImg.height, 1);

        fabricImg.scale(scale);
        fabricImg.set({
          left: (400 - fabricImg.width * scale) / 2,
          top: (400 - fabricImg.height * scale) / 2,
        });

        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.renderAll();
        setTool('select');
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      addImage(file);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const clearCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas || readOnly) return;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.renderAll();
  };

  const undo = () => {
    const canvas = fabricRef.current;
    if (!canvas || readOnly) return;
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  // If read-only, only render the canvas without toolbar
  if (readOnly) {
    return (
      <div className="canvas-editor readonly">
        <div className="canvas-container">
          <canvas ref={canvasRef} />
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-editor">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {/* Toolbar */}
      <div className="canvas-toolbar">
        {/* Tools */}
        <div className="tool-group">
          <button
            className={`tool-btn ${tool === 'draw' ? 'active' : ''}`}
            onClick={() => setTool('draw')}
            title="Draw"
          >
            ✏️
          </button>
          <button
            className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
            onClick={() => setTool('select')}
            title="Select"
          >
            👆
          </button>
          <button
            className="tool-btn"
            onClick={() => addShape('circle')}
            title="Circle"
          >
            ⭕
          </button>
          <button
            className="tool-btn"
            onClick={() => addShape('rect')}
            title="Rectangle"
          >
            ⬜
          </button>
          <button
            className="tool-btn"
            onClick={() => addShape('text')}
            title="Text"
          >
            T
          </button>
          <button
            className="tool-btn"
            onClick={triggerImageUpload}
            title="Add Image"
          >
            🖼️
          </button>
        </div>

        {/* Actions */}
        <div className="tool-group">
          <button className="tool-btn" onClick={undo} title="Undo">
            ↩️
          </button>
          <button className="tool-btn danger" onClick={clearCanvas} title="Clear">
            🗑️
          </button>
        </div>
      </div>

      {/* Color picker */}
      <div className="color-picker">
        {COLORS.map((color) => (
          <button
            key={color}
            className={`color-btn ${activeColor === color ? 'active' : ''}`}
            style={{
              backgroundColor: color,
              border: color === '#ffffff' ? '2px solid #e5e7eb' : 'none'
            }}
            onClick={() => setActiveColor(color)}
          />
        ))}
      </div>

      {/* Brush size */}
      <div className="brush-sizes">
        {BRUSH_SIZES.map((size) => (
          <button
            key={size}
            className={`size-btn ${brushSize === size ? 'active' : ''}`}
            onClick={() => setBrushSize(size)}
          >
            <span
              className="size-dot"
              style={{
                width: Math.min(size * 2, 24),
                height: Math.min(size * 2, 24),
              }}
            />
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="canvas-container">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default CanvasEditor;
