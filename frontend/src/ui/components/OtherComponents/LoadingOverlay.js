import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingOverlay = ({ show, message }) => {
  if (!show) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p style={{ marginTop: '1rem', color: '#fff' }}>{message}</p>
      </div>
    </div>
  );
};

// Styles for the overlay and modal
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: 'transparent',
  padding: '2rem',
  borderRadius: '0.5rem',
  textAlign: 'center',
};

export default LoadingOverlay;
