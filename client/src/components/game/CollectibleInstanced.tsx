import React, {useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {type Collectible as CollectibleType, useParadeGame} from '@/lib/stores/useParadeGame';

interface CollectibleInstancedProps {
  types: CollectibleType['type'][]; // e.g., ['beads','doubloon','cup']
  playerPosition: THREE.Vector3;
}

type InstanceState = {
  id: string;
  type: CollectibleType['type'];
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  onGroundStartTime: number | null;
};

export function CollectibleInstanced({ types, playerPosition }: CollectibleInstancedProps) {
  const typesList = ['beads', 'doubloon', 'cup'] as const;
  const perTypeRefs = useRef<Record<string, THREE.InstancedMesh | null>>({});
  const instances = useRef<InstanceState[]>([]);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);

  const store = useParadeGame.getState();
  const removeCollectible = useParadeGame((s) => s.removeCollectible);
  const updateCollectible = useParadeGame((s) => s.updateCollectible);
  const incrementMisses = useParadeGame((s) => s.incrementMisses);
  const addCatch = useParadeGame((s) => s.addCatch);

  // Make instanced collectibles substantially larger and smoother for accessibility
  const geometry = useMemo(() => new THREE.SphereGeometry(0.45, 12, 12), []);
  const materials = useMemo(() => ({
    beads: new THREE.MeshStandardMaterial({ color: '#9b59b6', metalness: 0.6, roughness: 0.2 }),
    doubloon: new THREE.MeshStandardMaterial({ color: '#f1c40f', metalness: 0.9, roughness: 0.15 }),
    cup: new THREE.MeshStandardMaterial({ color: '#e74c3c', metalness: 0.4, roughness: 0.35 }),
  }), []);

  useFrame((state, delta) => {
    // Sync instances array with store collectibles for the requested types
    const storeCollectibles = useParadeGame.getState().collectibles.filter(c => (types as string[]).includes(c.type));
    const storeIds = new Set(storeCollectibles.map(c => c.id));

    // Remove instances that no longer exist in store
    instances.current = instances.current.filter(inst => storeIds.has(inst.id));

    // Add new instances from store that are missing locally
    for (const c of storeCollectibles) {
      if (!instances.current.some((i) => i.id === c.id)) {
        instances.current.push({
          id: c.id,
          type: c.type,
          position: c.position.clone(),
          velocity: c.velocity.clone(),
          onGroundStartTime: null,
        });
      }
    }

    // Physics constants (match Collectible.tsx)
    const GRAVITY = -15;
    const CATCH_RADIUS = 2.0;
    const MIN_CATCH_HEIGHT = 0.5;
    const GROUND_PICKUP_WINDOW_MS = 1000;

    // Per-type lists for writing instance matrices
    const perTypeLists: Record<string, InstanceState[]> = { beads: [], doubloon: [], cup: [] };

    // Helper bots value
    const helperBots = useParadeGame.getState().helperBots || 0;

    for (let i = instances.current.length - 1; i >= 0; i--) {
      const inst = instances.current[i];

      // Apply gravity
      inst.velocity.y += GRAVITY * delta;

      // Helper bot attraction
      if (helperBots > 0) {
        const attractRadius = 6 + helperBots * 2;
        const toPlayer = new THREE.Vector3().subVectors(playerPosition, inst.position);
        const distance = toPlayer.length();
        if (distance < attractRadius) {
          const strength = 4 * helperBots * Math.max(0, 1 - distance / attractRadius);
          const accel = toPlayer.normalize().multiplyScalar(strength * delta);
          inst.velocity.add(accel);
          const maxSpeed = 8;
          if (inst.velocity.length() > maxSpeed) inst.velocity.setLength(maxSpeed);
        }
      }

      // Update position
      inst.position.add(inst.velocity.clone().multiplyScalar(delta));

      // Ground handling
      const isOnGround = inst.position.y <= 0.3;
      if (isOnGround) {
        inst.position.y = 0.3;
        if (inst.onGroundStartTime === null) inst.onGroundStartTime = Date.now();

        const timeOnGroundMs = Date.now() - (inst.onGroundStartTime || 0);
        if (timeOnGroundMs > 5000) {
          // if regular item, increment misses
          const isRegularItem = inst.type === 'beads' || inst.type === 'doubloon' || inst.type === 'cup';
          if (isRegularItem) incrementMisses();
          try { removeCollectible(inst.id); } catch { }
          instances.current.splice(i, 1);
          continue;
        }

        // Bounce with energy loss
        if (Math.abs(inst.velocity.y) > 0.5) inst.velocity.y = -inst.velocity.y * 0.4;
        else inst.velocity.y = 0;
        inst.velocity.x *= 0.9; inst.velocity.z *= 0.9;
      } else {
        inst.onGroundStartTime = null;
      }

      // Catch detection (either in air above min height but below 2, or ground pickup window)
      const distanceToPlayer = inst.position.distanceTo(playerPosition);
      const isAboveGroundCatchable = inst.position.y >= MIN_CATCH_HEIGHT && inst.position.y < 2;
      const timeOnGround = inst.onGroundStartTime ? (Date.now() - inst.onGroundStartTime) : 0;
      const isGroundPickupWindow = inst.onGroundStartTime !== null && timeOnGround <= GROUND_PICKUP_WINDOW_MS;
      const isInRange = distanceToPlayer < CATCH_RADIUS;
      const isCatchable = isInRange && (isAboveGroundCatchable || isGroundPickupWindow);

      if (isCatchable) {
        // Highlight/scale handled in visuals; here we perform immediate catch when very close
        if (distanceToPlayer < 0.8) {
          // add catch via store
          try {
            addCatch(inst.type);
          } catch (e) { /* ignore */ }
          try { removeCollectible(inst.id); } catch { }
          instances.current.splice(i, 1);
          continue;
        }
      }

      // Collect into per-type list for instancing
      if (perTypeLists[inst.type]) perTypeLists[inst.type].push(inst);

      // Sync back to store for other systems
      try { updateCollectible(inst.id, { position: inst.position.clone(), velocity: inst.velocity.clone() }); } catch { }
    }

    // Write instance matrices per type
    for (const t of typesList) {
      const mesh = perTypeRefs.current[t];
      const list = perTypeLists[t] || [];
      if (!mesh) continue;
      mesh.count = list.length;
      for (let i = 0; i < list.length; i++) {
        const inst = list[i];
        tempPos.copy(inst.position);
        tempQuat.setFromEuler(new THREE.Euler(0, state.clock.elapsedTime * 0.5, 0));
        // Larger scales: cups slightly bigger than beads/doubloons for clarity
        tempScale.setScalar(inst.type === 'cup' ? 0.5 : 0.45);
        tempMatrix.compose(tempPos, tempQuat, tempScale);
        mesh.setMatrixAt(i, tempMatrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={(r) => (perTypeRefs.current['beads'] = r)} args={[geometry, materials['beads'], 1024]} castShadow />
      <instancedMesh ref={(r) => (perTypeRefs.current['doubloon'] = r)} args={[geometry, materials['doubloon'], 1024]} castShadow />
      <instancedMesh ref={(r) => (perTypeRefs.current['cup'] = r)} args={[geometry, materials['cup'], 1024]} castShadow />
    </>
  );
}
