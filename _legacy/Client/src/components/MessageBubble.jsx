import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import CodeBlock from './CodeBlock';

export default function MessageBubble({ message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-4 ${isAssistant ? '' : 'justify-end'}`}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-wasp-yellow/20 flex items-center justify-center flex-shrink-0 mt-1 border border-wasp-yellow/30">
          <Bot size={20} className="text-wasp-yellow" />
        </div>
      )}
      
      <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
        isAssistant 
        ? 'bg-transparent text-slate-100 leading-relaxed' 
        : 'bg-wasp-purple-light border border-wasp-purple-light text-slate-100'
      }`}>
        <div className="prose prose-invert prose-slate max-w-none prose-headings:text-wasp-yellow prose-strong:text-wasp-yellow prose-a:text-wasp-yellow hover:prose-a:text-wasp-yellow/80">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <CodeBlock
                    code={String(children).replace(/\n$/, '')}
                    language={match ? match[1] : ''}
                    {...props}
                  />
                ) : (
                  <code className={`${className} bg-slate-800 px-1.5 py-0.5 rounded text-wasp-yellow font-mono text-sm`} {...props}>
                    {children}
                  </code>
                );
              },
              p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="text-slate-200">{children}</li>,
              h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6 first:mt-0 border-b border-wasp-purple-light pb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-lg bg-wasp-purple-light flex items-center justify-center flex-shrink-0 mt-1 border border-wasp-purple-light">
          <User size={20} className="text-slate-300" />
        </div>
      )}
    </div>
  );
}
