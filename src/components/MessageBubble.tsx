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

  return (
    <div className={`flex gap-4 ${isAssistant ? '' : 'justify-end'}`}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-yellow-wasp/20 flex items-center justify-center flex-shrink-0 mt-1 border border-yellow-wasp/30">
          <Bot size={20} className="text-yellow-wasp" />
        </div>
      )}
      
      <div className={`max-w-[85%] rounded-2xl px-5 py-3 backdrop-blur-md opacity-100-forced ${
        isAssistant 
        ? 'bg-[#1a141b] border border-purple-light/30 text-slate-100 leading-relaxed shadow-xl' 
        : 'bg-[#3b2a3d]/90 border border-purple-light/40 text-slate-100 shadow-2xl'
      }`}>
        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-yellow-wasp prose-strong:text-yellow-wasp prose-a:text-yellow-wasp hover:prose-a:text-yellow-wasp/80">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';

                if (!inline && language === 'mermaid') {
                  return <MermaidRenderer chart={String(children).replace(/\n$/, '')} />;
                }

                return !inline ? (
                  <div className="my-4">
                    <CodeBlock
                      code={String(children).replace(/\n$/, '')}
                      language={language}
                      {...props}
                    />
                  </div>
                ) : (
                  <code className={`${className} bg-purple-dark px-1.5 py-0.5 rounded text-yellow-wasp font-mono text-sm border border-purple-light/20`} {...props}>
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
