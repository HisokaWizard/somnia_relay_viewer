import React from 'react';

export const DescriptionContainer = ({ children }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        maxWidth: '300px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '14px',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
};
