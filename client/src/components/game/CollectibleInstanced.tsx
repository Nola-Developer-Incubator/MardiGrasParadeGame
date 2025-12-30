import React, {useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {type Collectible as CollectibleType, useParadeGame} from '@/lib/stores/useParadeGame';

interface CollectibleInstancedProps {
  types: CollectibleType['type'][]; // e.g., ['beads','doubloon','cup']
  playerPosition: THREE.Vector3;
}

export function CollectibleInstanced({ types, playerPosition }: CollectibleInstancedProps) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);

  // Map of collectible id -> index within instances
  const indexById = useRef<Record<string, number>>({});
  const instances = useRef<{ id: string; position: THREE.Vector3; velocity: THREE.Vector3; type: CollectibleType['type']; onGroundStartTime: number | null }[]>([]);

  const { removeCollectible, updateCollectible, incrementMisses } = useParadeGame();

  // Static geometry/material memoized
  const geometry = useMemo(() => new THREE.SphereGeometry(0.25, 8, 8), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.2 }), []);

  // Sync instances with store each frame (lightweight)
  useFrame((state, delta) => {
    const storeCollectibles = useParadeGame.getState().collectibles;
    // Filter only requested types
    const relevant = storeCollectibles.filter((c) => types.includes(c.type));

    // Rebuild instances list if counts change or ids mismatch
    let changed = false;
    if (relevant.length !== instances.current.length) changed = true;
    else {
      for (let i = 0; i < relevant.length; i++) {
        if (instances.current[i]?.id !== relevant[i].id) { changed = true; break; }
      }
    }
    if (changed) {
      instances.current = relevant.map((c) => ({ id: c.id, position: c.position.clone(), velocity: c.velocity.clone(), type: c.type, onGroundStartTime: null }));
      indexById.current = {};
      instances.current.forEach((it, i) => indexById.current[it.id] = i);
    }

    // Physics and update per-instance
    const GRAVITY = -15;
    const CATCH_RADIUS = 2.0;
    const MIN_CATCH_HEIGHT = 0.5;
    const GROUND_PICKUP_WINDOW_MS = 1000;

    for (let i = 0; i < instances.current.length; i++) {
      const inst = instances.current[i];
      // apply gravity
      inst.velocity.y += GRAVITY * delta;
      inst.position.add(inst.velocity.clone().multiplyScalar(delta));

      // ground handling
      const isOnGround = inst.position.y <= 0.3;
      if (isOnGround) {
        inst.position.y = 0.3;
        if (inst.onGroundStartTime === null) inst.onGroundStartTime = Date.now();
        const timeOnGroundMs = Date.now() - (inst.onGroundStartTime || 0);
        if (timeOnGroundMs > 5000) {
          const isRegularItem = inst.type === 'beads' || inst.type === 'doubloon' || inst.type === 'cup';
          if (isRegularItem) incrementMisses();
          try { removeCollectible(inst.id); } catch (e) { /* ignore */ }
          // mark for removal by setting id to empty
          inst.id = '';
          continue;
        }

        // bounce/friction
        if (Math.abs(inst.velocity.y) > 0.5) inst.velocity.y = -inst.velocity.y * 0.4;
        else inst.velocity.y = 0;
        inst.velocity.x *= 0.9; inst.velocity.z *= 0.9;
      } else {
        inst.onGroundStartTime = null;
      }

      // Catch detection
      const distanceToPlayer = inst.position.distanceTo(playerPosition);
      const isAboveGround = inst.position.y >= MIN_CATCH_HEIGHT;
      const isInRange = distanceToPlayer < CATCH_RADIUS;
      const timeOnGround = inst.onGroundStartTime ? (Date.now() - inst.onGroundStartTime) : 0;
      const isGroundPickupWindow = inst.onGroundStartTime !== null && timeOnGround <= GROUND_PICKUP_WINDOW_MS;
      const isCatchable = isInRange && ((isAboveGround && inst.position.y < 2) || isGroundPickupWindow);

      if (isCatchable) {
        // auto-catch when very close
        if (distanceToPlayer < 0.8) {
          try {
            // Remove from store and handle catch via existing handlers in GameScene
            removeCollectible(inst.id);
          } catch (e) { /* ignore */ }
          inst.id = '';
          continue;
        }
      }

      // Write instance matrix
      if (meshRef.current && inst.id) {
        tempPos.copy(inst.position);
        tempQuat.setFromEuler(new THREE.Euler(0, state.clock.elapsedTime * 0.5, 0));
        tempScale.setScalar(inst.type === 'cup' ? 0.3 : 0.25);
        tempMatrix.compose(tempPos, tempQuat, tempScale);
        meshRef.current.setMatrixAt(i, tempMatrix);
        // Optionally set color via setColorAt if supported
      }

      // Update store positions for other systems that may read them
      updateCollectible(inst.id, { position: inst.position.clone(), velocity: inst.velocity.clone() });
    }

    // Cleanup removed instances
    instances.current = instances.current.filter((it) => it.id && it.id.length > 0);
    // Update count
    if (meshRef.current) {
      meshRef.current.count = instances.current.length;
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Render single instanced mesh for requested types (shared geometry)
  return (
    <instancedMesh ref={meshRef} args={[geometry, material, Math.max(1, Math.min(1000, useParadeGame.getState().collectibles.length))]} castShadow>
      {/* material color will be uniform; for per-type colors we could render one instancedMesh per type if needed */}
    </instancedMesh>
  );
}
