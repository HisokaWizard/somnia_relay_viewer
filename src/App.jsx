import React from 'react';
import { RelayVisualizer } from './RelayVisualizer';

export default function App() {
  return (
    <div className='container'>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1>Blockchain Relay Viewer</h1>
      </header>

      <RelayVisualizer />
    </div>
  );
}
