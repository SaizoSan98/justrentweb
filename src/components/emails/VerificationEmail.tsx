
import * as React from 'react';
import { EmailLayout, h1, p } from './EmailLayout';

interface VerificationEmailProps {
  code: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({ code }) => {
  return (
    <EmailLayout preview="Verify your email address">
      <h1 style={h1}>Verify Your Email</h1>
      <p style={p}>
        Please use the verification code below to complete your registration.
      </p>
      
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <span style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          letterSpacing: '4px',
          backgroundColor: '#f4f4f5',
          padding: '12px 24px',
          borderRadius: '8px',
          color: '#09090b',
          fontFamily: 'monospace'
        }}>
          {code}
        </span>
      </div>
      
      <p style={{ ...p, fontSize: '14px', color: '#71717a' }}>
        This code will expire in 15 minutes. If you didn't request this code, you can ignore this email.
      </p>
    </EmailLayout>
  );
};
