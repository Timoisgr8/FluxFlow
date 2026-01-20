// src/components/Dashboard/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = "Loading...", className = "", style = {} }) => (
  <div 
    className={`loading-spinner ${className}`} 
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      ...style 
    }}
  >
    <div style={{ 
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      animation: 'spin 1s linear infinite',
      marginRight: '10px'
    }} />
    <span>{message}</span>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default LoadingSpinner;