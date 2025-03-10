
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { motion } from 'framer-motion';
import type { Emotion } from '@/context/ChatContext';

const avatarOptions = [
  { 
    id: 'robot', 
    name: 'Robot', 
    model: '/models/robot_head.glb',
    position: [0, -0.5, 0],
    scale: 2.5,
    rotation: [0, 0, 0]
  },
  { 
    id: 'female', 
    name: 'Sophia', 
    model: '/models/female_head.glb',
    position: [0, -0.7, 0],
    scale: 4,
    rotation: [0, 0, 0]
  },
  { 
    id: 'male', 
    name: 'Alex', 
    model: '/models/male_head.glb',
    position: [0, -0.5, 0],
    scale: 3,
    rotation: [0, 0, 0]
  },
];

// Fallback placeholders in case models don't load
export const getAvatarPlaceholder = (id: string) => {
  switch (id) {
    case 'robot':
      return '🤖';
    case 'female':
      return '👩';
    case 'male':
      return '👨';
    default:
      return '🤖';
  }
};

// Animation with lip sync effect
function AvatarModel({ 
  modelPath, 
  position = [0, 0, 0], 
  scale = 3, 
  rotation = [0, 0, 0],
  emotion = 'neutral',
  speaking = false
}) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, group);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    if (scene) {
      setLoaded(true);
      
      // Start idle animation if available
      if (actions && actions.idle) {
        actions.idle.reset().fadeIn(0.5).play();
      }
    }
    
    return () => {
      if (actions && actions.idle) {
        actions.idle.fadeOut(0.5);
      }
    };
  }, [scene, actions]);
  
  // Speaking animation - simulated lip movement
  useFrame((state) => {
    if (!group.current) return;
    
    // Subtle head movement
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    
    // If speaking, animate mouth/jaw if available
    if (speaking && group.current.children[0]?.children) {
      const jawBone = group.current.children[0].children.find(
        child => child.name === 'jaw' || child.name.includes('mouth')
      );
      
      if (jawBone) {
        jawBone.rotation.x = Math.sin(state.clock.elapsedTime * 10) * 0.1;
      }
    }
    
    // Emotion handling - could adjust facial bones based on emotion
    if (emotion !== 'neutral' && group.current.children[0]?.children) {
      const eyeBones = group.current.children[0].children.filter(
        child => child.name.includes('eye')
      );
      
      eyeBones.forEach(bone => {
        if (emotion === 'surprised') {
          bone.scale.y = 1.2;
        } else if (emotion === 'happy') {
          bone.scale.y = 1.1;
        } else {
          bone.scale.y = 1;
        }
      });
    }
  });

  return (
    <group ref={group} position={position} scale={scale} rotation={rotation}>
      {loaded ? (
        <primitive object={scene} />
      ) : (
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#4A9DFF" wireframe />
        </mesh>
      )}
    </group>
  );
}

interface ThreeDAvatarProps {
  emotion: Emotion;
  speaking: boolean;
  selectedAvatar?: string;
  onAvatarChange?: (avatarId: string) => void;
  showAvatarSelector?: boolean;
}

const ThreeDAvatar: React.FC<ThreeDAvatarProps> = ({ 
  emotion = 'neutral',
  speaking = false,
  selectedAvatar = 'robot',
  onAvatarChange,
  showAvatarSelector = false
}) => {
  const selectedAvatarData = avatarOptions.find(avatar => avatar.id === selectedAvatar) || avatarOptions[0];
  
  return (
    <div className="relative w-full">
      <div className="aspect-square w-full max-w-[300px] mx-auto cyber-border rounded-full overflow-hidden bg-black bg-opacity-20 shadow-xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full h-full tech-scanline"
        >
          <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <pointLight position={[-5, -5, -5]} intensity={1} />
            
            <AvatarModel 
              modelPath={selectedAvatarData.model}
              position={selectedAvatarData.position}
              scale={selectedAvatarData.scale}
              rotation={selectedAvatarData.rotation}
              emotion={emotion}
              speaking={speaking}
            />
            
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              minPolarAngle={Math.PI / 2 - 0.5}
              maxPolarAngle={Math.PI / 2 + 0.5}
            />
          </Canvas>
          
          {/* Fallback in case 3D model doesn't load */}
          <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-10 pointer-events-none">
            {getAvatarPlaceholder(selectedAvatar)}
          </div>
        </motion.div>
      </div>
      
      {showAvatarSelector && (
        <div className="mt-4 flex justify-center gap-3">
          {avatarOptions.map(avatar => (
            <button
              key={avatar.id}
              onClick={() => onAvatarChange && onAvatarChange(avatar.id)}
              className={`p-2 rounded-full transition-all ${
                selectedAvatar === avatar.id 
                  ? 'bg-friend ring-2 ring-white text-white scale-110' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              aria-label={`Select ${avatar.name} avatar`}
            >
              <span className="text-xl">{getAvatarPlaceholder(avatar.id)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreeDAvatar;
