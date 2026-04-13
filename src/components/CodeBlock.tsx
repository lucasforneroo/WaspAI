import React, { useState, useEffect } from 'react';
import hljs from 'highlight.js';
import { Copy, Check } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    hljs.highlightAll();
  }, [code]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-purple-light/30 shadow-lg group">
      <div className="flex items-center justify-between px-4 py-2 bg-purple-dark border-b border-purple-light/20">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{language}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-light/20 text-slate-400 hover:text-yellow-wasp hover:bg-purple-light/40 transition-all text-xs"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
        <code className={`language-${language || 'plaintext'} font-mono`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
