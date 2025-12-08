import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * CanvasGuard: attach WebGL context lost/restore listeners to the canvas
 * and show a persistent DOM overlay when the context is lost so the user
 * isn't left with a white/blank canvas.
 */
export function CanvasGuard() {
  const { gl } = useThree();

  useEffect(() => {
    if (!gl || !gl.domElement) return;
    const canvas = gl.domElement as HTMLCanvasElement;

    const overlayId = 'webgl-context-overlay';

    function createOverlay(message: string) {
      let el = document.getElementById(overlayId) as HTMLDivElement | null;
      if (!el) {
        el = document.createElement('div');
        el.id = overlayId;
        el.style.position = 'fixed';
        el.style.left = '0';
        el.style.top = '0';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.zIndex = '9999999';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.pointerEvents = 'auto';
        el.style.background = 'rgba(0,0,0,0.7)';
        el.style.color = 'white';
        el.style.fontFamily = 'sans-serif';
        el.style.padding = '20px';
        el.style.boxSizing = 'border-box';

        const box = document.createElement('div');
        box.style.maxWidth = '760px';
        box.style.width = 'min(95%,760px)';
        box.style.background = 'rgba(0,0,0,0.85)';
        box.style.padding = '18px';
        box.style.borderRadius = '8px';
        box.style.boxShadow = '0 8px 32px rgba(0,0,0,0.7)';
        box.style.textAlign = 'left';

        const title = document.createElement('div');
        title.style.fontSize = '18px';
        title.style.fontWeight = '700';
        title.style.marginBottom = '8px';
        title.textContent = 'WebGL Context Lost';

        const body = document.createElement('div');
        body.style.fontSize = '13px';
        body.style.marginBottom = '12px';
        body.textContent = message;

        const btn = document.createElement('button');
        btn.textContent = 'Reload Page';
        btn.style.padding = '8px 12px';
        btn.style.borderRadius = '6px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.background = '#ffd700';
        btn.style.color = '#000';
        btn.style.fontWeight = '700';
        btn.onclick = () => window.location.reload();

        box.appendChild(title);
        box.appendChild(body);
        box.appendChild(btn);
        el.appendChild(box);
        document.body.appendChild(el);
      } else {
        el.style.display = 'flex';
        const body = el.querySelector('div > div:nth-child(2)');
        if (body) body.textContent = message;
      }
    }

    function removeOverlay() {
      const el = document.getElementById(overlayId);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function onContextLost(ev: Event) {
      try {
        ev.preventDefault();
      } catch {}
      console.error('[CanvasGuard] WebGL context lost', ev);
      createOverlay('The WebGL context was lost. This can happen when the GPU is overwhelmed. Click Reload Page to try again.');
    }

    function onContextRestored(ev: Event) {
      console.info('[CanvasGuard] WebGL context restored', ev);
      removeOverlay();
    }

    canvas.addEventListener('webglcontextlost', onContextLost as EventListener);
    canvas.addEventListener('webglcontextrestored', onContextRestored as EventListener);

    // cleanup
    return () => {
      try { canvas.removeEventListener('webglcontextlost', onContextLost as EventListener); } catch {}
      try { canvas.removeEventListener('webglcontextrestored', onContextRestored as EventListener); } catch {}
      removeOverlay();
    };
  }, [gl]);

  return null;
}

