
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
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <FallbackModel color="#9b87f5" scale={(props.scale || 3) / 3} emotion={props.emotion} />;
  }
  
  try {
    return <AvatarModel {...props} onError={() => setHasError(true)} />;
  } catch (error) {
    console.error("Error rendering avatar model:", error);
    return <FallbackModel color="#9b87f5" scale={(props.scale || 3) / 3} emotion={props.emotion} />;
  }
}

// Enhanced animation with improved lip sync effect
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
  const [blinkTimer, setBlinkTimer] = useState<number>(0);
  const [lastLipValue, setLastLipValue] = useState<number>(0);
  
  let gltf: GLTFResult | null = null;
  try {
    gltf = useGLTF(modelPath) as GLTFResult;
  } catch (error) {
    console.error(`Error loading model ${modelPath}:`, error);
    if (onError) {
      setTimeout(onError, 0);
    }
  }
  
  const { actions } = useAnimations(gltf?.animations || [], groupRef);
  
  useEffect(() => {
    if (gltf?.scene) {
      setLoaded(true);
      
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
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Natural idle movements
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    
    // More natural head movements
    if (emotion === 'happy') {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.02;
    } else if (emotion === 'sad') {
      groupRef.current.rotation.x = -0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.02 - 0.05;
    } else if (emotion === 'surprised') {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.03;
    } else if (emotion === 'angry') {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    } else {
      // Neutral subtle movements
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.01;
    }
    
    if (gltf?.scene) {
      const eyeBones = groupRef.current.children[0]?.children.filter(
        child => child.name.includes('eye')
      ) || [];
      
      // Enhanced lip syncing with more natural movements and variations
      if (speaking && groupRef.current.children[0]?.children) {
        const jawBone = groupRef.current.children[0].children.find(
          child => child.name === 'jaw' || child.name.includes('mouth')
        );
        
        const mouthBones = groupRef.current.children[0].children.filter(
          child => child.name.includes('mouth') || child.name.includes('lip')
        );
        
        // More realistic lip syncing with varied patterns
        if (jawBone) {
          // Generate a natural-looking speech pattern
          const baseFreq = 12;
          const variationFreq = 7.3;
          const emotionMod = emotion === 'angry' ? 1.3 : 
                             emotion === 'happy' ? 1.1 : 
                             emotion === 'sad' ? 0.8 : 1;
                             
          const openAmount = Math.sin(state.clock.elapsedTime * baseFreq * emotionMod) * 0.15;
          const randomVariation = Math.sin(state.clock.elapsedTime * variationFreq) * 0.05;
          const secondaryVariation = Math.sin(state.clock.elapsedTime * 3.7) * 0.03;
          
          // Smoother transitions between mouth positions
          const targetValue = Math.max(0, openAmount + randomVariation + secondaryVariation);
          const lerpSpeed = 0.3;
          const newLipValue = THREE.MathUtils.lerp(lastLipValue, targetValue, lerpSpeed);
          
          jawBone.rotation.x = newLipValue;
          setLastLipValue(newLipValue);
          
          // Animate other mouth parts for more realism
          mouthBones.forEach(bone => {
            if (bone !== jawBone && bone.name.includes('corner')) {
              bone.rotation.y = Math.sin(state.clock.elapsedTime * 10) * 0.02;
              
              // Different movement based on emotion
              if (emotion === 'happy') {
                bone.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.01 + 0.01;
              } else if (emotion === 'sad') {
                bone.position.y = Math.sin(state.clock.elapsedTime * 5) * 0.005 - 0.01;
              }
            }
          });
        }
      }
      
      // Enhanced emotion expressions
      if (emotion !== 'neutral' && groupRef.current.children[0]?.children) {
        const eyeBrows = groupRef.current.children[0].children.filter(
          child => child.name.includes('eyebrow') || child.name.includes('brow')
        );
        
        const mouthCorners = groupRef.current.children[0].children.filter(
          child => child.name.includes('mouth_corner') || child.name.includes('lip_corner')
        );
        
        // More nuanced emotional expressions
        switch (emotion) {
          case 'happy':
            eyeBrows.forEach(bone => {
              bone.rotation.x = -0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
              bone.position.y = 0.01 + Math.sin(state.clock.elapsedTime) * 0.003;
            });
            eyeBones.forEach(bone => {
              bone.scale.y = 1.1 + Math.sin(state.clock.elapsedTime * 3) * 0.03;
            });
            mouthCorners.forEach((bone, index) => {
              bone.position.y += 0.02 + Math.sin(state.clock.elapsedTime * 1.5) * 0.005;
              bone.rotation.z = (index % 2 === 0 ? 0.1 : -0.1) + Math.sin(state.clock.elapsedTime * 2) * 0.02;
            });
            break;
            
          case 'sad':
            eyeBrows.forEach(bone => {
              bone.rotation.x = 0.1 + Math.sin(state.clock.elapsedTime) * 0.03;
              if (bone.name.includes('inner')) {
                bone.position.y += 0.02 + Math.sin(state.clock.elapsedTime * 0.8) * 0.005;
              }
            });
            eyeBones.forEach(bone => {
              bone.scale.y = 0.9 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
            });
            mouthCorners.forEach(bone => {
              bone.position.y -= 0.02 + Math.sin(state.clock.elapsedTime) * 0.005;
              bone.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
            });
            break;
            
          case 'angry':
            eyeBrows.forEach(bone => {
              bone.rotation.x = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
              bone.position.y -= 0.02 + Math.sin(state.clock.elapsedTime * 1.2) * 0.01;
              bone.position.x += bone.name.includes('left') ? 0.02 : -0.02;
              bone.rotation.z = bone.name.includes('left') ? -0.1 : 0.1;
            });
            eyeBones.forEach(bone => {
              bone.scale.y = 0.85 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
            });
            mouthCorners.forEach(bone => {
              bone.position.y -= 0.01 + Math.sin(state.clock.elapsedTime * 3) * 0.005;
              bone.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
            });
            break;
            
          case 'surprised':
            eyeBrows.forEach(bone => {
              bone.rotation.x = -0.2 - Math.sin(state.clock.elapsedTime) * 0.05;
              bone.position.y += 0.03 + Math.sin(state.clock.elapsedTime * 1.5) * 0.01;
            });
            eyeBones.forEach(bone => {
              bone.scale.y = 1.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
              bone.scale.x = 1.2 + Math.sin(state.clock.elapsedTime * 2.5) * 0.03;
            });
            mouthCorners.forEach(bone => {
              bone.position.x += (bone.name.includes('left') ? -0.01 : 0.01);
              bone.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.01;
            });
            break;
        }
      }
      
      // Natural eye blinking
      setBlinkTimer(prevTimer => {
        // Random chance of blinking
        const shouldBlink = Math.random() < 0.002 || prevTimer > 0;
        
        if (shouldBlink) {
          const newTimer = prevTimer + 1;
          const blinkDuration = 15; // frames
          
          if (eyeBones.length && newTimer <= blinkDuration) {
            const blinkPhase = newTimer / blinkDuration;
            
            // Eyelid animation curve (down and up)
            let eyeScale = 1;
            if (blinkPhase < 0.5) {
              // Closing eyes (first half)
              eyeScale = 1 - (blinkPhase * 2);
            } else {
              // Opening eyes (second half)
              eyeScale = (blinkPhase - 0.5) * 2;
            }
            
            eyeBones.forEach(bone => {
              bone.scale.y = Math.max(0.1, eyeScale);
            });
            
            return newTimer;
          }
          
          // Reset blink timer after completion
          return 0;
        }
        
        return 0;
      });
    }
  });

  useEffect(() => {
    if (gltf?.scene) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.roughness = 0.3;
            child.material.metalness = 0.1;
            child.material.envMapIntensity = 1.2;
            
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
          
          {/* Enhanced lighting for better visual appearance */}
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
          <spotLight
            position={[-1, 1, 2]}
            angle={0.5}
            penumbra={0.5}
            intensity={0.3}
            color="#a0a0ff"
            castShadow
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
  selectedAvatar = 'stylized_male',
  onAvatarChange,
  showAvatarSelector = false
}) => {
  const selectedAvatarData = avatarOptions.find(avatar => avatar.id === selectedAvatar) || avatarOptions[0];
  const [modelLoadFailed, setModelLoadFailed] = useState(true);
  
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
