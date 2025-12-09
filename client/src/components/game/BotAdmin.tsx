import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Simple local-only bot admin modal — edits are saved to localStorage 'bots.override'
export function BotAdmin({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [bots, setBots] = useState<Array<any>>([]);
  useEffect(() => {
    if (!isOpen) return;
    // Load current runtime config
    import('@/lib/bots').then((m) => {
      const cfg = m.getBotsConfig();
      setBots(cfg.map((b: any) => ({ ...b })));
    });
  }, [isOpen]);

  const updateName = (index: number, value: string) => {
    setBots((prev) => prev.map((b, i) => i === index ? { ...b, name: value } : b));
  };

  const save = () => {
    try {
      localStorage.setItem('bots.override', JSON.stringify(bots));
      // Dispatch event so runtime hooks can reload
      try { window.dispatchEvent(new Event('bots:updated')); } catch (e) {}
      alert('Bot config saved locally (localStorage). Changes applied.');
      onClose();
    } catch (e) {
      alert('Failed to save config: ' + String(e));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
      <Card className="p-4 max-w-lg w-full mx-4">
        <h2 className="text-lg font-bold mb-2">Bot Admin (local only)</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {bots.map((b, i) => (
            <div key={b.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
              <div className="flex-1">
                <div className="text-xs text-gray-500">{b.id} • persona: {b.persona} • minLevel: {b.minLevel}</div>
                <input className="w-full p-1 border rounded bg-white/5 text-white" value={b.name} onChange={(e) => updateName(i, e.target.value)} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} size="sm" className="bg-gray-600">Cancel</Button>
          <Button onClick={save} size="sm" className="bg-green-600">Save (local)</Button>
        </div>
      </Card>
    </div>
  );
}
