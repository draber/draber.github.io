# 📦 Spelling Bee Assistant 5.0
**Release Date:** 18 April 2025  
*A full structural refactor, major UI cleanup, and a ton of long-overdue debt deletion.*

---

## ✨ Features & Improvements

### 🔹 New or Improved Stuff in the UI
- Introduced **Keyboard Shortcuts** for just about everything
- Replaced **Your Progress** with the more advanced **Milestones**
- **Dark Mode** and **Color Themes** now share a unified screen with live previews
- Cleaned up the **Main Menu**: fewer entries, larger font, better accessibility
- Numerous **Dark Mode** CSS improvements and visual polish throughout

### 🔧 Under the Hood
- Complete overhaul of table generation — tables are no longer tied to specific plugins
- All legacy `TablePane` components replaced with modular `TableBuilder`
- Clean separation between UI elements and logic (especially for details, popups, and layout)
- `Popup` logic migrated to the new `PopupBuilder` class
- **Dark Mode** now features automatic conflict detection (disables itself when other themes are detected)
- Strings, helpers, and utility functions have been consolidated for better maintainability
