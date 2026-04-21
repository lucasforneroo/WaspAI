'use client';

import React, { useEffect, useState, useId } from 'react';
import { createPortal } from 'react-dom';
import mermaid from 'mermaid';
import { AlertCircle, Copy, Check, Maximize2, Minimize2, ZoomIn, ZoomOut, Move, Zap } from 'lucide-react';

// Configuración de Mermaid para el estilo WaspAI Neon
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'var(--font-geist-sans)',
  themeVariables: {
    primaryColor: '#f5ff88',
    primaryTextColor: '#fff',
    primaryBorderColor: '#f5ff88',
    lineColor: '#bb00ff',
    secondaryColor: '#1a141b',
    tertiaryColor: '#3b2a3d',
    fontSize: '16px',
    nodeSpacing: 60,
    rankSpacing: 80
  }
});

interface MermaidRendererProps {
  chart: string;
}

interface FullScreenModalProps {
  mounted: boolean;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  zoom: number;
  handleZoom: (delta: number) => void;
  svgContent: string;
}

const FullScreenModal = ({ 
  mounted, 
  isFullScreen, 
  toggleFullScreen, 
  zoom, 
  handleZoom, 
  svgContent 
}: FullScreenModalProps) => {
  if (!mounted || !isFullScreen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 lg:p-10 animate-in fade-in zoom-in-95 duration-300">
      <div className="absolute inset-0 bg-[#0a0a0b]/90 backdrop-blur-2xl" onClick={toggleFullScreen} />
      
      <div className="relative w-full h-full flex flex-col bg-[#0d0d0e]/80 border border-purple-light/20 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
        
        <div className="flex items-center justify-between px-8 py-5 border-b border-purple-light/10 bg-gradient-to-r from-purple-dark/80 to-transparent">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-wasp animate-pulse" />
                <h3 className="text-yellow-wasp font-black uppercase tracking-[0.2em] text-xs">Architectural Mapping</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 tracking-wider uppercase">Live Infrastructure Blueprint</span>
            </div>
            
            <div className="flex items-center gap-3 bg-purple-dark/40 rounded-2xl p-1.5 border border-purple-light/10 shadow-inner">
              <button 
                onClick={() => handleZoom(-0.25)} 
                className="w-8 h-8 flex items-center justify-center hover:bg-purple-light/10 rounded-xl hover:text-yellow-wasp text-slate-400 transition-all active:scale-90"
              >
                <ZoomOut size={16} />
              </button>
              <div className="px-2 text-center border-x border-purple-light/5">
                <span className="text-[10px] font-mono font-bold text-yellow-wasp/80 tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <button 
                onClick={() => handleZoom(0.25)} 
                className="w-8 h-8 flex items-center justify-center hover:bg-purple-light/10 rounded-xl hover:text-yellow-wasp text-slate-400 transition-all active:scale-90"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-yellow-wasp/5 border border-yellow-wasp/10 rounded-2xl text-[9px] text-yellow-wasp/40 uppercase font-black">
              <Move size={12} className="opacity-50" />
              Drag to explore blueprint
            </div>
            <button 
              onClick={toggleFullScreen}
              className="w-10 h-10 flex items-center justify-center hover:bg-red-500/20 rounded-2xl transition-all text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/20"
            >
              <Minimize2 size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:32px_32px] cursor-grab active:cursor-grabbing scrollbar-none p-20 flex items-start justify-center">
          <div 
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)' 
            }}
            className="max-w-none blueprint-wrapper"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        <div className="px-8 py-4 border-t border-purple-light/10 bg-purple-dark/30 flex justify-between items-center backdrop-blur-md">
          <div className="flex gap-6">
             <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Engine</span>
              <span className="text-[10px] text-yellow-wasp/70 font-mono font-bold uppercase">Gemini-Flash-RAG</span>
            </div>
            <div className="flex items-center gap-2 border-l border-purple-light/10 pl-6">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Format</span>
              <span className="text-[10px] text-purple-light font-mono font-bold uppercase">SVG-Vector-Blueprint</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Connection Stable • Secure Context</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [mounted, setMounted] = useState(false);
  
  const baseId = useId().replace(/:/g, '');
  const renderId = `mermaid-svg-${baseId}`;

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    let isMounted = true;

    const renderDiagram = async () => {
      const cleanChart = chart
        .replace(/^\s*```mermaid\s*/, '') 
        .replace(/\s*```\s*$/, '')        
        .trim();

      if (!cleanChart || cleanChart.length < 10) return;

      const lines = cleanChart.split('\n');
      const sanitizedLines: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (/^(graph|subgraph|end|direction|title|stateDiagram|classDiagram)/i.test(trimmed)) {
          sanitizedLines.push(trimmed);
          continue;
        }

        let processed = trimmed.replace(/(\"\])\s*[\]\"]+/g, '$1');
        processed = processed.replace(/\s*(-{2,}>|\.-{1,}>)\s*/g, ' --> ');
        processed = processed.replace(/(\"\])\s*(-->)/g, '$1 $2');
        processed = processed.replace(/(-->)\s*([A-Za-z0-9_]+)/g, '$1 $2');
        processed = processed.replace(/([A-Za-z0-9_$@]+)\s*\[\"(.*?)\"\]/g, (_, id, text) => {
          const cleanId = id.replace(/[^A-Za-z0-9_]/g, '');
          return `${cleanId}["${text}"]`;
        });

        if (!processed.includes('-->') && !processed.includes('-.->')) {
          processed = processed.replace(/(\"\])\s+([A-Za-z0-9_]+)/g, '$1\n$2');
        }

        sanitizedLines.push(processed);
      }

      const fixedChart = sanitizedLines.join('\n');
      const openSubgraphs = (fixedChart.match(/subgraph/g) || []).length;
      const ends = (fixedChart.match(/end/g) || []).length;
      let finalChart = fixedChart;
      if (openSubgraphs > ends) {
        finalChart += '\n' + 'end\n'.repeat(openSubgraphs - ends);
      }

      try {
        await mermaid.parse(finalChart, { suppressErrors: true });
        const { svg } = await mermaid.render(renderId, finalChart);
        
        const responsiveSvg = svg
          .replace(/<svg/, '<svg class="mermaid-blueprint-svg"')
          .replace(/height=".*?"/, 'height="auto"')
          .replace(/style="max-width:.*?"/, '');
        
        if (isMounted) {
          setSvgContent(responsiveSvg);
          setIsRendered(true);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted && !isRendered) {
          const errMsg = err instanceof Error ? err.message : 'Architecture map syntax error';
          setError(errMsg);
        }
      }
    };

    const timer = setTimeout(renderDiagram, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [chart, renderId, isRendered]);

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullScreen = () => {
    const newState = !isFullScreen;
    setIsFullScreen(newState);
    if (newState) {
      setZoom(1.8);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 6));
  };

  return (
    <>
      <style jsx global>{`
        .mermaid-blueprint-svg {
          max-width: none !important;
          height: auto !important;
          filter: drop-shadow(0 10px 30px rgba(0,0,0,0.5));
        }
        .mermaid-blueprint-svg * {
          font-family: var(--font-geist-sans) !important;
          letter-spacing: -0.02em;
        }
        .blueprint-wrapper svg {
          margin: 0 auto;
        }
      `}</style>

      <div className="w-full my-6 bg-[#1a141b]/50 backdrop-blur-md border border-purple-light/20 rounded-2xl overflow-hidden shadow-2xl transition-all group relative">
        <div className="flex items-center justify-between px-4 py-2 border-b border-purple-light/10 bg-purple-dark/30">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRendered ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : error ? 'bg-red-400 shadow-[0_0_8px_#f87171]' : 'bg-yellow-wasp animate-pulse shadow-[0_0_8px_#f5ff88]'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {isRendered ? 'Architecture Pattern' : error ? 'Mapping Syntax Error' : 'Analyzing Structure...'}
            </span>
          </div>
          <div className="flex gap-2">
            {isRendered && (
              <button 
                onClick={toggleFullScreen}
                className="p-1 hover:bg-purple-light/10 rounded transition-colors text-slate-400 hover:text-yellow-wasp"
                title="Open Blueprint Center"
              >
                <Maximize2 size={14} />
              </button>
            )}
            <button 
              onClick={copyToClipboard}
              className="p-1 hover:bg-purple-light/10 rounded transition-colors text-slate-400 hover:text-yellow-wasp"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        
        <div 
          className="p-6 flex justify-center overflow-auto min-h-[280px] cursor-zoom-in group/canvas relative bg-[#0a0a0c]/40"
          onClick={isRendered ? toggleFullScreen : undefined}
        >
          {isRendered ? (
            <div 
              className="w-full flex justify-center transition-all duration-700 opacity-95 group-hover/canvas:opacity-100"
              dangerouslySetInnerHTML={{ __html: svgContent }} 
            />
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 w-full">
              <AlertCircle className="text-red-400 w-8 h-8 animate-pulse" />
              <p className="text-[11px] text-slate-500 font-mono text-center px-4 max-w-sm italic">
                {error}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16 w-full">
              <div className="relative">
                <div className="w-12 h-12 border-2 border-yellow-wasp/10 border-t-yellow-wasp rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap size={16} className="text-yellow-wasp animate-pulse" />
                </div>
              </div>
              <p className="italic text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] animate-pulse">
                Mapping Live Infrastructure...
              </p>
            </div>
          )}
        </div>

        {isRendered && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="text-[9px] font-black text-yellow-wasp/50 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-[0.2em]">Click to Expand Blueprint</span>
          </div>
        )}
      </div>

      <FullScreenModal 
        mounted={mounted}
        isFullScreen={isFullScreen}
        toggleFullScreen={toggleFullScreen}
        zoom={zoom}
        handleZoom={handleZoom}
        svgContent={svgContent}
      />
    </>
  );
}
