
import sys

target_file = r"d:\ALT_Classroom_Games\src\games\WordSearch.jsx"

def verify():
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    errors = []

    # Check 1: Coordinate storage in placedWords
    if "coords.push({ r: r + dr * i, c: c + dc * i });" not in content:
        errors.append("FAIL: Coordinates are not being pushed in place() function.")
    
    if "placed.push({ word, color: getRandomColor(), coords });" not in content:
        errors.append("FAIL: Coords are not being stored in placedWords state.")

    # Check 2: Found words highlighting logic
    if "const getFoundColor = (r, c) => {" not in content:
        errors.append("FAIL: getFoundColor helper function missing.")
    
    if "const foundColor = getFoundColor(r, c);" not in content:
         errors.append("FAIL: Found color not retrieved in render loop.")

    # Check 3: Full screen CSS
    if "h-screen w-full" not in content:
         errors.append("FAIL: Main container does not have h-screen w-full classes.")
    
    if "gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`" not in content:
         errors.append("FAIL: gridTemplateRows missing for full height grid.")

    if "h-full aspect-square" not in content:
         errors.append("FAIL: Grid container missing h-full aspect-square properties.")

    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    else:
        print("SUCCESS: Code structure verification passed.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
