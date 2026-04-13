import React, { useState, useEffect } from 'react';
import hljs from 'highlight.js';
import { Copy, Check } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

export default function CodeBlock({ code, language }) {
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
    <div className="relative group my-4 rounded-xl overflow-hidden border border-wasp-purple-light bg-slate-900/50">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-wasp-purple-light">
        <span className="text-xs font-mono text-slate-400 lowercase">{language || 'code'}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-wasp-yellow transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-wasp-purple-light">
        <code className={`language-${language || 'plaintext'} font-mono`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
