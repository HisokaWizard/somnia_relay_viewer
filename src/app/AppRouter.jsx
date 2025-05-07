import { BrowserRouter, Routes, Route } from 'react-router';
import { Canvas } from '@react-three/fiber';
import { SomniaScene } from '@/pages/SomniaScene';
import { ModuleDetails } from '@/pages/ModuleDetails';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={
            <div style={{ width: '100vw', height: '100vh' }}>
              <Canvas camera={{ position: [0, 2, 5] }}>
                <SomniaScene />
              </Canvas>
            </div>
          }
        />
        <Route path='/module/:id' element={<ModuleDetails />} />
      </Routes>
    </BrowserRouter>
  );
};
