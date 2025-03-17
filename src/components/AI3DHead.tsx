
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useHelper } from '@react-three/drei';
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
  
  // For blinking state
  const [blinkState, setBlinkState] = useState(0);
  
  // For speech animation
  const [mouthOpenValue, setMouthOpenValue] = useState(0);
  
  useFrame((state) => {
    if (!headRef.current) return;
    
    // Natural head movements
    headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    
    // Emotion-based animations
    if (emotion === 'happy') {
      if (leftEyebrowRef.current && rightEyebrowRef.current) {
        leftEyebrowRef.current.position.y = 0.58 + Math.sin(state.clock.elapsedTime * 0.7) * 0.01;
        rightEyebrowRef.current.position.y = 0.58 + Math.sin(state.clock.elapsedTime * 0.7) * 0.01;
      }
      if (mouthRef.current) {
        // Happy mouth - curved up at corners
        mouthRef.current.scale.set(1.2, speaking ? 0.5 + mouthOpenValue : 0.5, 1);
        mouthRef.current.position.y = -0.25 + Math.sin(state.clock.elapsedTime) * 0.01;
      }
    } else if (emotion === 'sad') {
      if (leftEyebrowRef.current && rightEyebrowRef.current) {
        leftEyebrowRef.current.rotation.z = 0.15;
        rightEyebrowRef.current.rotation.z = -0.15;
        leftEyebrowRef.current.position.y = 0.54;
        rightEyebrowRef.current.position.y = 0.54;
      }
      if (mouthRef.current) {
        // Sad mouth - curved downward
        mouthRef.current.scale.set(1, speaking ? 0.3 + mouthOpenValue : 0.3, 1);
        mouthRef.current.position.y = -0.3;
      }
    } else if (emotion === 'angry') {
      if (leftEyebrowRef.current && rightEyebrowRef.current) {
        leftEyebrowRef.current.rotation.z = -0.2;
        rightEyebrowRef.current.rotation.z = 0.2;
        leftEyebrowRef.current.position.y = 0.52;
        rightEyebrowRef.current.position.y = 0.52;
      }
      if (mouthRef.current) {
        // Angry mouth - thin line
        mouthRef.current.scale.set(0.8, speaking ? 0.2 + mouthOpenValue : 0.2, 1);
        mouthRef.current.position.y = -0.28;
      }
    } else if (emotion === 'surprised') {
      if (leftEyebrowRef.current && rightEyebrowRef.current) {
        leftEyebrowRef.current.position.y = 0.62;
        rightEyebrowRef.current.position.y = 0.62;
        leftEyebrowRef.current.rotation.z = 0;
        rightEyebrowRef.current.rotation.z = 0;
      }
      if (mouthRef.current) {
        // Surprised mouth - round O shape
        mouthRef.current.scale.set(0.7, speaking ? 0.7 + mouthOpenValue : 0.7, 1);
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
      }
      if (mouthRef.current) {
        // Neutral mouth
        mouthRef.current.scale.set(0.9, speaking ? 0.3 + mouthOpenValue : 0.3, 1);
        mouthRef.current.position.y = -0.28;
      }
    }
    
    // Speaking animation
    if (speaking) {
      const newMouthOpenValue = Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.5;
      setMouthOpenValue(newMouthOpenValue);
    } else {
      setMouthOpenValue(0);
    }
    
    // Blinking animation
    if (Math.random() < 0.005 && blinkState === 0) {
      setBlinkState(1); // Start blink
    }
    
    if (blinkState > 0) {
      if (blinkState < 5) {
        // Closing eyes
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.y = Math.max(0.1, 1 - (blinkState / 5));
          rightEyeRef.current.scale.y = Math.max(0.1, 1 - (blinkState / 5));
        }
        setBlinkState(blinkState + 1);
      } else if (blinkState < 10) {
        // Opening eyes
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
  
  // Get main color based on emotion
  const getHeadColor = () => {
    switch (emotion) {
      case 'happy': return new THREE.Color('#97c8eb');
      case 'sad': return new THREE.Color('#7a92c2');
      case 'angry': return new THREE.Color('#d89191');
      case 'surprised': return new THREE.Color('#b69ee3');
      default: return new THREE.Color('#8ab7d8');
    }
  };
  
  return (
    <group ref={headRef}>
      {/* Head */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={getHeadColor()} 
          roughness={0.2} 
          metalness={0.8}
        />
      </mesh>
      
      {/* Face plate for more humanoid shape */}
      <mesh position={[0, 0, 0.6]} castShadow>
        <sphereGeometry args={[0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial 
          color={getHeadColor()} 
          roughness={0.1} 
          metalness={0.9}
        />
      </mesh>
      
      {/* Left Eye */}
      <mesh position={[-0.3, 0.2, 0.85]} ref={leftEyeRef}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="white" roughness={0.1} />
        
        {/* Left Pupil */}
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.06, 32, 32]} />
          <meshBasicMaterial color="black" />
          
          {/* Left Pupil Highlight */}
          <mesh position={[0.02, 0.02, 0.03]} scale={0.5}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </mesh>
      </mesh>
      
      {/* Right Eye */}
      <mesh position={[0.3, 0.2, 0.85]} ref={rightEyeRef}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="white" roughness={0.1} />
        
        {/* Right Pupil */}
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.06, 32, 32]} />
          <meshBasicMaterial color="black" />
          
          {/* Right Pupil Highlight */}
          <mesh position={[0.02, 0.02, 0.03]} scale={0.5}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </mesh>
      </mesh>
      
      {/* Left Eyebrow */}
      <mesh position={[-0.3, 0.55, 0.85]} scale={[0.25, 0.05, 0.05]} ref={leftEyebrowRef}>
        <boxGeometry />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Right Eyebrow */}
      <mesh position={[0.3, 0.55, 0.85]} scale={[0.25, 0.05, 0.05]} ref={rightEyebrowRef}>
        <boxGeometry />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Mouth */}
      <mesh position={[0, -0.28, 0.85]} scale={[0.4, 0.1, 0.1]} ref={mouthRef}>
        <boxGeometry />
        <meshStandardMaterial color="#500" />
      </mesh>
      
      {/* Decorative elements - ears, etc. */}
      <mesh position={[-1.05, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.1, 0.2, 0.3, 32]} />
        <meshStandardMaterial color={getHeadColor()} metalness={0.9} />
      </mesh>
      
      <mesh position={[1.05, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.1, 0.2, 0.3, 32]} />
        <meshStandardMaterial color={getHeadColor()} metalness={0.9} />
      </mesh>
      
      {/* Head decorations/details */}
      <mesh position={[0, 0.8, 0]} scale={[0.8, 0.2, 0.8]}>
        <sphereGeometry args={[0.4, 32, 16]}/>
        <meshStandardMaterial color={getHeadColor()} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

// Environment lighting
const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
      <spotLight 
        position={[0, 5, 5]} 
        intensity={0.5} 
        angle={0.3} 
        penumbra={1} 
        castShadow
      />
      <pointLight position={[-5, -5, -5]} intensity={0.5} />
    </>
  );
};

// Background environment
const Background = () => {
  return (
    <mesh position={[0, 0, -10]}>
      <sphereGeometry args={[30, 32, 32]} />
      <meshBasicMaterial color="#050520" side={THREE.BackSide} />
      
      {/* Add stars */}
      {Array.from({ length: 200 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 60;
        const y = (Math.random() - 0.5) * 60;
        const z = (Math.random() - 0.5) * 60;
        const size = Math.random() * 0.1 + 0.05;
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
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
