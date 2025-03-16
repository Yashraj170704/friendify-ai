
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

// Enhanced avatar fallback component with more sophisticated animations
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
  
  // Select the appropriate avatar image based on ID
  const getAvatarImage = () => {
    switch (id) {
      case 'stylized_male':
        return "/lovable-uploads/33c83a83-ca5a-458c-8a0b-3adff4a9d69f.png";
      case 'stylized_female':
        return "/lovable-uploads/b53fef24-c4c3-42aa-ac42-81ad2ac8d912.png";
      case 'robot':
        return "/lovable-uploads/420bbb98-bf8a-47bf-a0d9-c9575cd88890.png";
      default:
        return "/lovable-uploads/420bbb98-bf8a-47bf-a0d9-c9575cd88890.png";
    }
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-radial from-purple-500/10 to-transparent opacity-70 animate-pulse-slow pointer-events-none`}></div>
      <img 
        src={getAvatarImage()} 
        alt="AI Avatar" 
        className={`object-cover max-h-full rounded-full ${getEmotionClass()}`}
      />
      
      {/* Animated particles for visual effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-purple-400"
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: '100%', 
              opacity: 0.7 
            }}
            animate={{ 
              y: '0%', 
              opacity: 0,
              scale: [1, 2, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Simple fallback 3D model when GLB files can't be loaded
function FallbackModel({ 
  color = '#9b87f5',
  scale = 1,
  emotion = 'neutral'
}: { 
  color?: string; 
  scale?: number;
  emotion?: Emotion;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    
    // Simple animation for the fallback model
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    
    // Emotion-based animations
    switch(emotion) {
      case 'happy':
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
        break;
      case 'sad':
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1 - 0.2;
        break;
      case 'angry':
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.05;
        break;
      case 'surprised':
        const pulse = Math.sin(state.clock.elapsedTime * 8);
        if (pulse > 0.7) {
          meshRef.current.scale.setScalar(1 + pulse * 0.1);
        } else {
          meshRef.current.scale.setScalar(1);
        }
        break;
      default:
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });
  
  return (
    <group ref={groupRef} scale={scale}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>
      
      {/* Eyes for the fallback avatar */}
      <mesh position={[0.3, 0.3, 0.85]} scale={0.12}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.3, 0.3, 0.85]} scale={0.12}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Pupils that react to emotion */}
      <mesh 
        position={[0.3, 0.3, 0.92]} 
        scale={emotion === 'surprised' ? 0.07 : emotion === 'angry' ? 0.04 : 0.05}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh 
        position={[-0.3, 0.3, 0.92]} 
        scale={emotion === 'surprised' ? 0.07 : emotion === 'angry' ? 0.04 : 0.05}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Mouth that changes with emotion */}
      {emotion === 'happy' && (
        <mesh position={[0, -0.2, 0.85]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.3, 0.05, 16, 16, Math.PI]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      )}
      
      {emotion === 'sad' && (
        <mesh position={[0, -0.3, 0.85]} rotation={[0, 0, Math.PI * 1.5]}>
          <torusGeometry args={[0.3, 0.05, 16, 16, Math.PI]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      )}
      
      {emotion === 'angry' && (
        <mesh position={[0, -0.2, 0.85]}>
          <boxGeometry args={[0.5, 0.05, 0.05]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      )}
      
      {emotion === 'surprised' && (
        <mesh position={[0, -0.2, 0.85]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      )}
      
      {emotion === 'neutral' && (
        <mesh position={[0, -0.2, 0.85]}>
          <boxGeometry args={[0.4, 0.03, 0.05]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      )}
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
  onError?: () => void;
  avatarId: string;
}) {
  // Instead of using try/catch inside the component function which can cause React hook issues,
  // we use error state that gets updated only on first render or when props change
  const [hasError, setHasError] = useState(false);
  
  // If we already know there's an error, render the fallback immediately
  if (hasError) {
    return <FallbackModel color="#9b87f5" scale={(props.scale || 3) / 3} emotion={props.emotion} />;
  }
  
  // If no error yet, try to render the real model with error boundary
  try {
    return <AvatarModel {...props} onError={() => setHasError(true)} />;
  } catch (error) {
    // This catch will only run on first render
    console.error("Error rendering avatar model:", error);
    return <FallbackModel color="#9b87f5" scale={(props.scale || 3) / 3} emotion={props.emotion} />;
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
    
    // Add smooth head movement
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    if (emotion === 'happy') {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    } else if (emotion === 'sad') {
      groupRef.current.rotation.x = -0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
    
    // Only try to animate face parts if we have a valid model loaded
    if (gltf?.scene) {
      // If speaking, animate mouth/jaw if available
      if (speaking && groupRef.current.children[0]?.children) {
        const jawBone = groupRef.current.children[0].children.find(
          child => child.name === 'jaw' || child.name.includes('mouth')
        );
        
        if (jawBone) {
          // More natural speaking pattern with varied movement
          const openAmount = Math.sin(state.clock.elapsedTime * 15) * 0.15;
          const randomVariation = Math.sin(state.clock.elapsedTime * 7.3) * 0.05;
          jawBone.rotation.x = Math.max(0, openAmount + randomVariation);
        }
      }
      
      // Emotion handling - could adjust facial bones based on emotion
      if (emotion !== 'neutral' && groupRef.current.children[0]?.children) {
        const eyeBrows = groupRef.current.children[0].children.filter(
          child => child.name.includes('eyebrow') || child.name.includes('brow')
        );
        
        const eyeBones = groupRef.current.children[0].children.filter(
          child => child.name.includes('eye')
        );
        
        const mouthCorners = groupRef.current.children[0].children.filter(
          child => child.name.includes('mouth_corner') || child.name.includes('lip_corner')
        );
        
        // Apply emotion-specific facial animations
        switch (emotion) {
          case 'happy':
            eyeBrows.forEach(bone => {
              bone.rotation.x = -0.1;
            });
            eyeBones.forEach(bone => {
              bone.scale.y = 1.1;
            });
            mouthCorners.forEach((bone, index) => {
              // Left corner up, right corner up
              bone.position.y += 0.02;
            });
            break;
            
          case 'sad':
            eyeBrows.forEach(bone => {
              bone.rotation.x = 0.1;
              // Inner eyebrows raised
              if (bone.name.includes('inner')) {
                bone.position.y += 0.02;
              }
            });
            mouthCorners.forEach(bone => {
              // Mouth corners down
              bone.position.y -= 0.02;
            });
            break;
            
          case 'angry':
            eyeBrows.forEach(bone => {
              bone.rotation.x = 0.2;
              // Bring brows together and down
              bone.position.y -= 0.02;
              bone.position.x += bone.name.includes('left') ? 0.02 : -0.02;
            });
            mouthCorners.forEach(bone => {
              // Mouth corners slightly down
              bone.position.y -= 0.01;
            });
            break;
            
          case 'surprised':
            eyeBrows.forEach(bone => {
              bone.rotation.x = -0.2;
              bone.position.y += 0.03;
            });
            eyeBones.forEach(bone => {
              bone.scale.y = 1.3;
            });
            break;
        }
      }
      
      // Blinking animation regardless of emotion
      if (eyeBones.length && Math.random() < 0.005) {
        // Random blinking
        eyeBones.forEach(bone => {
          bone.scale.y = 0.1;
          setTimeout(() => {
            if (bone) bone.scale.y = 1;
          }, 150);
        });
      }
    }
  });

  // Enhanced material settings for better visuals
  useEffect(() => {
    if (gltf?.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Enhance materials for better visual quality
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.roughness = 0.3;
            child.material.metalness = 0.1;
            child.material.envMapIntensity = 1.2;
            
            // Add subtle subsurface scattering effect for skin
            if (child.name.includes('skin') || child.name.includes('face')) {
              child.material.roughness = 0.2;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          }
        }
      });
    }
  }, [gltf]);

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={rotation}>
      {loaded && gltf?.scene ? (
        <>
          <primitive object={gltf.scene} />
          
          {/* Add environmental lighting for better visuals */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[1, 1, 2]}
            intensity={0.8}
            castShadow
          />
          <pointLight 
            position={[0, 0.5, 1]} 
            intensity={0.5} 
            color="#e1e1ff"
          />
        </>
      ) : (
        <FallbackModel color="#9b87f5" scale={1} emotion={emotion} />
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
          
          {/* Visual indicator for speaking state - enhanced version */}
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
          
          {/* Ambient glow effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 rounded-full bg-gradient-radial from-purple-500/20 to-transparent opacity-50"></div>
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
