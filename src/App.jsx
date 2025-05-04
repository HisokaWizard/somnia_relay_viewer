import React, { useState } from 'react';
import { RelayVisualizer } from './components/RelayVisualizer';
import { EvolutionVisualizer } from './components/EvolutionVisualizer';
import { SomniaScene } from './SomniaPresentor/SomniaScene';
import { Canvas } from '@react-three/fiber';

export default function App() {
  const [toggleVisualizer, setToggleVisualizer] = useState(true);
  const [toggleViewer, setToggleViewer] = useState(false);

  return (
    <div className='container' style={{ backgroundColor: '#252323', padding: 0, margin: 0 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ color: 'coral', padding: '0 10px' }}>Blockchain Relay Viewer</h1>
      </header>
      <div style={{ display: 'flex', padding: '0 10px' }}>
        <button style={{ padding: '5px' }} onClick={() => setToggleVisualizer((prev) => !prev)}>
          {toggleVisualizer ? 'Turn on visualizer' : 'Turn off visualizer'}
        </button>
        <button style={{ padding: '5px' }} onClick={() => setToggleViewer((prev) => !prev)}>
          {toggleViewer ? 'Turn on viewer' : 'Turn off viewer'}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {toggleVisualizer ? <EvolutionVisualizer /> : null}
        {toggleViewer ? <RelayVisualizer /> : null}
        <div style={{ width: '100vw', height: '100vh' }}>
          <Canvas camera={{ position: [0, 2, 5] }}>
            <SomniaScene />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
