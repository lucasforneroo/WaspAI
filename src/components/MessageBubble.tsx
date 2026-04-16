'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import CodeBlock from './CodeBlock';
import MermaidRenderer from './MermaidRenderer';
import { Message } from '../hooks/useChat';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';

  const severityMatch = message.text.match(/\[SEVERITY:\s+(LOW|MEDIUM|HIGH|CRITICAL)\]/i);
  const severity = severityMatch ? severityMatch[1].toUpperCase() : null;

  const getSeverityStyles = () => {
    if (!severity || !isAssistant) return '';
    
    switch (severity) {
      case 'LOW':
        return 'animate-pulse-yellow border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
      case 'MEDIUM':
        return 'animate-pulse-orange border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.3)]';
      case 'HIGH':
        return 'animate-pulse-red border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.4)]';
      case 'CRITICAL':
        return 'animate-pulse-purple border-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.5)]';
      default:
        return '';
    }
  };

  return (
    <div className={`flex gap-4 ${isAssistant ? '' : 'justify-end'}`}>
      {isAssistant && (
        <div className={`w-8 h-8 rounded-lg ${severity ? 'bg-black' : 'bg-yellow-wasp/20'} flex items-center justify-center flex-shrink-0 mt-1 border border-yellow-wasp/30 transition-all duration-500`}>
          <Bot size={20} className={severity ? 'text-white animate-pulse' : 'text-yellow-wasp'} />
        </div>
      )}
      
      <div className={`max-w-[85%] rounded-2xl px-5 py-3 backdrop-blur-md opacity-100-forced transition-all duration-700 ${
        isAssistant 
        ? `bg-[#1a141b] border border-purple-light/30 text-slate-100 leading-relaxed shadow-xl ${getSeverityStyles()}` 
        : 'bg-[#3b2a3d]/90 border border-purple-light/40 text-slate-100 shadow-2xl'
      }`}>
        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-yellow-wasp prose-strong:text-yellow-wasp prose-a:text-yellow-wasp hover:prose-a:text-yellow-wasp/80">
          <ReactMarkdown
            components={{
              // @ts-expect-error - ReactMarkdown types are tricky with custom components and extra props
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const codeText = String(children).replace(/\n$/, '');

                if (!inline && language === 'mermaid') {
                  return <MermaidRenderer chart={codeText} />;
                }

                const isSingleWordOrUrl = !language && (
                  !codeText.includes('\n') && 
                  (codeText.split(' ').length === 1 || codeText.startsWith('http'))
                );

                if (!inline && !isSingleWordOrUrl) {
                  return (
                    <div className="my-4">
                      <CodeBlock
                        code={codeText}
                        language={language}
                        {...props}
                      />
                    </div>
                  );
                }

                return (
                  <code className={`${className} bg-purple-dark px-1.5 py-0.5 rounded text-yellow-wasp font-mono text-sm border border-purple-light/20 break-all`} {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <div className="mb-4 last:mb-0 leading-relaxed">{children}</div>,
              ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 mt-2 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="text-slate-200">{children}</li>,
              h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6 first:mt-0 border-b border-purple-light/20 pb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-[#3b2a3d] flex items-center justify-center flex-shrink-0 mt-1 border border-purple-light/30 shadow-md">
          <User size={20} className="text-slate-400" />
        </div>
      )}
    </div>
  );
}
