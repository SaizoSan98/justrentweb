
import * as React from 'react';
import { EmailLayout, h1, p, infoBox, label, value, btn } from './EmailLayout';

interface LongTermInquiryEmailProps {
  carName: string;
  duration: string;
  monthlyPrice: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message?: string;
  type: 'ADMIN' | 'CUSTOMER';
}

export const LongTermInquiryEmail: React.FC<LongTermInquiryEmailProps> = ({ 
  carName, 
  duration, 
  monthlyPrice, 
  customerName, 
  customerEmail, 
  customerPhone, 
  message,
  type
}) => {
  const isCustomer = type === 'CUSTOMER';
  
  const title = isCustomer 
    ? 'Inquiry Received' 
    : 'New Long Term Inquiry';
    
  const intro = isCustomer
    ? `Dear ${customerName}, thank you for your interest! We have received your request for the vehicle below.`
    : 'A new long term rental inquiry has been submitted.';

  const actionText = isCustomer
    ? 'Our team will review your request and get back to you shortly regarding availability and next steps.'
    : 'Please review the details below and contact the customer.';

  return (
    <EmailLayout preview={title}>
      <h1 style={h1}>{title}</h1>
      <p style={p}>{intro}</p>
      <p style={p}>{actionText}</p>

      <div style={infoBox}>
        <div style={{ 
          marginBottom: '20px', 
          borderBottom: '1px solid #e4e4e7', 
          paddingBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
           <span style={{ 
             backgroundColor: '#000000', 
             color: '#ffffff', 
             padding: '4px 8px', 
             borderRadius: '4px', 
             fontSize: '12px', 
             fontWeight: 'bold',
             textTransform: 'uppercase',
             letterSpacing: '1px'
           }}>
             Long Term
           </span>
           <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#09090b', marginLeft: '10px' }}>
             {carName}
           </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Duration</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                {duration} Months
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Monthly Price</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                €{monthlyPrice}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Est. Total Value</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                €{(Number(monthlyPrice) * Number(duration)).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px', color: '#09090b' }}>
          Customer Details
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Name</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                {customerName}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Email</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                <a href={`mailto:${customerEmail}`} style={{ color: '#09090b', textDecoration: 'none' }}>{customerEmail}</a>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Phone</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                <a href={`tel:${customerPhone}`} style={{ color: '#09090b', textDecoration: 'none' }}>{customerPhone}</a>
              </td>
            </tr>
            {message && (
              <tr>
                <td colSpan={2} style={{ padding: '16px 0 0 0' }}>
                  <div style={label}>Message:</div>
                  <div style={{ ...value, marginTop: '4px', fontStyle: 'italic', backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px' }}>
                    "{message}"
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isCustomer && (
        <div style={{ textAlign: 'center' }}>
          <a href={`mailto:${customerEmail}?subject=Re: Inquiry for ${carName}`} style={btn}>
            Reply to Customer
          </a>
        </div>
      )}
    </EmailLayout>
  );
};
