/**
 * Chat View - Indian Election Assistant
 * Built with Google Antigravity & Vertex AI
 */
import React, { useState, useRef, useEffect } from 'react';
import { Message, ReminderCard as ReminderCardType } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { sendMessage, createReminder } from '../services/apiClient';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import { v4 as uuidv4 } from 'uuid';

const QUICK_PROMPTS = [
  '🗳️ How do I register to vote?',
  '📋 Documents needed to vote',
  '🏛️ How does EVM voting work?',
  '📅 Upcoming elections schedule',
  '📍 Find my polling booth',
  '⚖️ Model Code of Conduct',
];

export default function ChatView() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome', role: 'agent',
    content: 'Namaste! 🙏 Welcome to the Indian Election Assistant.\n\nI can help you with:\n- Voter registration & eligibility\n- EVM/VVPAT voting procedures\n- Finding your polling booth\n- State-wise election schedules\n- Understanding the election process\n\nAsk me anything about Indian elections!',
    timestamp: new Date().toISOString(),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, suggestions]);

  const submitMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: Message = { id: uuidv4(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSuggestions([]);
    setIsLoading(true);
    try {
      const response = await sendMessage(text.trim(), sessionId);
      setMessages((prev) => [...prev, { id: uuidv4(), role: 'agent', content: response.response, cards: response.cards, timestamp: new Date().toISOString() }]);
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch {
      setMessages((prev) => [...prev, { id: uuidv4(), role: 'agent', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date().toISOString() }]);
      setSuggestions(['How do I register to vote?', 'Show election timeline', 'Find my polling booth']);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); await submitMessage(input); };
  const handleQuickPrompt = (prompt: string) => { const clean = prompt.replace(/^[^\w]*/, '').trim(); submitMessage(clean); };
  const handleSuggestion = (s: string) => { submitMessage(s); };
  const handleSetReminder = async (card: ReminderCardType) => { await createReminder({ id: uuidv4(), phaseName: card.phaseName, date: card.date, description: card.description, electionFormat: 'national' }); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } };

  return (
    <div className="chat-view" role="main" aria-label="Indian Election Assistant Chat"
      style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--surface-dim)' }}>

      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? '260px' : '0', minWidth: sidebarOpen ? '260px' : '0', backgroundColor: 'var(--sidebar-bg)', borderRight: sidebarOpen ? '1px solid var(--outline)' : 'none', transition: 'all 200ms ease', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} aria-label="Navigation sidebar">
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--outline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }} aria-hidden="true">🇮🇳</span>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--on-surface)' }}>Election Assistant</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-tertiary)', marginTop: '4px' }}>भारत निर्वाचन सहायक</p>
        </div>
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          <a href="/chat" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>💬 Chat</a>
          <a href="/timeline" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: 'var(--on-surface-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>📅 Election Timeline</a>
        </nav>
        {user && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--outline)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-secondary)', marginBottom: '4px' }}>{user.email}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-tertiary)', textTransform: 'capitalize' }}>{user.role}</p>
          </div>
        )}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--outline)', zIndex: 10, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', display: 'flex' }} aria-hidden="true">
            <div style={{ flex: 1, backgroundColor: '#FF9933' }} /><div style={{ flex: 1, backgroundColor: '#FFFFFF' }} /><div style={{ flex: 1, backgroundColor: '#138808' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: 'var(--on-surface-secondary)', fontSize: '1.2rem' }}>☰</button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)' }}>🇮🇳 Indian Election Assistant</h1>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--on-surface-tertiary)' }}>Powered by Google Antigravity & Vertex AI</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} style={{ background: 'none', border: '1px solid var(--outline)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--on-surface-secondary)' }}>{theme === 'light' ? '🌙' : '☀️'}</button>
            {user && <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>{user.email.charAt(0).toUpperCase()}</div>}
            <button onClick={signOut} aria-label="Sign out" style={{ backgroundColor: 'transparent', color: 'var(--on-surface-secondary)', border: '1px solid var(--outline)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>Sign Out</button>
          </div>
        </header>

        <a href="#chat-input" className="sr-only">Skip to chat input</a>

        {/* Messages */}
        <div role="log" aria-label="Conversation history" aria-live="polite" style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
            <div role="list">
              {messages.map((msg) => (<MessageBubble key={msg.id} message={msg} onSetReminder={handleSetReminder} />))}
            </div>
            {isLoading && <LoadingIndicator />}

            {/* Suggestion Chips — shown after AI response */}
            {!isLoading && suggestions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '4px 0 8px', animation: 'fadeIn 0.3s ease-out' }} aria-label="Suggested follow-up questions">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => handleSuggestion(s)}
                    style={{ backgroundColor: 'var(--surface-card)', color: 'var(--primary)', border: '1px solid var(--outline)', borderRadius: '20px', padding: '7px 14px', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', transition: 'all 200ms ease', display: 'flex', alignItems: 'center', gap: '4px' }}
                    aria-label={`Ask: ${s}`}>
                    <span style={{ fontSize: '0.7rem' }} aria-hidden="true">💡</span> {s}
                  </button>
                ))}
              </div>
            )}

            {/* Initial Quick Prompts */}
            {messages.length === 1 && !isLoading && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 0', animation: 'fadeIn 0.4s ease-out' }}>
                {QUICK_PROMPTS.map((prompt) => (
                  <button key={prompt} onClick={() => handleQuickPrompt(prompt)}
                    style={{ backgroundColor: 'var(--surface-card)', color: 'var(--primary)', border: '1px solid var(--outline)', borderRadius: '20px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 200ms ease', whiteSpace: 'nowrap' }}
                    aria-label={`Ask: ${prompt}`}>{prompt}</button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '0 16px 16px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', padding: '12px 16px', backgroundColor: 'var(--input-bg)', borderRadius: '24px', border: '1px solid var(--outline)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <label htmlFor="chat-input" className="sr-only">Type your question about Indian elections</label>
            <input id="chat-input" ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about Indian elections..." disabled={isLoading} autoComplete="off"
              style={{ flex: 1, padding: '4px 8px', border: 'none', fontSize: '0.925rem', outline: 'none', backgroundColor: 'transparent', color: 'var(--on-surface)' }} />
            <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send message"
              style={{ backgroundColor: isLoading || !input.trim() ? 'var(--outline)' : 'var(--primary)', color: isLoading || !input.trim() ? 'var(--on-surface-tertiary)' : '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>➤</button>
          </form>
        </div>
      </div>
    </div>
  );
}
