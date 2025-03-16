
import React from 'react';
import { Canvas } from '@react-three/fiber';
import FloatingCube from './3dElements/FloatingCube';
import OrbitingSpheres from './3dElements/OrbitingSpheres';

const BackgroundScene: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        
        {/* Decorative elements with more pleasing colors */}
        <FloatingCube position={[-5, 1, -5]} color="#9b87f5" size={0.8} speed={0.4} />
        <FloatingCube position={[5, -1, -7]} color="#d6bcfa" size={1.2} speed={0.5} />
        <FloatingCube position={[3, 3, -6]} color="#E5DEFF" size={0.6} speed={0.7} />
        <FloatingCube position={[-3, -2, -8]} color="#7E69AB" size={1} speed={0.6} />
        
        <OrbitingSpheres radius={8} count={6} color="#9b87f5" speed={0.3} />
        <OrbitingSpheres radius={12} count={8} sphereSize={0.05} color="#d6bcfa" speed={0.2} />
      </Canvas>
    </div>
  );
};

export default BackgroundScene;
