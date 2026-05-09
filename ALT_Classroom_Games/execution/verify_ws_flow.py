
import sys

target_file = r"d:\ALT_Classroom_Games\src\games\WordSearch.jsx"

def verify():
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []

    # Check 1: isSetup default
    if "const [isSetup, setIsSetup] = useState(false);" not in content:
        errors.append("FAIL: isSetup default is not false.")

    # Check 2: initGame definition
    if "const initGame = (overrideCategory = null) => {" not in content:
        errors.append("FAIL: initGame signature not updated.")

    # Check 3: initGame usage of override
    if "const allWords = WORD_LISTS[overrideCategory || category];" not in content:
        errors.append("FAIL: initGame does not use overrideCategory.")

    # Check 4: Random start effect
    if "// Immediate random start" not in content:
        errors.append("FAIL: Random start effect comment not found.")
    
    if "setCategory(randomCat);" not in content:
        errors.append("FAIL: setCategory missing in effect.")

    if errors:
         for e in errors:
            print(e)
         sys.exit(1)
    else:
        print("SUCCESS: Flow adjustment verified.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
