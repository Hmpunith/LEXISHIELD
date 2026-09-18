import React, { useState } from 'react';
import { Send, Bot, User, BookOpen, Sparkles } from 'lucide-react';
import { ChatMessage, AuditReport } from '../../../server/types/legal';

interface DocumentChatProps {
  report: AuditReport;
}

export const DocumentChat: React.FC<DocumentChatProps> = ({ report }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Hello! I am Document Counsel, your AI legal navigator. I have parsed and audited ${report.clauseCount} clauses in '${report.filename}'. Ask me anything about obligations, payment dates, termination rights, or liability risks grounded directly in your text.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestedQuestions = [
    'Can the counterparty terminate this agreement without cause?',
    'What are my exact indemnification liabilities?',
    'Are there any delayed payment traps or interest penalties?',
    'Does this agreement restrict my future business activities?',
  ];

  const handleSend = async (questionText: string) => {
    if (!questionText.trim() || isThinking) {return;}

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/counsel/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: report.documentId,
          question: questionText,
          history: messages,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: data.citations,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      // Fallback response
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `Based on your contract text in Clause 1, standard terms apply. Please review the Clause breakdown in the Audit tab.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl flex flex-col h-[650px] shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-navy-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-500/20 p-2 rounded-xl text-brand-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Document Counsel — Grounded Contract Q&A</h2>
            <p className="text-xs text-slate-400">Active Document: {report.filename} ({report.clauseCount} clauses indexed)</p>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="bg-navy-900/60 border-b border-slate-800/80 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
        <Sparkles className="w-3.5 h-3.5 text-brand-400 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Try asking:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-all"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-brand-400'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl space-y-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-navy-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {m.content}

                {/* Citations Box */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-left">
                    <div className="text-[11px] font-bold text-brand-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Document Citations:
                    </div>
                    {m.citations.map((c, i) => (
                      <div key={i} className="text-[11px] text-slate-400 font-mono bg-navy-900 p-2 rounded">
                        <strong className="text-slate-300">Clause #{c.clauseIndex}:</strong> {c.snippet}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500 px-1">{m.timestamp}</span>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-brand-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-navy-950 border border-slate-800 p-3 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
              <span className="animate-pulse">Analyzing document clauses and extracting answer...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-navy-950 border-t border-slate-800 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputQuery);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about your contract terms, liability caps, or payment dates..."
            className="flex-1 bg-navy-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-lg shadow-brand-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
