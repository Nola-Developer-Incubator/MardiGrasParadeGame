import React, {useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useParadeGame} from '@/lib/stores/useParadeGame';

interface FloatDecorationsProps {
  decorationsPerFloat?: number;
}

export function FloatDecorationsInstanced({ decorationsPerFloat = 5 }: FloatDecorationsProps) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);

  const geometry = useMemo(() => new THREE.SphereGeometry(0.5, 6, 6), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFD700', emissive: '#FFD700', emissiveIntensity: 1.2, metalness: 0.8, roughness: 0.2 }), []);

  useFrame((state) => {
    const g = useParadeGame.getState();
    const { totalFloats, getFloatSpeed } = g;
    const floatSpeed = getFloatSpeed();
    const elapsed = state.clock.elapsedTime;
    const count = Math.max(0, totalFloats || 0) * decorationsPerFloat;
    if (!meshRef.current) return;
    meshRef.current.count = count;

    let idx = 0;
    for (let fi = 0; fi < (totalFloats || 0); fi++) {
      const startZ = -30 - (fi * 10);
      const z = startZ + floatSpeed * elapsed; // same as ParadeFloat
      const floatX = 5; // lane 1 by default; floats in GameScene use lane 1
      const bobY = 1 + Math.sin(elapsed * 0.5) * 0.1;

      for (let d = 0; d < decorationsPerFloat; d++) {
        const rx = ( ( (fi * 13 + d * 37) % 1000 ) / 1000 - 0.5) * 1.5; // deterministic pseudo-random
        const ry = ((fi * 19 + d * 97) % 1000) / 1000 * 1.5 + 0.5;
        const rz = ((fi * 7 + d * 61) % 1000) / 1000 * 2 - 1;
        const scale = (((fi * 31 + d * 11) % 1000) / 1000) * 0.3 + 0.2;

        tempPos.set(floatX + rx, bobY + ry - 0.5, z + rz);
        tempQuat.setFromEuler(new THREE.Euler(0, 0, 0));
        tempScale.setScalar(scale);
        tempMatrix.compose(tempPos, tempQuat, tempScale);
        meshRef.current.setMatrixAt(idx, tempMatrix);
        idx++;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, 4096]} castShadow />
  );
}

