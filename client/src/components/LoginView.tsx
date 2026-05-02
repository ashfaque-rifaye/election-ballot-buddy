/**
 * Login View Component
 * Built with Google Antigravity & Vertex AI
 *
 * Provides Google Sign-In integration for user authentication.
 * Handles auth success/failure with appropriate feedback.
 */
import React, { useEffect, useCallback, useState } from 'react';
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
  const { signIn } = useAuth();
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
        backgroundColor: '#f8f9fa',
        padding: '2rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '3rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            color: '#1a73e8',
            marginBottom: '0.5rem',
          }}
        >
          Election Assistant
        </h1>
        <p
          style={{
            color: '#5f6368',
            marginBottom: '2rem',
            fontSize: '0.95rem',
          }}
        >
          Powered by Google Antigravity &amp; Vertex AI
        </p>
        <p
          style={{
            color: '#3c4043',
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
              backgroundColor: '#fce8e6',
              color: '#c5221f',
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

        <p
          style={{
            color: '#80868b',
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
