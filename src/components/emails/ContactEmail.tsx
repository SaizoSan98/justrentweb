
import * as React from 'react';
import { EmailLayout, h1, p, infoBox, label, value, btn } from './EmailLayout';

interface ContactEmailProps {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  type: 'ADMIN' | 'CUSTOMER';
}

export const ContactEmail: React.FC<ContactEmailProps> = ({ 
  name, 
  email, 
  phone, 
  subject, 
  message,
  type
}) => {
  const isCustomer = type === 'CUSTOMER';
  
  const title = isCustomer 
    ? `We received your message: ${subject}` 
    : `New Contact Message: ${subject}`;
    
  const intro = isCustomer
    ? `Dear ${name}, thank you for contacting us! We have received your message.`
    : 'A new contact message has been submitted via the website.';

  const actionText = isCustomer
    ? 'Our team will review your inquiry and get back to you as soon as possible (usually within 24 hours).'
    : 'Please review the message below and respond to the customer.';

  return (
    <EmailLayout preview={title}>
      <h1 style={h1}>{title}</h1>
      <p style={p}>{intro}</p>
      <p style={p}>{actionText}</p>

      <div style={infoBox}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: '#09090b' }}>
          Message Details
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Subject</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                {subject}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Name</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                {name}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Email</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                <a href={`mailto:${email}`} style={{ color: '#09090b', textDecoration: 'none' }}>{email}</a>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Phone</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                <a href={`tel:${phone}`} style={{ color: '#09090b', textDecoration: 'none' }}>{phone}</a>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: '16px 0 0 0' }}>
                <div style={label}>Message:</div>
                <div style={{ ...value, marginTop: '4px', whiteSpace: 'pre-wrap', backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px' }}>
                  {message}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isCustomer && (
        <div style={{ textAlign: 'center' }}>
          <a href={`mailto:${email}?subject=Re: ${subject}`} style={btn}>
            Reply to Customer
          </a>
        </div>
      )}
    </EmailLayout>
  );
};
