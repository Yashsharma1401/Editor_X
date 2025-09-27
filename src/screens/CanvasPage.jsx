import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import debounce from 'lodash.debounce';
import { loadScene, saveScene } from '../services/scenes';
import * as fabric from 'fabric';

// Constants
const ANIMATION_DURATION = 300;
const DEFAULT_SHADOW = {
  color: 'rgba(0,0,0,0.2)',
  blur: 10,
  offsetX: 2,
  offsetY: 2
};

export default function CanvasPage() {
  const { id } = useParams();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState('select');
  const [fillColor, setFillColor] = useState('#111827');
  const [textValue, setTextValue] = useState('');
  const [viewOnly, setViewOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Save state with debouncing
  const saveState = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !id || viewOnly) return;

    setIsLoading(true);
    try {
      const json = canvas.toJSON(['selectable', 'evented']);
      await saveScene(id, { json });
    } catch (error) {
      console.error('Failed to save scene:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, viewOnly]);

  const debouncedSave = useRef(debounce(saveState, 500)).current;

  // Initialize canvas
  const initializeCanvas = useCallback(() => {
    if (!containerRef.current) return null;

    const { width, height } = containerRef.current.getBoundingClientRect();
    return new fabric.Canvas('fabric-canvas', {
      selection: true,
      preserveObjectStacking: true,
      width,
      height
    });
  }, []);

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    canvas.setDimensions({ width, height });
    canvas.renderAll();
  }, []);

  // Main useEffect for canvas setup
  useEffect(() => {
    const canvas = initializeCanvas();
    if (!canvas) return;

    canvasRef.current = canvas;

    // Handle view-only mode
    const urlParams = new URLSearchParams(window.location.search);
    const isViewOnly = urlParams.get('viewOnly') === 'true';
    setViewOnly(isViewOnly);

    if (isViewOnly) {
      canvas.selection = false;
      canvas.forEachObject(obj => {
        obj.set({ selectable: false, evented: false });
      });
    }

    // Resize handling
    window.addEventListener('resize', handleResize);
    let resizeObserver;
    if ('ResizeObserver' in window && containerRef.current) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    // Event listeners
    const onChanged = () => {
      if (!viewOnly) {
        debouncedSave();
      }
    };

    canvas.on({
      'object:added': onChanged,
      'object:modified': onChanged,
      'object:removed': onChanged,
      'path:created': onChanged
    });

    // Load scene
    (async () => {
      setIsLoading(true);
      try {
        const templateData = sessionStorage.getItem(`template_${id}`);
        if (templateData) {
          const template = JSON.parse(templateData);
          sessionStorage.removeItem(`template_${id}`);

          template.objects.forEach(objData => {
            let obj;
            switch (objData.type) {
              case 'rect':
                obj = new fabric.Rect(objData);
                break;
              case 'circle':
                obj = new fabric.Circle(objData);
                break;
              case 'i-text':
                obj = new fabric.IText(objData.text, objData);
                break;
              default:
                return;
            }
            canvas.add(obj);
          });
        } else {
          const data = await loadScene(id);
          if (data?.json) {
            canvas.loadFromJSON(data.json, canvas.renderAll.bind(canvas));
          }
        }
      } catch (error) {
        console.error('Failed to load scene:', error);
      } finally {
        canvas.renderAll();
        setIsLoading(false);
      }
    })();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      canvas.dispose();
    };
  }, [id, initializeCanvas, handleResize, viewOnly, debouncedSave]);

  // Selection handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onSelection = () => {
      const obj = canvas.getActiveObject();
      if (obj) {
        setFillColor(typeof obj.fill === 'string' ? obj.fill : '#111827');
        setTextValue(obj.type === 'i-text' ? obj.text : '');
      } else {
        setTextValue('');
      }
    };

    canvas.on({
      'selection:created': onSelection,
      'selection:updated': onSelection,
      'selection:cleared': onSelection
    });

    return () => {
      canvas.off('selection:created', onSelection);
      canvas.off('selection:updated', onSelection);
      canvas.off('selection:cleared', onSelection);
    };
  }, []);

  // Show success notification
  const showSuccess = useCallback((message) => {
    const notification = document.getElementById('success-notification');
    if (notification) {
      notification.querySelector('div').textContent = message;
      notification.style.transform = 'translateX(0)';
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
      }, 2000);
    }
  }, []);

  // Shape and text addition
  const addShape = useCallback((type) => {
    const canvas = canvasRef.current;
    if (!canvas || viewOnly) {
      if (viewOnly) showSuccess('Cannot edit in view-only mode');
      return;
    }

    setIsLoading(true);
    let shape;
    const commonProps = {
      left: 100,
      top: 100,
      shadow: new fabric.Shadow(DEFAULT_SHADOW),
      opacity: 0,
      scaleX: 0.5,
      scaleY: 0.5
    };

    switch (type) {
      case 'rect':
        shape = new fabric.Rect({
          ...commonProps,
          width: 120,
          height: 80,
          fill: '#60a5fa'
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          ...commonProps,
          radius: 50,
          fill: '#f87171'
        });
        break;
      case 'text':
        shape = new fabric.IText('Double-click to edit', {
          ...commonProps,
          fill: '#111827',
          fontSize: 24
        });
        break;
      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);

    shape.animate({ opacity: 1, scaleX: 1, scaleY: 1 }, {
      duration: ANIMATION_DURATION,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
      onComplete: () => {
        setIsLoading(false);
        showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} added!`);
      }
    });
  }, [viewOnly, showSuccess]);

  const setPen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewOnly) {
      if (viewOnly) showSuccess('Cannot edit in view-only mode');
      return;
    }

    setActiveTool('pen');
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 3;
    canvas.freeDrawingBrush.color = '#111827';
  }, [viewOnly, showSuccess]);

  const setSelect = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewOnly) {
      if (viewOnly) showSuccess('Cannot edit in view-only mode');
      return;
    }

    setActiveTool('select');
    canvas.isDrawingMode = false;
  }, [viewOnly, showSuccess]);

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewOnly) {
      if (viewOnly) showSuccess('Cannot edit in view-only mode');
      return;
    }

    canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    debouncedSave();
  }, [viewOnly, debouncedSave, showSuccess]);

  const applyFill = useCallback((color) => {
    const canvas = canvasRef.current;
    if (!canvas || viewOnly) {
      if (viewOnly) showSuccess('Cannot edit in view-only mode');
      return;
    }

    const obj = canvas.getActiveObject();
    if (obj && 'set' in obj) {
      obj.set('fill', color);
      canvas.requestRenderAll();
      debouncedSave();
    }
  }, [viewOnly, debouncedSave, showSuccess]);

  const applyText = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewOnly) {
      if (viewOnly) showSuccess('Cannot edit in view-only mode');
      return;
    }

    const obj = canvas.getActiveObject();
    if (obj?.type === 'i-text') {
      obj.set('text', textValue);
      canvas.requestRenderAll();
      debouncedSave();
    }
  }, [textValue, viewOnly, debouncedSave, showSuccess]);

  const shareLink = useCallback(async () => {
    if (viewOnly) {
      showSuccess('Cannot share in view-only mode');
      return;
    }

    try {
      await saveState();
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      showSuccess('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to share link:', error);
      showSuccess('Failed to copy link');
      prompt('Copy this link:', window.location.href);
    }
  }, [saveState, viewOnly, showSuccess]);

  const exportPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `canvas-${id}.png`;
    link.href = canvas.toDataURL({ format: 'png', quality: 1 });
    link.click();
  }, [id]);

  const exportSVG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `canvas-${id}.svg`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  }, [id]);

  const toggleLock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewOnly) {
      if (viewOnly) showSuccess('Cannot edit in view-only mode');
      return;
    }

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        selectable: !activeObject.selectable,
        evented: !activeObject.evented
      });
      canvas.renderAll();
      debouncedSave();
    }
  }, [viewOnly, debouncedSave, showSuccess]);

  // Prevent interactions in view-only mode
  const handleInteraction = useCallback((action) => {
    return (...args) => {
      if (viewOnly) {
        showSuccess('Cannot edit in view-only mode');
        return;
      }
      action(...args);
    };
  }, [viewOnly, showSuccess]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          {/* Basic Tools */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1">
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                activeTool === 'select'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
              onClick={handleInteraction(setSelect)}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Select
              </span>
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-100 transition-all duration-200 transform hover:scale-105 shadow-sm flex items-center gap-2"
              onClick={handleInteraction(() => addShape('rect'))}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              </svg>
              Rectangle
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-100 transition-all duration-200 transform hover:scale-105 shadow-sm flex items-center gap-2"
              onClick={handleInteraction(() => addShape('circle'))}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
              Circle
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-100 transition-all duration-200 transform hover:scale-105 shadow-sm flex items-center gap-2"
              onClick={handleInteraction(() => addShape('text'))}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Text
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
                activeTool === 'pen'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
              onClick={handleInteraction(setPen)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Pen
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-white text-red-600 hover:bg-red-50 transition-all duration-200 transform hover:scale-105 shadow-sm flex items-center gap-2"
              onClick={handleInteraction(deleteSelected)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>

          {/* Object Controls */}
          <button
            className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-100 transition-all duration-200 transform hover:scale-105 shadow-sm flex items-center gap-2"
            onClick={handleInteraction(toggleLock)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Lock
          </button>

          {/* Export */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1">
            <button
              className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-100 transition-all duration-200 transform hover:scale-105 shadow-sm flex items-center gap-2"
              onClick={exportPNG}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              PNG
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-white text-slate-700 hover:bg-slate-100 transition-all duration-200 transform hover:scale-105 shadow-sm flex items-center gap-2"
              onClick={exportSVG}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              SVG
            </button>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              Fill
            </label>
            <input
              className="w-8 h-8 rounded-lg border-2 border-slate-200 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg"
              type="color"
              value={fillColor}
              onChange={handleInteraction(e => {
                setFillColor(e.target.value);
                applyFill(e.target.value);
              })}
            />
          </div>

          {/* Text Editor */}
          {(textValue || canvasRef.current?.getActiveObject()?.type === 'i-text') && (
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2 animate-in slide-in-from-right duration-300">
              <input
                className="border border-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Edit text"
                value={textValue}
                onChange={handleInteraction(e => setTextValue(e.target.value))}
              />
              <button
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-sm"
                onClick={handleInteraction(applyText)}
              >
                Apply
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!viewOnly && (
            <button
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              onClick={shareLink}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share Canvas
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
              Scene: <span className="font-mono font-medium">{id}</span>
            </div>
            {viewOnly && (
              <div className="text-xs text-red-600 font-semibold bg-red-50 px-3 py-2 rounded-lg animate-pulse">
                VIEW ONLY
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        <div ref={containerRef} className="absolute inset-0 transition-all duration-300">
          <canvas
            id="fabric-canvas"
            className="block shadow-2xl rounded-lg border border-slate-200/50"
            style={{
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1))',
              transition: 'all 0.3s ease-in-out'
            }}
          />
        </div>

        {/* Loading overlay */}
        <div
          className={`absolute inset-0 bg-white/80 flex items-center justify-center transition-opacity duration-300 ${
            isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          id="loading-overlay"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading canvas...</p>
          </div>
        </div>

        {/* Success notifications */}
        <div className="absolute top-4 right-4 z-10">
          <div
            id="success-notification"
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Action completed!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}