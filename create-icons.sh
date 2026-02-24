#!/bin/bash

# Simple PWA Icon Creator for Arabic Learning App
# Creates placeholder icons using ImageMagick (if available)

echo "🎨 Creating PWA icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Installing placeholder icons..."
    echo ""
    echo "📝 Manual steps to create icons:"
    echo "1. Visit https://realfavicongenerator.net/"
    echo "2. Upload a 512x512 image with your app logo"
    echo "3. Download the generated icons"
    echo "4. Place them in the public/ directory:"
    echo "   - pwa-192x192.png"
    echo "   - pwa-512x512.png"
    echo "   - apple-touch-icon.png"
    echo "   - favicon.ico"
    echo ""
    echo "For now, creating simple placeholder files..."
    
    # Create placeholder files (empty PNGs)
    touch public/pwa-192x192.png
    touch public/pwa-512x512.png
    touch public/apple-touch-icon.png
    touch public/favicon.ico
    
    echo "✅ Placeholder files created"
    echo "⚠️  Replace these with real icons before production launch!"
    exit 0
fi

# Create icons using ImageMagick
echo "✅ ImageMagick found. Generating icons..."

# Create a simple icon with gradient background and Arabic letter
for size in 192 512 180; do
    name="pwa-${size}x${size}.png"
    if [ $size -eq 180 ]; then
        name="apple-touch-icon.png"
    fi
    
    convert -size ${size}x${size} \
        gradient:'#D4AF37-#0F5A3E' \
        -gravity center \
        -pointsize $((size * 6 / 10)) \
        -font Arial-Bold \
        -fill white \
        -annotate +0+0 'ع' \
        "public/$name"
    
    echo "✅ Created: $name"
done

# Create favicon
convert -size 32x32 \
    gradient:'#D4AF37-#0F5A3E' \
    -gravity center \
    -pointsize 20 \
    -font Arial-Bold \
    -fill white \
    -annotate +0+0 'ع' \
    public/favicon.ico

echo "✅ Created: favicon.ico"
echo ""
echo "🎉 Icon generation complete!"
echo ""
echo "📝 Note: These are placeholder icons."
echo "   For production, create professional icons at:"
echo "   https://realfavicongenerator.net/"
