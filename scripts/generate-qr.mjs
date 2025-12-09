import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

const url = process.env.URL || 'http://localhost:5000';
const svgPath = path.resolve(process.cwd(), 'docs', 'browser-qr.svg');

(async () => {
  try {
    // Print ASCII QR to terminal
    const ascii = await QRCode.toString(url, { type: 'terminal' });
    console.log(ascii);

    // Ensure docs directory exists
    const docsDir = path.dirname(svgPath);
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

    // Generate SVG file
    const svg = await QRCode.toString(url, { type: 'svg' });
    fs.writeFileSync(svgPath, svg, 'utf8');
    console.log(`Wrote SVG QR code to ${svgPath}`);

    // Also print instructions
    console.log(`Scan the QR code above (or open ${url}) on your mobile device to connect to the dev server.`);
  } catch (err) {
    console.error('Failed to generate QR code', err);
    process.exit(1);
  }
})();
