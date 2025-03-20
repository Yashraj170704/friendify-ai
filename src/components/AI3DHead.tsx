import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useHelper, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useChat } from '@/context/ChatContext';
import type { Emotion } from '@/context/ChatContext';

interface AI3DHeadProps {
  emotion: Emotion;
  speaking: boolean;
}

const Head = ({ emotion, speaking }: { emotion: Emotion; speaking: boolean }) => {
  const headRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);
  const faceRef = useRef<THREE.Mesh>(null);
  
  // For blinking state
  const [blinkState, setBlinkState] = useState(0);
  
  // For speech animation
  const [mouthOpenValue, setMouthOpenValue] = useState(0);
  
  useFrame((state) => {
    if (!headRef.current) return;
    
    // Natural head movements - more subtle
    headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    
    // Emotion-based animations
    if (emotion === 'happy') {
      if (leftEyebrowRef.current && rightEyebrowRef.current) {
        leftEyebrowRef.current.position.y = 0.58 + Math.sin(state.clock.elapsedTime * 0.7) * 0.01;
        rightEyebrowRef.current.position.y = 0.58 + Math.sin(state.clock.elapsedTime * 0.7) * 0.01;
        leftEyebrowRef.current.rotation.z = 0.1;
        rightEyebrowRef.current.rotation.z = -0.1;
      }
      if (mouthRef.current) {
        // Happy mouth - curved up at corners with better shape
        mouthRef.current.scale.set(1.1, speaking ? 0.4 + mouthOpenValue : 0.4, 0.4);
        mouthRef.current.position.y = -0.25 + Math.sin(state.clock.elapsedTime) * 0.01;
        mouthRef.current.rotation.x = 0.1; // Slight upward curve
      }
    } else if (emotion === 'sad') {
      if (leftEyebrowRef.current && rightEyebrowRef.current) {
        leftEyebrowRef.current.rotation.z = 0.2;
        rightEyebrowRef.current.rotation.z = -0.2;
        leftEyebrowRef.current.position.y = 0.54;
        rightEyebrowRef.current.position.y = 0.54;
      }
      if (mouthRef.current) {
        // Sad mouth - curved downward with better shape
        mouthRef.current.scale.set(0.9, speaking ? 0.3 + mouthOpenValue : 0.3, 0.4);
        mouthRef.current.position.y = -0.3;
        mouthRef.current.rotation.x = -0.1; // Slight downward curve
      }
    } else if (emotion === 'angry') {
      if (leftEyebrowRef.current && rightEyebrowRef.current) {
        leftEyebrowRef.current.rotation.z = -0.25;
        rightEyebrowRef.current.rotation.z = 0.25;
        leftEyebrowRef.current.position.y = 0.52;
        rightEyebrowRef.current.position.y = 0.52;
      }
      if (mouthRef.current) {
        // Angry mouth - thinner with tension
        mouthRef.current.scale.set(0.8, speaking ? 0.25 + mouthOpenValue : 0.25, 0.4);
        mouthRef.current.position.y = -0.28;
        mouthRef.current.rotation.x = -0.05;
      }
    } else if (emotion === 'surprised') {
      if (leftEyebrowRef.current && rightEyebrowRef.current) {
        leftEyebrowRef.current.position.y = 0.62;
        rightEyebrowRef.current.position.y = 0.62;
        leftEyebrowRef.current.rotation.z = 0;
        rightEyebrowRef.current.rotation.z = 0;
        leftEyebrowRef.current.scale.y = 1.2;
        rightEyebrowRef.current.scale.y = 1.2;
      }
      if (mouthRef.current) {
        // Surprised mouth - round O shape
        mouthRef.current.scale.set(0.7, speaking ? 0.7 + mouthOpenValue : 0.7, 0.5);
        mouthRef.current.position.y = -0.28;
      }
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = 1.2;
        rightEyeRef.current.scale.y = 1.2;
      }
    } else {
      // Neutral emotion
      if (leftEyebrowRef.current && rightEyebrowRef.current) {
        leftEyebrowRef.current.rotation.z = 0;
        rightEyebrowRef.current.rotation.z = 0;
        leftEyebrowRef.current.position.y = 0.55;
        rightEyebrowRef.current.position.y = 0.55;
        leftEyebrowRef.current.scale.y = 1;
        rightEyebrowRef.current.scale.y = 1;
      }
      if (mouthRef.current) {
        // Neutral mouth - more natural shape
        mouthRef.current.scale.set(0.9, speaking ? 0.3 + mouthOpenValue : 0.3, 0.4);
        mouthRef.current.position.y = -0.28;
        mouthRef.current.rotation.x = 0;
      }
    }
    
    // Speaking animation - smoother and more varied
    if (speaking) {
      const newMouthOpenValue = (Math.sin(state.clock.elapsedTime * 8) * 0.3 + Math.sin(state.clock.elapsedTime * 12) * 0.2) * 0.5;
      setMouthOpenValue(Math.abs(newMouthOpenValue));
    } else {
      setMouthOpenValue(0);
    }
    
    // Blinking animation - more natural
    if (Math.random() < 0.005 && blinkState === 0) {
      setBlinkState(1); // Start blink
    }
    
    if (blinkState > 0) {
      if (blinkState < 5) {
        // Closing eyes - smoother
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.y = Math.max(0.1, 1 - (blinkState / 5));
          rightEyeRef.current.scale.y = Math.max(0.1, 1 - (blinkState / 5));
        }
        setBlinkState(blinkState + 1);
      } else if (blinkState < 10) {
        // Opening eyes - smoother
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.y = Math.min(1, (blinkState - 5) / 5);
          rightEyeRef.current.scale.y = Math.min(1, (blinkState - 5) / 5);
        }
        setBlinkState(blinkState + 1);
      } else {
        // Reset blink
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.y = 1;
          rightEyeRef.current.scale.y = 1;
        }
        setBlinkState(0);
      }
    }
  });
  
  // Get main color based on emotion - returning to original purple colors
  const getHeadColor = () => {
    switch (emotion) {
      case 'happy': return new THREE.Color('#9b87f5'); // Purple tone
      case 'sad': return new THREE.Color('#8a77e5'); // Slightly darker purple
      case 'angry': return new THREE.Color('#a292f0'); // Slight red-purple
      case 'surprised': return new THREE.Color('#b19df5'); // Lighter purple
      default: return new THREE.Color('#9b87f5'); // Default purple
    }
  };
  
  // Get secondary color (for facial features and details)
  const getSecondaryColor = () => {
    switch (emotion) {
      case 'happy': return new THREE.Color('#8a77db'); // Complementary purple
      case 'sad': return new THREE.Color('#7a69cc'); // Darker purple
      case 'angry': return new THREE.Color('#9182e0'); // Mid-purple
      case 'surprised': return new THREE.Color('#a292f0'); // Light purple
      default: return new THREE.Color('#8a77db'); // Default secondary purple
    }
  };
  
  // Mesh Distort Material for more organic look
  const headMaterial = {
    color: getHeadColor(),
    roughness: 0.4,
    metalness: 0.2,
    clearcoat: 0.3,
    clearcoatRoughness: 0.8,
    envMapIntensity: 0.7
  };
  
  return (
    <group ref={headRef}>
      {/* Main Head - smoother, more visible shape */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial 
          {...headMaterial}
        />
      </mesh>
      
      
      {/* Cheeks for more natural face shape */}
      <mesh position={[-0.5, -0.2, 0.6]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial 
          color={getSecondaryColor()}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
      
      <mesh position={[0.5, -0.2, 0.6]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial 
          color={getSecondaryColor()}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
      
      {/* Left Eye - smaller, more normal size */}
      <mesh position={[-0.3, 0.2, 0.95]} ref={leftEyeRef}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="white" roughness={0.1} />
        
        {/* Left Pupil */}
        <mesh position={[0, 0, 0.06]}>
          <sphereGeometry args={[0.06, 32, 32]} />
          <meshBasicMaterial color="#1a1a2e" />
          
          {/* Left Pupil Highlight */}
          <mesh position={[0.02, 0.02, 0.03]} scale={0.6}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </mesh>
      </mesh>
      
      {/* Right Eye - smaller, more normal size */}
      <mesh position={[0.3, 0.2, 0.95]} ref={rightEyeRef}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="white" roughness={0.1} />
        
        {/* Right Pupil */}
        <mesh position={[0, 0, 0.06]}>
          <sphereGeometry args={[0.06, 32, 32]} />
          <meshBasicMaterial color="#1a1a2e" />
          
          {/* Right Pupil Highlight */}
          <mesh position={[0.02, 0.02, 0.03]} scale={0.6}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </mesh>
      </mesh>
      
      {/* Improved mouth with better shape and texture */}
      <mesh position={[0, -0.28, 0.88]} scale={[0.4, 0.1, 0.1]} ref={mouthRef}>
        <mesh rotation={[0, Math.PI/2, 0]}>
          <capsuleGeometry args={[0.1, 0.8, 8, 16]} />
        </mesh>
        <meshStandardMaterial color="#C74D49" roughness={0.3} />
      </mesh>
      
      {/* Improved jaw line */}
      <mesh position={[0, -0.5, 0.4]} scale={[0.9, 0.3, 0.6]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial 
          {...headMaterial}
          roughness={0.5}
        />
      </mesh>
      
      {/* Better defined nose */}
      <mesh position={[0, -0.05, 1.08]} rotation={[Math.PI/4, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 16]} />
        <meshStandardMaterial color={getHeadColor()} metalness={0.1} roughness={0.6} />
      </mesh>
      
      {/* Ears */}
      <mesh position={[-1.0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <capsuleGeometry args={[0.1, 0.3, 16, 16]} />
        <meshPhysicalMaterial 
          color={getHeadColor()} 
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      
      <mesh position={[1.0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <capsuleGeometry args={[0.1, 0.3, 16, 16]} />
        <meshPhysicalMaterial 
          color={getHeadColor()} 
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      
      {/* Improved head top with better shape */}
      <mesh position={[0, 0.8, 0]} scale={[0.9, 0.3, 0.9]}>
        <sphereGeometry args={[0.5, 32, 32]}/>
        <meshPhysicalMaterial 
          color={getHeadColor()} 
          metalness={0.1} 
          roughness={0.6}
          clearcoat={0.2}
        />
      </mesh>
      
      {/* Subtle neck with better contrast */}
      <mesh position={[0, -1.0, 0]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 0.5, 32]} />
        <meshPhysicalMaterial 
          color={getHeadColor()} 
          metalness={0.1}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
};

// Enhanced lighting to better highlight the eyes and face
const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
        color="#fff"
      />
      <spotLight 
        position={[0, 0, 5]} 
        intensity={1.2} 
        angle={0.3} 
        penumbra={1} 
        castShadow
        color="#fff"
      />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#f0f8ff" />
      {/* Strong front light to ensure face is fully visible */}
      <pointLight position={[0, 0, 3]} intensity={1.8} color="#ffffff" />
    </>
  );
};

// Enhanced background environment
const Background = () => {
  return (
    <mesh position={[0, 0, -10]}>
      <sphereGeometry args={[30, 64, 64]} />
      <meshBasicMaterial color="#050520" side={THREE.BackSide} />
      
      {/* Add more stars and nebula-like particles */}
      {Array.from({ length: 300 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 60;
        const y = (Math.random() - 0.5) * 60;
        const z = (Math.random() - 0.5) * 60;
        const size = Math.random() * 0.15 + 0.03;
        
        // Different star colors for more realistic space
        const colors = ['#ffffff', '#fffaf0', '#f0f8ff', '#e6e6fa', '#b0c4de'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
      
      {/* Add distant nebula clouds */}
      {Array.from({ length: 10 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 50;
        const y = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        const size = Math.random() * 10 + 5;
        
        // Different nebula colors
        const nebulaColors = ['#8b5cf6', '#0ea5e9', '#d946ef', '#5e9bcd', '#b76b6b'];
        const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
        
        return (
          <mesh key={`nebula-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.2} />
          </mesh>
        );
      })}
    </mesh>
  );
};

const AI3DHead: React.FC<AI3DHeadProps> = ({ emotion, speaking }) => {
  return (
    <div className="w-full h-full tech-scanline">
      <Canvas shadows camera={{ position: [0, 0, 3], fov: 50 }}>
        <Lights />
        <Head emotion={emotion} speaking={speaking} />
        <Background />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 2 - 0.5}
          maxPolarAngle={Math.PI / 2 + 0.5}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
      
      {speaking && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-1 h-3 bg-purple-500 rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]" />
          <div className="w-1 h-5 bg-purple-500 rounded-full animate-[equalizer_0.7s_ease-in-out_infinite_0.1s]" />
          <div className="w-1 h-3 bg-purple-500 rounded-full animate-[equalizer_0.6s_ease-in-out_infinite_0.2s]" />
          <div className="w-1 h-7 bg-purple-500 rounded-full animate-[equalizer_0.5s_ease-in-out_infinite_0.3s]" />
          <div className="w-1 h-4 bg-purple-500 rounded-full animate-[equalizer_0.4s_ease-in-out_infinite_0.4s]" />
        </div>
      )}
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-purple-500/20 to-transparent opacity-30"></div>
      </div>
    </div>
  );
};

export default AI3DHead;
