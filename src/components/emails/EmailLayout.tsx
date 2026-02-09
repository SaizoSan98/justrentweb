
import * as React from 'react';

interface EmailLayoutProps {
  preview?: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ preview, children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{preview}</title>
      </head>
      <body style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        backgroundColor: '#f4f4f5',
        margin: 0,
        padding: '40px 20px',
        color: '#18181b'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#09090b',
            padding: '32px 40px',
            textAlign: 'center'
          }}>
            {/* Styled Text Logo (matching site design) */}
            <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>
              <table cellPadding="0" cellSpacing="0" border={0} style={{ display: 'inline-table' }}>
                <tr>
                  <td style={{ paddingRight: '8px' }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      padding: '4px 8px',
                      borderRadius: '2px',
                      fontWeight: '900',
                      fontSize: '20px',
                      lineHeight: '1',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}>
                      JUST
                    </div>
                  </td>
                  <td>
                    <div style={{
                      color: '#ffffff',
                      fontWeight: '900',
                      fontSize: '20px',
                      lineHeight: '1',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}>
                      RENT
                    </div>
                    <div style={{
                      color: '#a1a1aa',
                      fontSize: '8px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginTop: '0px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}>
                      Rent a Car
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '40px' }}>
            {children}
          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: '#f4f4f5',
            padding: '24px 40px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#71717a',
            borderTop: '1px solid #e4e4e7'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              &copy; {new Date().getFullYear()} JustRent. All rights reserved.
            </p>
            <p style={{ margin: 0 }}>
              Budapest Liszt Ferenc Airport
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export const h1 = {
  fontSize: '24px',
  fontWeight: '800',
  margin: '0 0 24px 0',
  color: '#09090b',
  letterSpacing: '-0.5px'
};

export const p = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
  color: '#3f3f46'
};

export const btn = {
  display: 'inline-block',
  backgroundColor: '#ff5f00',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '16px',
  marginTop: '16px',
  marginBottom: '16px'
};

export const infoBox = {
  backgroundColor: '#f4f4f5',
  padding: '24px',
  borderRadius: '12px',
  margin: '24px 0'
};

export const infoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
  borderBottom: '1px solid #e4e4e7',
  paddingBottom: '8px'
};

export const label = {
  fontWeight: '600',
  color: '#71717a',
  fontSize: '14px'
};

export const value = {
  fontWeight: '500',
  color: '#09090b',
  fontSize: '14px'
};
