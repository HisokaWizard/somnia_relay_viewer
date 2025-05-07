import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';

export const Model3DTemplate = ({ id, name, scale = 1, initialRotation = [0, 0, 0], rotate }) => {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/${name}`);
  const modelRef = useRef();

  const finalScale = Array.isArray(scale) ? scale : [scale, scale, scale];

  const finalRotation = Array.isArray(initialRotation)
    ? initialRotation
    : typeof initialRotation === 'number'
    ? [0, initialRotation, 0]
    : [0, 0, 0];

  useEffect(() => {
    scene.userData.id = id;
  }, [scene, id]);

  useEffect(() => {
    if (modelRef.current) {
      const [rx, ry, rz] = finalRotation;
      modelRef.current.rotation.set(rx, ry, rz);
    }
  }, [finalRotation]);

  useFrame(() => {
    const [rotateX, rotateY, rotateZ] = rotate.rotateO;
    const [sppedX, sppedY, sppedZ] = rotate.rotateSpeed;
    if (rotateX && modelRef.current) {
      modelRef.current.rotation.x += sppedX;
    }
    if (rotateY && modelRef.current) {
      modelRef.current.rotation.y += sppedY;
    }
    if (rotateZ && modelRef.current) {
      modelRef.current.rotation.z += sppedZ;
    }
  });

  return <primitive ref={modelRef} object={scene} scale={finalScale} />;
};
