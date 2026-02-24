#!/usr/bin/env node

/**
 * Simple PWA Icon Generator
 * Generates placeholder icons for the Arabic Learning App
 * 
 * Note: For production, use a proper icon design tool or service like:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 */

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';

console.log('🎨 Generating PWA icons...\n');

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

sizes.forEach(({ name, size }) => {
  try {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background gradient (gold to dark green)
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#D4AF37'); // Gold
    gradient.addColorStop(1, '#0F5A3E'); // Dark green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Arabic letter ع (Ayn) in white
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ع', size / 2, size / 2);

    // Save to public directory
    const buffer = canvas.toBuffer('image/png');
    const outputPath = join('public', name);
    writeFileSync(outputPath, buffer);
    
    console.log(`✅ Generated: ${name} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Failed to generate ${name}:`, error.message);
  }
});

// Generate favicon (32x32)
try {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 32, 32);
  gradient.addColorStop(0, '#D4AF37');
  gradient.addColorStop(1, '#0F5A3E');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  ctx.fillStyle = 'white';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ع', 16, 16);

  const buffer = canvas.toBuffer('image/png');
  writeFileSync(join('public', 'favicon.ico'), buffer);
  
  console.log('✅ Generated: favicon.ico (32x32)');
} catch (error) {
  console.error('❌ Failed to generate favicon:', error.message);
}

console.log('\n🎉 Icon generation complete!');
console.log('\n📝 Note: These are placeholder icons.');
console.log('   For production, create professional icons using:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://www.pwabuilder.com/imageGenerator\n');
