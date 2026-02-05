
import * as React from 'react';
import { EmailLayout, h1, p, btn } from './EmailLayout';

interface ForgotPasswordEmailProps {
  name: string;
  resetLink: string;
}

export const ForgotPasswordEmail: React.FC<ForgotPasswordEmailProps> = ({ name, resetLink }) => {
  return (
    <EmailLayout preview="Reset Your Password">
      <h1 style={h1}>Reset Password</h1>
      <p style={p}>
        Hi {name},
      </p>
      <p style={p}>
        We received a request to reset your password. If you didn't make this request, you can ignore this email.
      </p>
      
      <div style={{ textAlign: 'center' }}>
        <a href={resetLink} style={btn}>
          Reset Password
        </a>
      </div>
      
      <p style={{ ...p, fontSize: '14px', marginTop: '24px' }}>
        Or copy and paste this link into your browser:<br/>
        <a href={resetLink} style={{ color: '#ff5f00' }}>{resetLink}</a>
      </p>
    </EmailLayout>
  );
};
