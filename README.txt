LinaHub v5.2 — clean full GitHub upload

Upload ALL files and folders from this package to the root of the LinaHub repository.

Required root items:
- index.html
- app.js
- manifest.webmanifest
- sw.js
- README.txt
- core/
- pages/
- styles/
- icons/

GitHub Pages:
- Source: Deploy from a branch
- Branch: main
- Folder: / (root)

This build includes:
- Modular tabs
- Permanent data key: linahub-data
- Legacy v4 migration
- Clickable Today's shortcuts
- Working plant profiles
- Journal with no default emoji selection
- Pain order: Very severe to No pain
- Readable dark-mode journal buttons
- Light-purple selected states
- Touch and mouse journal reordering
- Hide/show cards
- Filters
- Backup export/import


v7.0 Enchanted Edition:
- Rich galaxy/glass visual redesign
- Sliding page transitions
- Plant profile Back returns to Plants
- Weight & Measurements save and show current time
- Full Aquariums module with residents, temperature, feeds and maintenance logs


v8.0 Enchanted Sakura Edition:
- Dreamy sakura, lavender, crystal-blue and golden visual theme
- Falling cherry blossoms only in Plants
- Rising water bubbles only in Aquariums
- Optional uploaded pictures for every Home tab
- Uploaded tab pictures are resized and retained in LinaHub backup
- All existing modules, data, aquarium feed logic and tracking retained

v8.1:
- Fixed Journal drag-and-drop layout persistence
- Layout now saves while cards move, when released, and when leaving Edit layout
- Added mobile-safe release handling

v8.2:
- Restored a deep midnight background in dark mode
- Made dark-mode tiles lighter than the background for stronger contrast
- Kept Sakura light mode unchanged
- Kept all features, data, Journal layout fix, Plants petals and Aquarium bubbles

v8.3:
- Fixed Aquariums opening reliably and restored cached aquarium assets/bubbles
- Added true navigation history and left-edge swipe back
- Redesigned Plants as two-column Home-style tiles
- Added a Plants hero with cherry blossom decoration and falling petals
- Added uploadable wide banner pictures for each module

v8.4:
- Rebuilt navigation using one reliable delegated click handler
- Fixed Home Plants and Aquariums tiles
- Fixed plant and tank profile tiles
- Fixed every Back button
- Fixed left-edge swipe-back with true page history
- Changed module banners to safe image elements so uploaded pictures cannot break page markup
- Preserved Plants tiles, blossoms, Aquariums, bubbles, banners, dark theme, and Journal layout saving

v8.5:
- Replaced the glitchy swipe-back animation with a smoother compositor-based transition
- Removed the double animation after a swipe completes
- Added a gentle page reveal while swiping
- Added a smooth exit animation to normal Back buttons
- Added cleaner snap-back when a swipe is cancelled

v8.6:
- Rebuilt the To-do interactions so add, energy selection, complete, undo, delete and clear all work reliably
- Fixed older tasks whose IDs were stored as numbers
- Preserved existing tasks and normalized older task formats
- Added Enter-to-add from the task title field
- Corrected the service-worker version so the newest JavaScript is loaded instead of an older cached copy

v8.7:
- Fixed Home tile image uploads in Settings
- Fixed module banner image uploads in Settings
- Replaced fragile label-based file pickers with explicit upload buttons
- Added clearer storage-full errors without losing existing pictures
- Kept To-do, navigation, Plants, Aquariums and banner features intact
