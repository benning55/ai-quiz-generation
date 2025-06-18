const fs = require('fs');
const path = require('path');

// Create a beautiful SVG icon that matches the CanCitizenTest brand
const createSVGIcon = (size) => {
  const strokeWidth = Math.max(2, size * 0.02);
  const fontSize = size * 0.25;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background circle with gradient -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - strokeWidth}" fill="url(#bgGradient)" stroke="#ffffff" stroke-width="${strokeWidth}" filter="url(#shadow)"/>
  
  <!-- Maple leaf -->
  <g transform="translate(${size/2}, ${size/2}) scale(${size * 0.0008})">
    <path d="M0,-50 C-15,-35 -25,-20 -25,0 C-25,20 -15,35 0,50 C15,35 25,20 25,0 C25,-20 15,-35 0,-50 Z" 
          fill="url(#leafGradient)" stroke="#ffffff" stroke-width="3"/>
    <path d="M-15,-25 L-15,25 M15,-25 L15,25 M-25,0 L25,0" 
          stroke="#ffffff" stroke-width="2" opacity="0.8"/>
  </g>
  
  <!-- Text "CC" for CanCitizenTest -->
  <text x="50%" y="75%" text-anchor="middle" fill="white" 
        font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" 
        opacity="0.9" filter="url(#shadow)">
    CC
  </text>
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