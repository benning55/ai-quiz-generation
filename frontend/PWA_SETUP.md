# PWA Setup for CanCitizenTest

This project has been configured as a Progressive Web App (PWA) that can be installed on mobile devices and desktops.

## Features Implemented

### ✅ PWA Manifest
- Custom app name: "CanCitizenTest - Canadian Citizenship Practice"
- Short name: "CanCitizenTest"
- Theme color: Red (#dc2626)
- Display mode: Standalone (app-like experience)
- Icons for various screen sizes

### ✅ Service Worker
- Caches essential resources for offline access
- Handles app updates and cache management
- Provides offline functionality

### ✅ iPhone Home Screen Support
- Apple-specific meta tags for iOS compatibility
- Custom app icons and splash screens
- Proper viewport settings for mobile devices

## Files Added/Modified

1. **`public/manifest.json`** - PWA manifest configuration
2. **`public/sw.js`** - Service worker for caching and offline support
3. **`src/app/layout.tsx`** - Updated with PWA meta tags and service worker registration
4. **`public/icons/`** - Directory containing app icons in various sizes

## Customization

### App Icons
The current icons are placeholders. To create proper icons:

1. **Use online tools:**
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [Favicon Generator](https://www.favicon-generator.org/)

2. **Replace the PNG files** in `public/icons/` with your custom icons

3. **Recommended icon sizes:**
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### App Name & Colors
Edit `public/manifest.json` to customize:
- `name` - Full app name
- `short_name` - Short name for home screen
- `theme_color` - App theme color
- `background_color` - Splash screen background

### Service Worker
Modify `public/sw.js` to:
- Add more resources to cache
- Implement custom offline strategies
- Add push notification support

## Testing PWA

### Desktop (Chrome)
1. Open the app in Chrome
2. Click the install icon in the address bar
3. Or go to Chrome menu → "Install CanCitizenTest"

### Mobile (iOS)
1. Open the app in Safari
2. Tap the share button
3. Select "Add to Home Screen"
4. The app will appear with the custom icon

### Mobile (Android)
1. Open the app in Chrome
2. Tap the menu → "Add to Home screen"
3. Or use the install prompt if available

## Browser Support

- ✅ Chrome/Edge (full PWA support)
- ✅ Safari (basic PWA support, home screen installation)
- ✅ Firefox (full PWA support)
- ⚠️ Some older browsers may have limited support

## Next Steps

1. **Create custom icons** using the recommended tools
2. **Test on various devices** to ensure proper display
3. **Add offline functionality** specific to your app needs
4. **Consider adding push notifications** for user engagement
5. **Optimize performance** for mobile devices

## Troubleshooting

### Icons not showing
- Ensure all icon files exist in `public/icons/`
- Check that paths in `manifest.json` are correct
- Clear browser cache and reinstall the PWA

### Service worker not registering
- Check browser console for errors
- Ensure HTTPS is used in production
- Verify the service worker file is accessible

### App not installing
- Check that all required manifest properties are present
- Ensure the app meets PWA criteria (HTTPS, valid manifest, service worker)
- Test in different browsers and devices 