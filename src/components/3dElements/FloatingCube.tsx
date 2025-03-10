
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

interface FloatingCubeProps {
  position: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
}

const FloatingCube: React.FC<FloatingCubeProps> = ({ 
  position, 
  color = '#4A9DFF', 
  size = 0.5,
  speed = 1
}) => {
  const mesh = useRef(null);
  
  useFrame((state) => {
    if (!mesh.current) return;
    
    // Rotate the cube
    mesh.current.rotation.x = MathUtils.lerp(
      mesh.current.rotation.x,
      Math.sin(state.clock.getElapsedTime() * 0.2 * speed) * Math.PI,
      0.1
    );
    mesh.current.rotation.y = MathUtils.lerp(
      mesh.current.rotation.y,
      Math.sin(state.clock.getElapsedTime() * 0.1 * speed) * Math.PI,
      0.1
    );
    
    // Float up and down
    mesh.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * speed) * 0.2;
  });
  
  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.8}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};

export default FloatingCube;
