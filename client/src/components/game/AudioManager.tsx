import {useEffect} from "react";
import {useAudio} from "@/lib/stores/useAudio";
import {useParadeGame} from "@/lib/stores/useParadeGame";
import {Howl} from 'howler';

function getAssetBase() {
  const env = (import.meta as any).env || {};
  const base = env.VITE_ASSET_BASE_URL ?? env.BASE_URL ?? '';
  return String(base || '');
}

function joinAsset(base: string, path: string) {
  const b = base ? String(base).replace(/\/+$|\s+$/g, '') : '';
  const p = String(path).replace(/^\/+/, '');
  if (!b) return `/${p}`; // preserve original leading slash behavior
  return `${b.replace(/\/$/, '')}/${p}`;
}

async function exists(url: string) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export function AudioManager() {
  const { setBackgroundMusic, setHitSound, setSuccessSound, isMuted } = useAudio();
  const { phase } = useParadeGame();

  useEffect(() => {
    let bg: Howl | undefined;
    let hit: Howl | undefined;
    let success: Howl | undefined;

    (async () => {
      const assetBase = getAssetBase();
      const bgPath = joinAsset(assetBase, 'sounds/background.mp3');
      const hitPath = joinAsset(assetBase, 'sounds/hit.mp3');
      const successPath = joinAsset(assetBase, 'sounds/success.mp3');

      if (await exists(bgPath)) {
        try {
          bg = new Howl({ src: [bgPath], loop: true, volume: 0.3 });
          setBackgroundMusic(bg);
        } catch (e) {
          console.warn('Failed to initialize background music', e);
        }
      }

      if (await exists(hitPath)) {
        try {
          hit = new Howl({ src: [hitPath], volume: 0.3 });
          setHitSound(hit);
        } catch (e) {
          console.warn('Failed to initialize hit sound', e);
        }
      }

      if (await exists(successPath)) {
        try {
          success = new Howl({ src: [successPath], volume: 0.5 });
          setSuccessSound(success);
        } catch (e) {
          console.warn('Failed to initialize success sound', e);
        }
      }

      // try to unlock audio by playing a short silent buffer on user gesture
      const unlock = () => {
        try {
          if (bg) {
            bg.once('play', () => {});
            if (!isMuted) {
              bg.play();
              bg.pause();
            }
          }
        } catch (e) {
          console.warn('Attempted to unlock Howler audio via user gesture');
        }
      };

      window.addEventListener('pointerdown', unlock, { once: true });

    })();

    return () => {
      try { bg?.unload(); } catch { /* ignore */ }
      try { hit?.unload(); } catch { /* ignore */ }
      try { success?.unload(); } catch { /* ignore */ }
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  // Handle background music based on game phase
  useEffect(() => {
    const { backgroundMusic } = useAudio.getState();
    if (!backgroundMusic) return;

    if (phase === 'playing' && !isMuted) {
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
  }, [phase, isMuted]);

  return null;
}
