
import os

target_file = r"d:\ALT_Classroom_Games\src\games\WordSearch.jsx"

def fix_layout():
    if not os.path.exists(target_file):
        print(f"ERROR: {target_file} not found.")
        return

    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # The problematic string from the previous step
    # className="bg-slate-900/50 backdrop-blur-xl p-2 rounded-3xl border border-white/10 shadow-2xl touch-none select-none w-full h-full aspect-square max-h-full"
    
    # We want to replace "w-full h-full aspect-square max-h-full" 
    # with "w-auto h-full max-w-full aspect-square mx-auto" or similar.
    # Actually, "max-w-full max-h-full aspect-square mx-auto h-auto" is safest for containing a square.
    
    # Let's find the specific div className and replace the classes.
    # Previous code had:
    # className="bg-slate-900/50 backdrop-blur-xl p-2 rounded-3xl border border-white/10 shadow-2xl touch-none select-none w-full h-full aspect-square max-h-full"

    target_classes = "w-full h-full aspect-square max-h-full"
    replacement_classes = "max-w-full max-h-full aspect-square mx-auto h-auto w-auto"

    if target_classes in content:
        new_content = content.replace(target_classes, replacement_classes)
        with open(target_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"SUCCESS: Replaced problematic CSS classes in {target_file}")
    else:
        # Fallback: maybe I didn't get the string exactly right in the script memory?
        # Let's try a regex for safety or just print error.
        # Looking at previous file view, it was:
        # className="bg-slate-900/50 backdrop-blur-xl p-2 rounded-3xl border border-white/10 shadow-2xl touch-none select-none w-full h-full aspect-square max-h-full"
        print("WARNING: Exact target string not found. Trying flexible replacement.")
        # Try replacing just the tail end if it matches
        flexible_target = "aspect-square max-h-full"
        flexible_replace = "aspect-square max-h-full mx-auto max-w-full"
        
        if flexible_target in content:
             # Wait, the issue is w-full forcing it to be too wide.
             pass
        
        # Let's just try to match the whole line in a simpler way if the exact string fails?
        # No, I'm confident in the memory. If it fails, I'll see the error.
        print(f"ERROR: Could not find '{target_classes}' to replace.")

if __name__ == "__main__":
    fix_layout()
