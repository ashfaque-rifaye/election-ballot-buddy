/**
 * Login View Component
 * Built with Google Antigravity & Vertex AI
 *
 * Provides Google Sign-In integration for user authentication.
 * Handles auth success/failure with appropriate feedback.
 */
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginView() {
  const { signIn, startDemo } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      try {
        setError(null);
        await signIn(response.credential);
      } catch {
        setError('Authentication failed. Please try again.');
      }
    },
    [signIn]
  );

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'outline',
            size: 'large',
            width: 300,
            text: 'signin_with',
            shape: 'rectangular',
          });
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [handleCredentialResponse]);

  return (
    <main
      className="login-view"
      role="main"
      aria-label="Election Assistant Login"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'transparent',
        padding: '2rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface-variant)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--outline)',
          borderRadius: '12px',
          padding: '3rem',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            color: 'var(--primary)',
            marginBottom: '0.5rem',
          }}
        >
          Election Assistant
        </h1>
        <p
          style={{
            color: 'var(--on-surface-secondary)',
            marginBottom: '2rem',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700 
          }}>Powered by ✨ AI</span> | Google Vertex AI
        </p>
        <p
          style={{
            color: 'var(--on-surface)',
            marginBottom: '1.5rem',
            lineHeight: 1.6,
          }}
        >
          Your interactive guide to the election process. Get step-by-step
          guidance through registration, campaigning, voting, counting, and
          certification.
        </p>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              backgroundColor: 'var(--error)',
              color: '#ffffff',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <div
          id="google-signin-button"
          aria-label="Sign in with Google"
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        />

        <button
          onClick={startDemo}
          style={{
            width: '100%',
            maxWidth: '300px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.15), rgba(52, 168, 83, 0.15))',
            border: '1px solid rgba(66, 133, 244, 0.4)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition)',
            margin: '0 auto',
            display: 'block',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(66, 133, 244, 0.25), rgba(52, 168, 83, 0.25))';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(66, 133, 244, 0.15), rgba(52, 168, 83, 0.15))';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Start Guest Demo
        </button>

        <p
          style={{
            color: 'var(--on-surface-tertiary)',
            fontSize: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          Secure authentication via Google Identity
        </p>
      </div>
    </main>
  );
}
