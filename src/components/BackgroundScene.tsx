
import React from 'react';
import { Canvas } from '@react-three/fiber';
import FloatingCube from './3dElements/FloatingCube';
import OrbitingSpheres from './3dElements/OrbitingSpheres';

const BackgroundScene: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        {/* Decorative elements */}
        <FloatingCube position={[-5, 1, -5]} color="#4A9DFF" size={0.8} speed={0.5} />
        <FloatingCube position={[5, -1, -7]} color="#996AFF" size={1.2} speed={0.7} />
        <FloatingCube position={[3, 3, -6]} color="#FF6A6A" size={0.6} speed={1.2} />
        <FloatingCube position={[-3, -2, -8]} color="#6AFFB8" size={1} speed={0.8} />
        
        <OrbitingSpheres radius={8} count={8} color="#4A9DFF" speed={0.5} />
        <OrbitingSpheres radius={12} count={12} sphereSize={0.05} color="#996AFF" speed={0.3} />
      </Canvas>
    </div>
  );
};

export default BackgroundScene;
