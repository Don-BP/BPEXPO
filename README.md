# BP EXPO Hub - Multi-App Architecture Guide

## Overview
This is a hub system for hosting multiple educational web apps under the bplabo.jp domain. Each app is a separate project that can be developed independently and deployed together.

## Current Structure
```
d:/BP EXPO - V4 copy/
├── index.html              # Main hub page
├── bp-global-discovery/    # BP EXPO app (Vite/React)
├── [future-app-1]/        # Placeholder for next app
├── [future-app-2]/        # Placeholder for next app
└── README.md              # This file
```

## Adding New Apps

### Method 1: Copy Existing Projects (Recommended)
1. **Copy your new project folder** into this directory
2. **Update the hub page** (`index.html`) to add a new button
3. **Test locally** with the Python server
4. **Deploy all folders** together to bplabo.jp

### Method 2: Create New Projects
1. **Create new project folder** in this directory
2. **Develop independently** (can use any framework: React, Vue, vanilla HTML, etc.)
3. **Update hub page** with new button linking to your app

## Hub Page Updates
To add a new app to the hub, edit `index.html`:

```html
<a href="[your-app-folder]/index.html" class="app-button">
    <div class="app-icon">🎯</div>
    <div class="app-title">Your App Name</div>
    <div class="app-description">
        Description of your new educational app.
    </div>
</a>
```

## Local Development

### For the Hub:
```bash
cd d:/BP EXPO - V4 copy
python -m http.server 8000
# Access at http://localhost:8000
```

### For Individual Apps:
```bash
cd bp-global-discovery
npm run dev
# Access at http://localhost:5173
```

## Production Deployment to bplabo.jp

### Option 1: Upload All Folders
1. Upload entire `d:/BP EXPO - V4 copy/` directory
2. Structure on server:
   ```
   bplabo.jp/
   ├── index.html
   ├── bp-global-discovery/
   ├── app2/
   ├── app3/
   └── ...
   ```

### Option 2: Build and Deploy
1. **Build each app** (if using frameworks):
   ```bash
   cd bp-global-discovery
   npm run build
   # This creates dist/ folder
   ```
2. **Upload built files** to organized folders
3. **Update hub links** to point to built versions

## Best Practices

### Folder Naming
- Use lowercase with hyphens: `science-explorer`, `history-timeline`
- Keep names short but descriptive

### Link Management
- Use relative paths for local development
- Use absolute paths for production: `https://bplabo.jp/app-name/`

### Development Workflow
1. **Develop each app separately** in its own folder
2. **Test integration** using the hub page
3. **Build production versions** when ready
4. **Deploy all apps together** to maintain the hub structure

## Future App Ideas
- Science Explorer (interactive experiments)
- History Timeline (chronological exploration)
- Art Gallery (famous artworks + creation tools)
- Math Games (educational games)
- Language Learning (vocabulary and phrases)

## Technical Notes
- Each app can use different technologies
- The hub page is vanilla HTML/CSS for maximum compatibility
- All apps share the same domain but are isolated in folders
- No complex routing needed - simple folder-based structure