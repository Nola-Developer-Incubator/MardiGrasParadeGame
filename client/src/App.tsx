import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";
import { GameScene } from "./components/game/GameScene";
import { GameUI } from "./components/game/GameUI";
import { WinScreen } from "./components/game/WinScreen";
import { AudioManager } from "./components/game/AudioManager";
import { AdRewardScreen } from "./components/game/AdRewardScreen";
import { Controls } from "./components/game/Player";

const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.back, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
];

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        <Canvas
          shadows
          camera={{
            position: [0, 4, 6],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance"
          }}
        >
          <color attach="background" args={["#0f0f1e"]} />
          
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
        </Canvas>
        
        <GameUI />
        <WinScreen />
        <AdRewardScreen />
        <AudioManager />
      </KeyboardControls>
    </div>
  );
}

export default App;
