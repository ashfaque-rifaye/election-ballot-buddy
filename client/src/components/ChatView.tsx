/**
 * Chat View Component
 * Built with Google Antigravity & Vertex AI
 *
 * Main chat interface with scrollable message history,
 * message input, and ARIA live region for screen readers.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Message, ReminderCard as ReminderCardType } from '@shared/types';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, createReminder } from '../services/apiClient';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import { v4 as uuidv4 } from 'uuid';

const QUICK_PROMPTS = [
  'How do I register to vote?',
  'When is the next voting day?',
  'Find my polling station',
  'What happens after votes are counted?',
];

export default function ChatView() {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'agent',
      content:
        'Welcome to the Election Assistant! I can help you understand the election process, find polling stations, and set reminders for important dates. What would you like to know?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(trimmed, sessionId);
      const agentMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: response.response,
        cards: response.cards,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch {
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'agent',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleSetReminder = async (card: ReminderCardType) => {
    await createReminder({
      id: uuidv4(),
      phaseName: card.phaseName,
      date: card.date,
      description: card.description,
      electionFormat: 'national',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className="chat-view"
      role="main"
      aria-label="Election Assistant Chat"
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'transparent',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? '260px' : '0',
          minWidth: sidebarOpen ? '260px' : '0',
          backgroundColor: 'var(--surface-variant)',
          backdropFilter: 'blur(16px)',
          borderRight: sidebarOpen ? '1px solid var(--outline)' : 'none',
          transition: 'all 200ms ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        aria-label="Navigation sidebar"
      >
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #E8EAED' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }} aria-hidden="true">🗳️</span>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--on-surface)' }}>
              Election Assistant
            </span>
          </div>
        </div>
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          <a
            href="/chat"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '4px',
            }}
            tabIndex={0}
          >
            💬 Chat
          </a>
          <a
            href="/timeline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              color: 'var(--on-surface-secondary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
            tabIndex={0}
          >
            📅 Timeline
          </a>
        </nav>
        {user && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #E8EAED' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-secondary)', marginBottom: '4px' }}>{user.email}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-tertiary)', textTransform: 'capitalize' }}>{user.role}</p>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 20px',
            backgroundColor: 'var(--surface-variant)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--outline)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--on-surface-secondary)',
                fontSize: '1.2rem',
              }}
              tabIndex={0}
            >
              ☰
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                Election Assistant
              </h1>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--on-surface-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Powered by ✨ AI</span> | Vertex AI
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                }}
                aria-label={`Signed in as ${user.email}`}
              >
                {user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={signOut}
              aria-label="Sign out"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--on-surface-secondary)',
                border: '1px solid var(--outline)',
                borderRadius: '8px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F3F4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              tabIndex={0}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Skip to content link */}
        <a
          href="#chat-input"
          className="sr-only"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
          onFocus={(e) => {
            (e.target as HTMLElement).style.position = 'static';
            (e.target as HTMLElement).style.width = 'auto';
            (e.target as HTMLElement).style.height = 'auto';
          }}
          onBlur={(e) => {
            (e.target as HTMLElement).style.position = 'absolute';
            (e.target as HTMLElement).style.left = '-9999px';
          }}
        >
          Skip to chat input
        </a>

        {/* Message History */}
        <div
          role="log"
          aria-label="Conversation history"
          aria-live="polite"
          aria-relevant="additions"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 0',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
            <div role="list">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onSetReminder={handleSetReminder}
                />
              ))}
            </div>
            {isLoading && <LoadingIndicator />}

            {/* Quick prompts - show only when there's just the welcome message */}
            {messages.length === 1 && !isLoading && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '8px 16px',
                  animation: 'fadeIn 0.4s ease-out',
                }}
              >
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    style={{
                      backgroundColor: 'var(--surface-variant)',
                      color: 'var(--primary)',
                      border: '1px solid var(--outline)',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      fontSize: '0.825rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E8F0FE';
                      e.currentTarget.style.borderColor = '#4285F4';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#DADCE0';
                    }}
                    tabIndex={0}
                    aria-label={`Ask: ${prompt}`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div style={{ padding: '0 16px 16px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: '10px',
              padding: '12px 16px',
              backgroundColor: 'var(--surface-variant)',
              borderRadius: '24px',
              border: '1px solid var(--outline)',
              boxShadow: '0 1px 3px rgba(60,64,67,0.08)',
              transition: 'box-shadow 200ms ease, border-color 200ms ease',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '#4285F4';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(66,133,244,0.15)';
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                (e.currentTarget as HTMLElement).style.borderColor = '#DADCE0';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(60,64,67,0.08)';
              }
            }}
          >
            <label htmlFor="chat-input" className="sr-only">
              Type your question about the election process
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about elections..."
              disabled={isLoading}
              aria-label="Type your question about the election process"
              autoComplete="off"
              style={{
                flex: 1,
                padding: '4px 8px',
                border: 'none',
                fontSize: '0.925rem',
                outline: 'none',
                backgroundColor: 'transparent',
                color: 'var(--on-surface)',
              }}
              tabIndex={0}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              style={{
                backgroundColor: isLoading || !input.trim() ? '#E8EAED' : '#4285F4',
                color: isLoading || !input.trim() ? '#80868B' : '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                transition: 'all 200ms ease',
                flexShrink: 0,
              }}
              tabIndex={0}
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
