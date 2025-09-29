#!/usr/bin/env node
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

async function optimizeFavicon() {
  const inputImage = 'attached_assets/apple-touch-icon_1759178677451.png';
  const outputDir = 'client/public';
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    console.log('🎨 Optimizing favicon images...');

    // Generate favicon-16x16.png (16x16, optimized for browser tabs)
    await sharp(inputImage)
      .resize(16, 16)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('✅ Generated favicon-16x16.png');

    // Generate favicon-32x32.png (32x32, high DPI displays)
    await sharp(inputImage)
      .resize(32, 32)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('✅ Generated favicon-32x32.png');

    // Generate favicon.png (32x32, default fallback)
    await sharp(inputImage)
      .resize(32, 32)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'favicon.png'));
    console.log('✅ Generated favicon.png (32x32 optimized)');

    // Generate apple-touch-icon.png (180x180, for iOS devices)
    await sharp(inputImage)
      .resize(180, 180)
      .png({ quality: 85, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('✅ Generated apple-touch-icon.png');

    // Get file sizes for verification
    const files = [
      'favicon-16x16.png',
      'favicon-32x32.png', 
      'favicon.png',
      'apple-touch-icon.png'
    ];

    console.log('\n📊 File sizes:');
    let totalSize = 0;
    for (const file of files) {
      const filePath = path.join(outputDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`  ${file}: ${sizeKB} KB`);
        totalSize += stats.size;
      }
    }
    
    const totalKB = (totalSize / 1024).toFixed(1);
    console.log(`\n🎯 Total size: ${totalKB} KB (previously ~22MB)`);
    console.log('\n🚀 Favicon optimization complete! All files are ready for production.');

  } catch (error) {
    console.error('❌ Error optimizing favicon:', error);
    process.exit(1);
  }
}

// Run the optimization
optimizeFavicon();