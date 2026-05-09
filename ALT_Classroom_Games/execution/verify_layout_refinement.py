
import sys

target_file = r"d:\ALT_Classroom_Games\src\games\WordSearch.jsx"

def verify():
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []

    # Check 1: Main container should NOT have max-w-7xl
    # We replaced "max-w-7xl mx-auto" with "w-full flex overflow-hidden" (simplified check)
    if "max-w-7xl" in content:
        # Note: Previous script might have been clever enough to keep it in a comment or something, but generally we want it gone from the active class.
        # Wait, the verification script in the directive said "max-w-7xl NOT found in main container"
        # Ideally it shouldn't be there at all to avoid confusion.
        pass # Let's be strict. If it's there, fail.
        errors.append("FAIL: 'max-w-7xl' found. Container might still be constrained.")

    # Check 2: Sidebar should be pinned (w-64)
    if "w-48 sm:w-64 flex-none" not in content:
        errors.append("FAIL: Sidebar width class 'w-48 sm:w-64' not found.")

    # Check 3: Grid sizing
    if "height: 'min(95vh, 95vw)'" not in content:
        errors.append("FAIL: Grid height constraint 'min(95vh, 95vw)' not found.")

    if errors:
         for e in errors:
            print(e)
         sys.exit(1)
    else:
        print("SUCCESS: Layout refinement verified.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
