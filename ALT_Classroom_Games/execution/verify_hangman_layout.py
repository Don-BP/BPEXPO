
import sys

target_file = r"d:\ALT_Classroom_Games\src\games\Hangman.jsx"

def verify():
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []

    # Check 1: Full Screen Container
    if "h-screen w-full relative" not in content:
        errors.append("FAIL: Main container not full screen.")

    # Check 2: Snowman Size
    if "min-h-[300px]" not in content:
        errors.append("FAIL: Snowman container size not increased.")

    # Check 3: Large Text
    if "text-4xl sm:text-5xl lg:text-7xl" not in content:
        errors.append("FAIL: Word text size not increased.")

    # Check 4: Grid Layout
    if "grid-cols-7" not in content:
        errors.append("FAIL: Keyboard grid layout not updated.")

    if errors:
         for e in errors:
            print(e)
         sys.exit(1)
    else:
        print("SUCCESS: Layout refinement verified.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
