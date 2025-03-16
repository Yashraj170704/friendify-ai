
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { motion } from 'framer-motion';
import type { Emotion } from '@/context/ChatContext';
import { Group } from 'three';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

// Define proper type for the GLTF result
type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Object3D>;
  materials: Record<string, THREE.Material>;
  animations: THREE.AnimationClip[];
};

const avatarOptions = [
  { 
    id: 'stylized_male', 
    name: 'Alex', 
    model: '/models/stylized_male.glb',
    position: [0, -0.7, 0],
    scale: 3,
    rotation: [0, 0, 0]
  },
  { 
    id: 'stylized_female', 
    name: 'Sophia', 
    model: '/models/stylized_female.glb',
    position: [0, -0.7, 0],
    scale: 3,
    rotation: [0, 0, 0]
  },
  { 
    id: 'robot', 
    name: 'Robot', 
    model: '/models/robot_head.glb',
    position: [0, -0.5, 0],
    scale: 2.5,
    rotation: [0, 0, 0]
  },
];

// Fallback placeholders in case models don't load
export const getAvatarPlaceholder = (id: string) => {
  switch (id) {
    case 'stylized_male':
      return '👦';
    case 'stylized_female':
      return '👧';
    case 'robot':
      return '🤖';
    default:
      return '👦';
  }
};

// Use the uploaded image as a fallback 
const StylizedAvatarFallback = ({ id, emotion }: { id: string, emotion: Emotion }) => {
  // Get the emotion-based class
  const getEmotionClass = () => {
    switch (emotion) {
      case 'happy':
        return 'animate-bounce-light';
      case 'sad':
        return 'opacity-80 filter brightness-90';
      case 'angry':
        return 'animate-shake-light filter brightness-110 saturate-150';
      case 'surprised':
        return 'animate-pop-light';
      default:
        return '';
    }
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <img 
        src="/lovable-uploads/420bbb98-bf8a-47bf-a0d9-c9575cd88890.png" 
        alt="AI Avatar" 
        className={`object-cover max-h-full rounded-full ${getEmotionClass()}`}
      />
    </div>
  );
};

// Simple fallback 3D model when GLB files can't be loaded
function FallbackModel({ 
  color = '#9b87f5',
  scale = 1 
}: { 
  color?: string; 
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    // Simple animation for the fallback model
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
  });
  
  return (
    <group scale={scale}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
    </group>
  );
}

// Safe avatar model that catches errors and provides fallbacks
function SafeAvatarModel(props: {
  modelPath: string;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  emotion?: Emotion;
  speaking?: boolean;
  avatarId: string;
}) {
  // Instead of using try/catch inside the component function which can cause React hook issues,
  // we use error state that gets updated only on first render or when props change
  const [hasError, setHasError] = useState(false);
  
  // If we already know there's an error, render the fallback immediately
  if (hasError) {
    return <FallbackModel color="#9b87f5" scale={(props.scale || 3) / 3} />;
  }
  
  // If no error yet, try to render the real model with error boundary
  try {
    return <AvatarModel {...props} onError={() => setHasError(true)} />;
  } catch (error) {
    // This catch will only run on first render
    console.error("Error rendering avatar model:", error);
    return <FallbackModel color="#9b87f5" scale={(props.scale || 3) / 3} />;
  }
}

// Animation with lip sync effect
function AvatarModel({ 
  modelPath, 
  position = [0, 0, 0], 
  scale = 3, 
  rotation = [0, 0, 0],
  emotion = 'neutral',
  speaking = false,
  onError,
  avatarId
}: {
  modelPath: string;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  emotion?: Emotion;
  speaking?: boolean;
  onError?: () => void;
  avatarId: string;
}) {
  const groupRef = useRef<Group>(null);
  const [loaded, setLoaded] = useState(false);
  
  // Use a separate try/catch for the GLTF loading to avoid React hook ordering issues
  let gltf: GLTFResult | null = null;
  try {
    gltf = useGLTF(modelPath) as GLTFResult;
  } catch (error) {
    console.error(`Error loading model ${modelPath}:`, error);
    if (onError) {
      // Schedule this to run after the render to avoid React hook ordering issues
      setTimeout(onError, 0);
    }
    // We'll return a simple fallback from the render below,
    // This way we don't disrupt the hook order
  }
  
  // If we have a valid GLTF, setup animations
  const { actions } = useAnimations(gltf?.animations || [], groupRef);
  
  useEffect(() => {
    if (gltf?.scene) {
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
  }, [gltf, actions]);
  
  // Speaking animation and facial expressions
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Subtle head movement
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    
    // Only try to animate face parts if we have a valid model loaded
    if (gltf?.scene) {
      // If speaking, animate mouth/jaw if available
      if (speaking && groupRef.current.children[0]?.children) {
        const jawBone = groupRef.current.children[0].children.find(
          child => child.name === 'jaw' || child.name.includes('mouth')
        );
        
        if (jawBone) {
          jawBone.rotation.x = Math.sin(state.clock.elapsedTime * 10) * 0.1;
        }
      }
      
      // Emotion handling - could adjust facial bones based on emotion
      if (emotion !== 'neutral' && groupRef.current.children[0]?.children) {
        const eyeBones = groupRef.current.children[0].children.filter(
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
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={rotation}>
      {loaded && gltf?.scene ? (
        <primitive object={gltf.scene} />
      ) : (
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#9b87f5" wireframe />
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
  selectedAvatar = 'stylized_male', // Default to stylized male avatar
  onAvatarChange,
  showAvatarSelector = false
}) => {
  const selectedAvatarData = avatarOptions.find(avatar => avatar.id === selectedAvatar) || avatarOptions[0];
  const [modelLoadFailed, setModelLoadFailed] = useState(true); // Default to true to show the image by default
  
  // Always show the image fallback for now until 3D models are provided
  useEffect(() => {
    setModelLoadFailed(true);
  }, []);
  
  return (
    <div className="relative w-full">
      <div className="aspect-square w-full max-w-[250px] mx-auto cyber-border rounded-full overflow-hidden bg-black bg-opacity-20 shadow-xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full h-full tech-scanline"
        >
          {modelLoadFailed ? (
            <StylizedAvatarFallback id={selectedAvatar} emotion={emotion} />
          ) : (
            <ErrorBoundary fallback={
              <StylizedAvatarFallback id={selectedAvatar} emotion={emotion} />
            }>
              <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                <pointLight position={[-5, -5, -5]} intensity={1} />
                
                <SafeAvatarModel 
                  modelPath={selectedAvatarData.model}
                  position={selectedAvatarData.position as [number, number, number]}
                  scale={selectedAvatarData.scale}
                  rotation={selectedAvatarData.rotation as [number, number, number]}
                  emotion={emotion}
                  speaking={speaking}
                  avatarId={selectedAvatar}
                />
                
                <OrbitControls 
                  enableZoom={false} 
                  enablePan={false}
                  minPolarAngle={Math.PI / 2 - 0.5}
                  maxPolarAngle={Math.PI / 2 + 0.5}
                />
              </Canvas>
            </ErrorBoundary>
          )}
          
          {/* Visual indicator for speaking state */}
          {speaking && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              <motion.div
                animate={{ height: [3, 10, 3] }}
                transition={{ repeat: Infinity, duration: 0.7 }}
                className="w-1 bg-purple-500 rounded-full"
              />
              <motion.div
                animate={{ height: [3, 15, 3] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }}
                className="w-1 bg-purple-500 rounded-full"
              />
              <motion.div
                animate={{ height: [3, 7, 3] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="w-1 bg-purple-500 rounded-full"
              />
            </div>
          )}
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
                  ? 'bg-purple-500 ring-2 ring-white text-white scale-110' 
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

// Custom error boundary component to catch 3D rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("3D Rendering Error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default ThreeDAvatar;
