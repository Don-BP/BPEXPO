
import sys

target_file = r"d:\ALT_Classroom_Games\src\games\SentenceScramble.jsx"

def verify():
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []

    # Check 1: Full Screen
    if "h-screen w-full relative" not in content:
        errors.append("FAIL: Main container not full screen.")

    # Check 2: Next Button
    if "NEXT ROUND" not in content:
        errors.append("FAIL: Next Round button text missing.")
    if "ArrowRight" not in content:
        errors.append("FAIL: Check ArrowRight icon import.")

    # Check 3: Large Text
    if "text-2xl md:text-4xl" not in content:
        errors.append("FAIL: Word text size not increased.")

    if errors:
         for e in errors:
            print(e)
         sys.exit(1)
    else:
        print("SUCCESS: Sentence Mixer refinement verified.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
