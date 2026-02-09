
import * as React from 'react';
import { EmailLayout, h1, p, infoBox, label, value, btn } from './EmailLayout';

interface BookingEmailProps {
  booking: any; // Using any for simplicity, ideally Booking type
  type: 'CONFIRMATION' | 'CANCELLATION' | 'MODIFICATION' | 'COMPLETED';
}

export const BookingEmail: React.FC<BookingEmailProps> = ({ booking, type }) => {
  const titles = {
    CONFIRMATION: 'Booking Confirmed!',
    CANCELLATION: 'Booking Cancelled',
    MODIFICATION: 'Booking Updated',
    COMPLETED: 'Thank You for Choosing JustRent'
  };

  const messages = {
    CONFIRMATION: `Dear ${booking.firstName}, your booking has been successfully confirmed. We look forward to seeing you!`,
    CANCELLATION: `Dear ${booking.firstName}, your booking has been cancelled as requested.`,
    MODIFICATION: `Dear ${booking.firstName}, your booking details have been updated.`,
    COMPLETED: `Dear ${booking.firstName}, we hope you had a great trip! Here is your receipt.`
  };

  const color = type === 'CANCELLATION' ? '#ef4444' : '#ff5f00';

  return (
    <EmailLayout preview={titles[type]}>
      <h1 style={{ ...h1, color: type === 'CANCELLATION' ? '#ef4444' : h1.color }}>
        {titles[type]}
      </h1>
      <p style={p}>{messages[type]}</p>

      <div style={infoBox}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', color: '#09090b' }}>
          Booking Reference: #{booking.id.slice(-8).toUpperCase()}
        </h3>

        {/* Car Image */}
        {booking.car.imageUrl && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <img 
              src={booking.car.imageUrl.startsWith('http') ? booking.car.imageUrl : `https://justrentandtrans.com/_next/image?url=${encodeURIComponent(booking.car.imageUrl.startsWith('/') ? `https://justrentandtrans.com${booking.car.imageUrl}` : booking.car.imageUrl)}&w=3840&q=75`} 
              alt={`${booking.car.make} ${booking.car.model}`}
              style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
            />
          </div>
        )}
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Vehicle</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                <strong>{booking.car.make} {booking.car.model}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Pick-up</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                {new Date(booking.startDate).toLocaleString('hu-HU', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })}<br/>
                <span style={{ fontSize: '12px', color: '#71717a' }}>{booking.pickupLocation}</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Return</td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                {new Date(booking.endDate).toLocaleString('hu-HU', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })}<br/>
                <span style={{ fontSize: '12px', color: '#71717a' }}>{booking.dropoffLocation}</span>
              </td>
            </tr>
            {booking.fullInsurance && (
               <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', ...label }}>Insurance</td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #e4e4e7', textAlign: 'right', ...value }}>
                  Full Protection
                </td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '8px 0', ...label }}>Total Price</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: '#ff5f00' }}>
                €{Number(booking.totalPrice).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {type === 'CONFIRMATION' && (
        <div style={{ textAlign: 'center' }}>
          <a href={`https://justrentandtrans.com/dashboard/bookings/${booking.id}`} style={btn}>
            Manage Booking
          </a>
        </div>
      )}
      
      <p style={{ ...p, fontSize: '14px', color: '#71717a', marginTop: '24px' }}>
        If you have any questions, please reply to this email or contact us at support@justrentandtrans.com.
      </p>
    </EmailLayout>
  );
};
