import fs from 'fs';
import path from 'path';

function copyTexture(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log('Copied texture', src, '->', dest);
  } catch (e) {
    console.warn('Could not copy texture', e.message);
  }
}

function writeWavSilent(filePath, durationSeconds = 0.5) {
  // 16-bit PCM, mono, 22050 Hz
  const sampleRate = 22050;
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;

  const dataBuffer = Buffer.alloc(numSamples * 2); // silence

  const header = Buffer.alloc(44);
  header.write('RIFF', 0); // ChunkID
  header.writeUInt32LE(36 + dataBuffer.length, 4); // ChunkSize
  header.write('WAVE', 8); // Format
  header.write('fmt ', 12); // Subchunk1ID
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // AudioFormat PCM
  header.writeUInt16LE(numChannels, 22); // NumChannels
  header.writeUInt32LE(sampleRate, 24); // SampleRate
  header.writeUInt32LE(byteRate, 28); // ByteRate
  header.writeUInt16LE(blockAlign, 32); // BlockAlign
  header.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
  header.write('data', 36); // Subchunk2ID
  header.writeUInt32LE(dataBuffer.length, 40); // Subchunk2Size

  const out = Buffer.concat([header, dataBuffer]);
  fs.writeFileSync(filePath, out);
  console.log('Wrote silent wav to', filePath);
}

(function main() {
  const base = path.join(process.cwd(), 'client', 'public');
  const texturesDir = path.join(base, 'textures');
  const soundsDir = path.join(base, 'sounds');
  try { fs.mkdirSync(soundsDir, { recursive: true }); } catch {}

  const sand = path.join(texturesDir, 'sand.jpg');
  const asphalt = path.join(texturesDir, 'asphalt.png');
  if (fs.existsSync(sand) && !fs.existsSync(asphalt)) {
    copyTexture(sand, asphalt);
  }

  const bg = path.join(soundsDir, 'background.mp3');
  const hit = path.join(soundsDir, 'hit.mp3');
  const success = path.join(soundsDir, 'success.mp3');

  // write WAV files with .mp3 extension to satisfy references (browsers will still attempt to decode)
  writeWavSilent(bg, 1.0);
  writeWavSilent(hit, 0.2);
  writeWavSilent(success, 0.2);
})();

