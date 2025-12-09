// Runtime bot config loader — reads local override from localStorage (for local admin edits)
// Fallback to bundled JSON in client/src/config/bots.json

export function getBotsConfig(): Array<any> {
  if (typeof window !== 'undefined') {
    try {
      const override = localStorage.getItem('bots.override');
      if (override) {
        const parsed = JSON.parse(override);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read bots.override from localStorage', e);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bundled = require('@/config/bots.json');
  return bundled;
}

