
import * as React from 'react';
import { EmailLayout, h1, p, btn, infoBox } from './EmailLayout';

interface WelcomeUserEmailProps {
  name: string;
  email: string;
  password?: string; // Only sent on creation
  loginUrl: string;
}

export const WelcomeUserEmail: React.FC<WelcomeUserEmailProps> = ({ name, email, password, loginUrl }) => {
  return (
    <EmailLayout preview="Welcome to JustRent Partner Program">
      <h1 style={h1}>Welcome to JustRent!</h1>
      <p style={p}>
        Dear {name},
      </p>
      <p style={p}>
        An account has been created for you by our administrator. We are excited to have you as a partner.
      </p>
      
      <div style={infoBox}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', color: '#09090b' }}>
          Your Account Credentials
        </h3>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong style={{ color: '#71717a' }}>Email:</strong> <span style={{ color: '#09090b' }}>{email}</span>
        </p>
        {password && (
          <p style={{ margin: '0 0 8px 0' }}>
            <strong style={{ color: '#71717a' }}>Password:</strong> <span style={{ fontFamily: 'monospace', backgroundColor: '#e4e4e7', padding: '2px 6px', borderRadius: '4px' }}>{password}</span>
          </p>
        )}
      </div>

      <p style={p}>
        Please log in and change your password immediately for security reasons.
      </p>

      <div style={{ textAlign: 'center' }}>
        <a href={loginUrl} style={btn}>
          Log In to Dashboard
        </a>
      </div>
    </EmailLayout>
  );
};
