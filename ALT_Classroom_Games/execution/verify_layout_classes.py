
import sys

target_file = r"d:\ALT_Classroom_Games\src\games\WordSearch.jsx"

def verify():
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # The new classes we added
    required_classes = ["max-w-full", "max-h-full", "aspect-square", "mx-auto"]
    
    # The bad combo we wanted to remove (specifically w-full combined with fixed aspect that overflows)
    # Note: we replaced "w-full h-full aspect-square max-h-full" with "max-w-full max-h-full aspect-square mx-auto h-auto w-auto"
    forbidden_fragment = "w-full h-full aspect-square max-h-full"

    errors = []
    
    if forbidden_fragment in content:
        errors.append(f"FAIL: Found forbidden CSS fragment: '{forbidden_fragment}'")

    for cls in required_classes:
        if cls not in content:
            errors.append(f"FAIL: Missing required class '{cls}'")

    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    else:
        print("SUCCESS: Layout classes verified.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
