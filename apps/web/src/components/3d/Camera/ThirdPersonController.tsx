'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { StudentCharacter } from '../Objects/StudentCharacter';

interface ThirdPersonControllerProps {
  isInputPaused?: boolean;
  initialPosition?: [number, number, number];
  bounds?: { minX: number; maxX: number; minZ: number; maxZ: number };
  obstacles?: [number, number, number, number][];
  characterVariant?: 'boy' | 'girl';
}

// Room Obstacle Bounding Boxes [minX, maxX, minZ, maxZ]
const DEFAULT_OBSTACLES: [number, number, number, number][] = [
  // Left Server Racks Row
  [-5.4, -3.4, -5.8, 3.0],
  // Right Server Racks Row
  [3.2, 5.2, -5.8, 3.0],
  // CRAC Cooling Unit & Drip Tray Area
  [-2.6, -1.2, -5.2, -3.8],
  // Tool Storage Locker
  [4.8, 6.2, -3.8, -2.2],
];

export const ThirdPersonController: React.FC<ThirdPersonControllerProps> = ({
  isInputPaused = false,
  initialPosition = [0, 0, 2.5],
  bounds,
  obstacles,
  characterVariant = 'boy',
}) => {
  const { camera } = useThree();

  // Character physical transform state
  const charPos = useRef(new THREE.Vector3(...initialPosition));
  const charHeading = useRef(0); // In radians (0 = facing -Z north into the datacenter)
  const [isMoving, setIsMoving] = useState(false);
  const [renderPos, setRenderPos] = useState<[number, number, number]>(initialPosition);
  const [renderHeading, setRenderHeading] = useState(0);

  // Key tracking state
  const keys = useRef({
    forward: false,
    backward: false,
    turnLeft: false,
    turnRight: false,
  });

  // Camera tracking smoothing vector
  const currentCameraPos = useRef(new THREE.Vector3(0, 2.0, 5.5));
  const cameraTarget = useRef(new THREE.Vector3(0, 1.2, 0));

  // Initialize camera
  useEffect(() => {
    camera.position.set(0, 2.0, 5.5);
    camera.lookAt(0, 1.2, 0);
  }, [camera]);

  // Keyboard Event Listeners — Primary Arrow Keys (plus optional WASD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputPaused) return;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          keys.current.forward = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          keys.current.backward = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          keys.current.turnLeft = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          keys.current.turnRight = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          keys.current.forward = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          keys.current.backward = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          keys.current.turnLeft = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          keys.current.turnRight = false;
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

  // Main Movement, Collision & Camera Follow Loop
  useFrame((_, delta) => {
    if (isInputPaused) {
      if (isMoving) setIsMoving(false);
      return;
    }

    const moveSpeed = 3.6 * delta;
    const turnSpeed = 2.8 * delta;

    // 1. Character Rotation (Turning Left / Right)
    if (keys.current.turnLeft) {
      charHeading.current += turnSpeed;
    }
    if (keys.current.turnRight) {
      charHeading.current -= turnSpeed;
    }

    // 2. Character Forward / Backward Translation along Heading
    let moving = false;
    const moveVector = new THREE.Vector3(0, 0, 0);

    if (keys.current.forward) {
      // Facing vector (0 radians points toward -Z)
      moveVector.x -= Math.sin(charHeading.current) * moveSpeed;
      moveVector.z -= Math.cos(charHeading.current) * moveSpeed;
      moving = true;
    }
    if (keys.current.backward) {
      moveVector.x += Math.sin(charHeading.current) * (moveSpeed * 0.7);
      moveVector.z += Math.cos(charHeading.current) * (moveSpeed * 0.7);
      moving = true;
    }

    // Update isMoving state for character walking animation
    if (moving !== isMoving) {
      setIsMoving(moving);
    }

    if (moving) {
      const nextX = charPos.current.x + moveVector.x;
      const nextZ = charPos.current.z + moveVector.z;

      // Check perimeter room boundary bounds
      const minX = bounds?.minX ?? -5.6;
      const maxX = bounds?.maxX ?? 5.6;
      const minZ = bounds?.minZ ?? -7.4;
      const maxZ = bounds?.maxZ ?? 7.4;

      const clampedX = Math.max(minX, Math.min(maxX, nextX));
      const clampedZ = Math.max(minZ, Math.min(maxZ, nextZ));

      // Check internal obstacle collision
      let collides = false;
      const playerRadius = 0.35;
      const obstacleList = obstacles ?? DEFAULT_OBSTACLES;
      for (const [oMinX, oMaxX, oMinZ, oMaxZ] of obstacleList) {
        if (
          clampedX >= oMinX - playerRadius &&
          clampedX <= oMaxX + playerRadius &&
          clampedZ >= oMinZ - playerRadius &&
          clampedZ <= oMaxZ + playerRadius
        ) {
          collides = true;
          break;
        }
      }

      if (!collides) {
        charPos.current.x = clampedX;
        charPos.current.z = clampedZ;
      }
    }

    // Keep ground height stable
    charPos.current.y = 0;

    // Update state for character rendering
    setRenderPos([charPos.current.x, charPos.current.y, charPos.current.z]);
    setRenderHeading(charHeading.current);

    // 3. Third-Person Over-the-Shoulder Camera Following
    // Calculate ideal camera position behind the character
    const camDistance = 3.0;
    const camHeight = 1.85;

    const idealCamX = charPos.current.x + Math.sin(charHeading.current) * camDistance;
    const idealCamZ = charPos.current.z + Math.cos(charHeading.current) * camDistance;
    const idealCamY = charPos.current.y + camHeight;

    // Clamp ideal camera position to stay safely inside the room walls
    const camMargin = 0.6;
    const safeCamX = Math.max((bounds?.minX ?? -5.6) - camMargin, Math.min((bounds?.maxX ?? 5.6) + camMargin, idealCamX));
    const safeCamZ = Math.max((bounds?.minZ ?? -7.4) - camMargin, Math.min((bounds?.maxZ ?? 7.4) + camMargin, idealCamZ));

    const targetPos = new THREE.Vector3(safeCamX, idealCamY, safeCamZ);

    // Smooth camera position lerping (no jitter, smooth acceleration)
    currentCameraPos.current.lerp(targetPos, Math.min(1.0, 10.0 * delta));
    camera.position.copy(currentCameraPos.current);

    // Camera looks at the character's upper torso / forward sightline
    const lookTarget = new THREE.Vector3(
      charPos.current.x - Math.sin(charHeading.current) * 0.8,
      charPos.current.y + 1.25,
      charPos.current.z - Math.cos(charHeading.current) * 0.8
    );
    cameraTarget.current.lerp(lookTarget, Math.min(1.0, 12.0 * delta));
    camera.lookAt(cameraTarget.current);
  });

  return (
    <group name="ThirdPersonPlayerRig">
      {/* Visible 3D Low-Poly Student Character */}
      <StudentCharacter
        position={renderPos}
        rotation={renderHeading}
        isMoving={isMoving}
        variant={characterVariant}
      />
    </group>
  );
};
