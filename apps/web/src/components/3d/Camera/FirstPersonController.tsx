'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';

interface FirstPersonControllerProps {
  isInputPaused?: boolean;
}

// Bounding box obstacle definitions [minX, maxX, minZ, maxZ]
const OBSTACLES = [
  // Left server racks row
  [-5.8, -3.2, -6.5, 4.0],
  // Tool Cabinet
  [4.8, 6.2, -3.8, -2.2],
  // CRAC Cooling unit and water tray area
  [-2.8, -1.2, -5.2, -3.8],
];

export const FirstPersonController: React.FC<FirstPersonControllerProps> = ({
  isInputPaused = false,
}) => {
  const { camera } = useThree();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const controlsRef = useRef<any>(null);

  // Initial camera position inside the room looking toward the server racks and sensors
  useEffect(() => {
    camera.position.set(0, 1.65, 3.5);
    camera.lookAt(0, 1.65, -3.0);
  }, [camera]);

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputPaused) return;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isInputPaused]);

  // Movement & Collision Loop
  useFrame((_, delta) => {
    if (isInputPaused) return;

    const speed = 4.5 * delta;
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3();
    const sideVector = new THREE.Vector3();

    // Get camera facing direction projected on XZ plane
    camera.getWorldDirection(frontVector);
    frontVector.y = 0;
    frontVector.normalize();

    // Right vector
    sideVector.crossVectors(camera.up, frontVector).negate().normalize();

    if (moveState.current.forward) direction.add(frontVector);
    if (moveState.current.backward) direction.sub(frontVector);
    if (moveState.current.right) direction.add(sideVector);
    if (moveState.current.left) direction.sub(sideVector);

    if (direction.lengthSq() > 0) {
      direction.normalize();
      const nextX = camera.position.x + direction.x * speed;
      const nextZ = camera.position.z + direction.z * speed;

      // 1. Check perimeter room boundaries
      const clampedX = Math.max(-6.0, Math.min(6.0, nextX));
      const clampedZ = Math.max(-7.8, Math.min(7.8, nextZ));

      // 2. Check internal obstacles collision
      let collides = false;
      for (const [minX, maxX, minZ, maxZ] of OBSTACLES) {
        if (
          clampedX >= minX - 0.4 &&
          clampedX <= maxX + 0.4 &&
          clampedZ >= minZ - 0.4 &&
          clampedZ <= maxZ + 0.4
        ) {
          collides = true;
          break;
        }
      }

      if (!collides) {
        camera.position.x = clampedX;
        camera.position.z = clampedZ;
      }
    }

    // Keep eye height stable
    camera.position.y = 1.65;
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      selector="#canvas-container"
    />
  );
};
