'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface StudentCharacterProps {
  position?: [number, number, number];
  rotation?: number; // Heading angle in radians (around Y axis)
  isMoving?: boolean;
  variant?: 'boy' | 'girl';
}

/**
 * Stylized low-poly student character for MissionX.
 * Supports both boy and girl student avatars.
 * - Jacket: Sky Blue (#3B82F6)
 * - Pants: Dark Gray (#374151)
 * - Shoes: Sturdy Slate (#4B5563)
 * - Tech Accent: Bright Cyan (#00BFEF)
 * - Procedural natural walking bob & arm/leg swing
 */
export const StudentCharacter: React.FC<StudentCharacterProps> = ({
  position = [0, 0, 0],
  rotation = 0,
  isMoving = false,
  variant = 'boy',
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);

  // Smooth rotation and procedural walking animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // Smooth heading rotation
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      rotation,
      0.2
    );

    const time = clock.getElapsedTime() * 9.0;

    if (isMoving) {
      // Natural leg swing
      const legSwing = Math.sin(time) * 0.45;
      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;

      // Natural opposite arm swing
      const armSwing = Math.sin(time) * 0.35;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;

      // Subtle body bobbing
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.85 + Math.abs(Math.sin(time)) * 0.04;
      }
    } else {
      // Return gently to natural idle stance
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegRef.current.rotation.x,
          0,
          0.15
        );
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegRef.current.rotation.x,
          0,
          0.15
        );
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x,
          0,
          0.15
        );
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          0,
          0.15
        );
      }
      if (torsoRef.current) {
        // Subtle breathing idle
        torsoRef.current.position.y =
          0.85 + Math.sin(clock.getElapsedTime() * 2) * 0.01;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Upper Body & Torso */}
      <group ref={torsoRef} position={[0, 0.85, 0]}>
        {/* Main Jacket Body (#3B82F6) */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.36, 0.44, 0.22]} />
          <meshStandardMaterial color="#3B82F6" roughness={0.6} />
        </mesh>

        {/* Futuristic Student Lanyard / Collar Tech Trim (#00BFEF) */}
        <mesh position={[0, 0.35, 0.115]}>
          <boxGeometry args={[0.16, 0.12, 0.01]} />
          <meshBasicMaterial color="#00BFEF" />
        </mesh>

        {/* Back Tech Trim Stripe (#00BFEF) */}
        <mesh position={[0, 0.25, -0.115]}>
          <boxGeometry args={[0.22, 0.04, 0.01]} />
          <meshBasicMaterial color="#00BFEF" />
        </mesh>

        {/* Student Tech Device / Satchel on Back */}
        <mesh position={[0, 0.18, -0.14]}>
          <boxGeometry args={[0.24, 0.28, 0.06]} />
          <meshStandardMaterial color="#1E293B" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.24, -0.172]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshBasicMaterial color="#00BFEF" />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.48, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
          <meshStandardMaterial color="#FED7AA" roughness={0.8} />
        </mesh>

        {/* Head */}
        <group position={[0, 0.62, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.24, 0.22]} />
            <meshStandardMaterial color="#FED7AA" roughness={0.8} />
          </mesh>
          {/* Stylized Modern Student Hair */}
          {variant === 'girl' ? (
            <group>
              {/* Girl Hair Top Crown */}
              <mesh position={[0, 0.11, -0.01]}>
                <boxGeometry args={[0.25, 0.13, 0.25]} />
                <meshStandardMaterial color="#1E293B" roughness={0.85} />
              </mesh>
              {/* Front Bangs Framing Face */}
              <mesh position={[0, 0.09, 0.11]}>
                <boxGeometry args={[0.23, 0.08, 0.04]} />
                <meshStandardMaterial color="#1E293B" roughness={0.85} />
              </mesh>
              {/* Left Side Hair Lock */}
              <mesh position={[-0.12, -0.02, 0.05]}>
                <boxGeometry args={[0.04, 0.18, 0.12]} />
                <meshStandardMaterial color="#1E293B" roughness={0.85} />
              </mesh>
              {/* Right Side Hair Lock */}
              <mesh position={[0.12, -0.02, 0.05]}>
                <boxGeometry args={[0.04, 0.18, 0.12]} />
                <meshStandardMaterial color="#1E293B" roughness={0.85} />
              </mesh>
              {/* Stylish Back Ponytail */}
              <group position={[0, 0.08, -0.14]}>
                {/* Cyan Tech Hair Tie / Clip */}
                <mesh>
                  <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
                  <meshBasicMaterial color="#00BFEF" />
                </mesh>
                {/* Flowing Ponytail Tail */}
                <mesh position={[0, -0.16, -0.04]} rotation={[-0.2, 0, 0]}>
                  <boxGeometry args={[0.09, 0.32, 0.08]} />
                  <meshStandardMaterial color="#1E293B" roughness={0.85} />
                </mesh>
              </group>
            </group>
          ) : (
            <group>
              <mesh position={[0, 0.1, -0.02]}>
                <boxGeometry args={[0.24, 0.12, 0.24]} />
                <meshStandardMaterial color="#1E293B" roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.1, 0.1]}>
                <boxGeometry args={[0.22, 0.06, 0.04]} />
                <meshStandardMaterial color="#1E293B" roughness={0.9} />
              </mesh>
            </group>
          )}
          {/* Subtle Stylized Eyes */}
          <mesh position={[-0.06, 0.02, 0.112]}>
            <boxGeometry args={[0.03, 0.02, 0.01]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
          <mesh position={[0.06, 0.02, 0.112]}>
            <boxGeometry args={[0.03, 0.02, 0.01]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
        </group>

        {/* Left Arm (#3B82F6) */}
        <group ref={leftArmRef} position={[-0.24, 0.38, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <boxGeometry args={[0.1, 0.36, 0.1]} />
            <meshStandardMaterial color="#3B82F6" roughness={0.6} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.38, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color="#FED7AA" roughness={0.8} />
          </mesh>
        </group>

        {/* Right Arm (#3B82F6) */}
        <group ref={rightArmRef} position={[0.24, 0.38, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <boxGeometry args={[0.1, 0.36, 0.1]} />
            <meshStandardMaterial color="#3B82F6" roughness={0.6} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.38, 0]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color="#FED7AA" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Hip Pelvis Area (#374151) */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.32, 0.12, 0.2]} />
        <meshStandardMaterial color="#374151" roughness={0.7} />
      </mesh>

      {/* Left Leg (#374151 Pants + #4B5563 Shoes) */}
      <group ref={leftLegRef} position={[-0.1, 0.76, 0]}>
        <mesh position={[0, -0.34, 0]} castShadow>
          <boxGeometry args={[0.12, 0.68, 0.13]} />
          <meshStandardMaterial color="#374151" roughness={0.7} />
        </mesh>
        {/* Left Shoe */}
        <mesh position={[0, -0.71, 0.03]} castShadow>
          <boxGeometry args={[0.13, 0.08, 0.2]} />
          <meshStandardMaterial color="#4B5563" roughness={0.5} />
        </mesh>
      </group>

      {/* Right Leg (#374151 Pants + #4B5563 Shoes) */}
      <group ref={rightLegRef} position={[0.1, 0.76, 0]}>
        <mesh position={[0, -0.34, 0]} castShadow>
          <boxGeometry args={[0.12, 0.68, 0.13]} />
          <meshStandardMaterial color="#374151" roughness={0.7} />
        </mesh>
        {/* Right Shoe */}
        <mesh position={[0, -0.71, 0.03]} castShadow>
          <boxGeometry args={[0.13, 0.08, 0.2]} />
          <meshStandardMaterial color="#4B5563" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};
