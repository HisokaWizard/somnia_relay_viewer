import { useGLTF } from '@react-three/drei';

export const Testing3DModel = () => {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/harledson_XYN.glb`);
  return <primitive object={scene} />;
};
