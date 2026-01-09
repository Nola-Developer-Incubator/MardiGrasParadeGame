import React, { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { computeAvoidance } from '../../ai/avoidance'
import { useStore } from '../../store/useParadeStore'

// Simple spawn manager placeholder: spawns float positions and exposes them for avoidance
export function SpawnManager(){
  const floatsRef = useRef([])
  const [floats, setFloats] = useState(floatsRef.current)
  const playerPosRef = useRef({x:0,z:0})

  useEffect(()=>{
    const interval = setInterval(()=>{
      const floats = floatsRef.current
      if(Math.random() < 0.02 && floats.length < 20){
        floats.push({ x: (Math.random() - 0.5) * 12, z: (Math.random() - 0.5) * 30, id: Date.now()+Math.random() })
      }
      if(floats.length > 40) floats.splice(0, floats.length - 40)
    }, 500)
    return ()=> clearInterval(interval)
  }, [])

  useFrame(()=>{
    const floats = floatsRef.current
    const playerPos = useStore.getState().playerPosition || { x:0, z:0 }
    playerPosRef.current = playerPos
    for(const f of floats){
      const avoid = computeAvoidance(playerPosRef.current, [f], 1.2)
      f.x += (avoid.x * 0.02) + (Math.random() - 0.5) * 0.01
      f.z += (avoid.z * 0.02) + (Math.random() - 0.5) * 0.01
    }
    // throttle UI updates to ~5/sec
    const now = performance.now()
    if(!SpawnManager._lastUpdate || now - SpawnManager._lastUpdate > 180){
      SpawnManager._lastUpdate = now
      setFloats([...floatsRef.current])
    }
  })

  return (
    <group>
      {floats.map(f => (
        <mesh key={f.id} position={[f.x, 0.25, f.z]}>
          <sphereGeometry args={[0.28, 8, 8]} />
          <meshStandardMaterial color={'#f97316'} emissive={'#f97316'} emissiveIntensity={0.2} />
        </mesh>
      ))}
      {/* debug DOM */}
      <Html position={[0,0,0]}>
        <div id="mgp-debug" style={{display:'none'}} data-json={JSON.stringify({ floatsCount: floats.length, player: playerPosRef.current })}></div>
      </Html>
    </group>
  )
}

export default SpawnManager
