# BP EXPO Codebase Structure

> **Last Updated**: 2026-02-19
> **Purpose**: Canonical reference for all project locations to prevent editing wrong folders

---

## 🚨 CRITICAL: Canonical Locations

### Active/Live Projects

| Component | **LIVE LOCATION** | Status |
|-----------|-------------------|--------|
| **SPARKS-dev (Super App)** | `e:\Spark\SPARKS-dev\` | ✅ **MAIN PROJECT** |
| **Teacher Tools** | `e:\Spark\SPARKS-dev\public\teacher_tools\` | ✅ Active - Embedded in iframe |
| **Classroom Games** | `e:\Spark\SPARKS-dev\public\classroom_games\` | ✅ Active - Embedded in iframe |
| **BP-Hub** | `e:\Spark\BP-Hub\` | ✅ Production Website (bplabo.jp) |
| **BP Pay** | `e:\Spark\bp-pay\` | ✅ Standalone App |
| **Shared Data** | `e:\Spark\shared-data\` | ✅ Active - Pronunciation vocab |

### Build Sources

| Folder | Output Location | Notes |
|--------|-----------------|-------|
| `ALT_Classroom_Games/` | `SPARKS-dev/public/classroom_games/` | Edit here → `npm run build` |

---

## 🎯 Decision Tree: Where Should I Edit?

### 1. The Main App (Planner, Dashboard, Tango, Expo)
```
Am I editing Planner, Tango, or Discovery/Expo?
└─ YES → Use `SPARKS-dev/src/modules/`
```

### 2. Teacher Tools
```
Am I editing Teacher Tools HTML/JS/CSS?
├─ YES → Use `SPARKS-dev/public/teacher_tools/`
└─ NO  → You might be in the wrong folder
```

### 3. Classroom Games
```
Am I editing game logic (React components)?
├─ YES → Edit `ALT_Classroom_Games/src/`
│        Then run: npm run build
│        Output goes to: SPARKS-dev/public/classroom_games/
└─ NO  → Editing iframe integration?
         → Use `SPARKS-dev/src/modules/classroom_games/`
```

---

## 📂 Full Directory Map

```
e:\Spark\
│
├── SPARKS-dev/                  # 🌟 MAIN SUPER APP (Vite + React)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── planner/         # Lesson Planner
│   │   │   ├── discovery/       # BP Expo / World Map
│   │   │   ├── tango/           # BP Tango
│   │   │   ├── teacher_tools/   # Iframe wrapper for Tools
│   │   │   └── classroom_games/ # Iframe wrapper for Games
│   └── public/
│       ├── teacher_tools/       # ✅ LIVE Teacher Tools (HTML/JS/CSS)
│       └── classroom_games/     # ✅ Built output from ALT_Classroom_Games
│
├── ALT_Classroom_Games/         # React source for Classroom Games
│   ├── src/                     # Edit here for game logic
│   └── package.json             # Run `npm run build` after changes
│
├── BP-Hub/                      # Production Landing Page (bplabo.jp)
├── bp-pay/                      # Standalone BP Pay App
└── shared-data/                 # Shared pronunciation vocab data
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ WRONG: Editing `public/classroom_games/` React files
- **Why?** This is a build output folder
- **Fix**: Edit `ALT_Classroom_Games/src/` then rebuild

### ❌ WRONG: Looking for "Echo" or "Shout"
- **Status**: Removed. These features are no longer part of the core project.

---

## 🔧 Development Workflow

### Teacher Tools Changes
1. Edit files in `SPARKS-dev/public/teacher_tools/`
2. Refresh `http://localhost:5173/teacher-tools`

### Classroom Games Changes
1. Edit React files in `ALT_Classroom_Games/src/`
2. Run `npm run build` in `ALT_Classroom_Games/`
3. Output auto-copies to `SPARKS-dev/public/classroom_games/`
4. Refresh `http://localhost:5173/classroom-games`

### Super App Changes
1. Edit `SPARKS-dev/src/`
2. Vite auto-reloads
3. Done ✅
