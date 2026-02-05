
import * as React from 'react';
import { EmailLayout, h1, p, btn } from './EmailLayout';

interface WelcomeClientEmailProps {
  name: string;
  loginUrl: string;
}

export const WelcomeClientEmail: React.FC<WelcomeClientEmailProps> = ({ name, loginUrl }) => {
  return (
    <EmailLayout preview="Welcome to JustRent">
      <h1 style={h1}>Welcome aboard!</h1>
      <p style={p}>
        Hi {name},
      </p>
      <p style={p}>
        Thank you for creating an account with JustRent. We are thrilled to have you with us.
      </p>
      <p style={p}>
        You can now easily manage your bookings and view your rental history from your dashboard.
      </p>
      
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <a href={loginUrl} style={btn}>
          Go to Dashboard
        </a>
      </div>
      
      <p style={{ ...p, fontSize: '14px', color: '#71717a' }}>
        If you have any questions or need assistance, feel free to reply to this email.
      </p>
    </EmailLayout>
  );
};
