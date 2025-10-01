const fs = require('fs');
const path = require('path');

// Create a beautiful SVG icon with unique branding for CanCitizenTest
const createSVGIcon = (size) => {
  const strokeWidth = Math.max(2, size * 0.015);
  const padding = size * 0.22; // 22% padding for better composition
  const leafSize = size - (padding * 2);
  const fontSize = size * 0.35; // Larger, more prominent text
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow-${size}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${size * 0.01}"/>
      <feOffset dx="0" dy="${size * 0.01}" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bgGradient-${size})"/>
  
  <!-- Maple leaf - positioned in upper portion -->
  <g transform="translate(${size * 0.3}, ${size * 0.12}) scale(${size * 0.0008})" opacity="0.95" filter="url(#shadow-${size})">
    <path fill="#ffffff" d="M383.8 351.7c2.5-2.5 105.2-92.4 105.2-92.4l-17.5-7.5c-10-4.9-7.4-11.5-5-17.4 2.4-7.6 20.1-67.3 20.1-67.3s-47.7 10-57.7 12.5c-7.5 2.4-10-2.5-12.5-7.5s-15-32.4-15-32.4-52.6 59.9-55.1 62.3c-10 7.5-20.1 0-17.6-10 0-10 27.6-129.6 27.6-129.6s-30.1 17.4-40.1 22.4c-7.5 5-12.6 5-17.6-5C293.5 72.3 255.9 0 255.9 0s-37.5 72.3-42.5 79.8c-5 10-10 10-17.6 5-10-5-40.1-22.4-40.1-22.4S183.3 182 183.3 192c2.5 10-7.5 17.5-17.6 10-2.5-2.5-55.1-62.3-55.1-62.3S98.1 167 95.6 172s-5 9.9-12.5 7.5C73 177 25.4 167 25.4 167s17.6 59.7 20.1 67.3c2.4 6 5 12.5-5 17.4L23 259.3s102.6 89.9 105.2 92.4c5.1 5 10 7.5 5.1 22.5-5.1 15-10.1 35.1-10.1 35.1s95.2-20.1 105.3-22.6c8.7-.9 18.3 2.5 18.3 12.5S241 512 241 512h30s-5.8-102.7-5.8-112.8 9.5-13.4 18.4-12.5c10 2.5 105.2 22.6 105.2 22.6s-5-20.1-10-35.1 0-17.5 5-22.5z"/>
  </g>
  
  <!-- Brand Text "CCT" - Bold and centered in lower portion -->
  <text x="50%" y="${size * 0.78}" 
        text-anchor="middle" 
        dominant-baseline="middle"
        fill="#ffffff" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="${fontSize}" 
        font-weight="900" 
        letter-spacing="${size * 0.015}"
        filter="url(#shadow-${size})">CCT</text>
</svg>`;
};

// Create a more sophisticated PNG placeholder with better instructions
const createPNGPlaceholder = (size) => {
  return `# CanCitizenTest Icon - ${size}x${size}
# 
# This is a placeholder for the ${size}x${size} PWA icon.
# 
# Design Guidelines:
# - Primary color: Red gradient (#dc2626 to #b91c1c)
# - Accent color: Yellow/Amber (#fbbf24 to #f59e0b) for maple leaf
# - White text and borders for contrast
# - Canadian maple leaf as the main symbol
# - "CC" text for CanCitizenTest branding
# 
# To create the actual icon:
# 1. Use the SVG version as a reference: icon-${size}x${size}.svg
# 2. Convert to PNG using:
#    - Online tools: realfavicongenerator.net
#    - Design software: Figma, Adobe Illustrator, Sketch
#    - Command line: ImageMagick, Inkscape
# 3. Ensure the PNG has transparent background
# 4. Test on various devices to ensure good visibility
# 
# The icon should represent:
# - Canadian citizenship theme
# - Professional, trustworthy appearance
# - Good contrast for small sizes
# - Consistent with website branding`;
};

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Creating CanCitizenTest PWA icons...\n');

// Create beautiful icons for each size
iconSizes.forEach(size => {
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // Create SVG version with beautiful design
  fs.writeFileSync(svgPath, createSVGIcon(size));
  
  // Create PNG placeholder with detailed instructions
  fs.writeFileSync(pngPath, createPNGPlaceholder(size));
  
  console.log(`✅ Created icon-${size}x${size}.svg (beautiful design)`);
  console.log(`📝 Created icon-${size}x${size}.png (placeholder with instructions)`);
});

console.log('\n🎉 PWA icons created successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Open the SVG files to see the beautiful design');
console.log('2. Use online tools like realfavicongenerator.net to convert SVGs to PNGs');
console.log('3. Or use design software to create custom PNG versions');
console.log('4. Test the icons on various devices');
console.log('\n🎨 Design Features:');
console.log('- Red gradient background matching your brand');
console.log('- Canadian maple leaf in amber/yellow');
console.log('- "CC" text for CanCitizenTest branding');
console.log('- Professional shadows and styling');
console.log('- Consistent with your website theme'); 