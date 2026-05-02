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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Add user message immediately
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
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          backgroundColor: '#1a73e8',
          color: '#ffffff',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
            Election Assistant
          </h1>
          <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.85 }}>
            Powered by Google Antigravity &amp; Vertex AI
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && (
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              {user.email} ({user.role})
            </span>
          )}
          <button
            onClick={signOut}
            aria-label="Sign out"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
            tabIndex={0}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Skip to content link for accessibility */}
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
          padding: '16px 0',
        }}
      >
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 16px',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
        }}
      >
        <label htmlFor="chat-input" className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
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
            padding: '10px 16px',
            borderRadius: '24px',
            border: '1px solid #dadce0',
            fontSize: '0.925rem',
            outline: 'none',
          }}
          tabIndex={0}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          style={{
            backgroundColor: '#1a73e8',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
          }}
          tabIndex={0}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
