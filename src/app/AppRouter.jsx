import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { Canvas } from '@react-three/fiber';
import { SomniaScene } from '@/pages/SomniaScene';
import { ModuleDetails } from '@/pages/ModuleDetails';
import { DescriptionContainer } from '@/entities/DescriptionContainer';

export const AppRouter = () => {
  const description = useMemo(
    () => (
      <DescriptionContainer>
        <>
          <strong>Controls:</strong>
          <div>
            <strong>W A S D</strong> - moving
          </div>
          <div>
            <strong>Enter</strong> - redirect to module - works if module selected by cursor(target)
          </div>
          <div>
            <strong>Esc</strong> - to back from 3D Scene
          </div>
          <br />
          <strong>Interactive:</strong> You can moving in the 3D space and hovered modules. If you
          want to research module, you can focus on it and redirect to module page
        </>
      </DescriptionContainer>
    ),
    [],
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={
            <div style={{ width: '100vw', height: '100vh' }}>
              {description}
              <Canvas camera={{ position: [0, 2, 5] }}>
                <SomniaScene />
              </Canvas>
            </div>
          }
        />
        <Route path='/:id' element={<ModuleDetails />} />
      </Routes>
    </BrowserRouter>
  );
};
