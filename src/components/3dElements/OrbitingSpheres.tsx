
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface OrbitingSpheresProps {
  count?: number;
  radius?: number;
  sphereSize?: number;
  color?: string;
  speed?: number;
}

const OrbitingSpheres: React.FC<OrbitingSpheresProps> = ({ 
  count = 5, 
  radius = 2, 
  sphereSize = 0.1,
  color = '#4A9DFF',
  speed = 1
}) => {
  const group = useRef(null);
  
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.getElapsedTime() * 0.2 * speed;
  });
  
  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        return (
          <mesh key={i} position={[x, 0, z]}>
            <sphereGeometry args={[sphereSize, 16, 16]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default OrbitingSpheres;
