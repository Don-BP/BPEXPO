
import sys

target_file = r"d:\ALT_Classroom_Games\src\games\WordSearch.jsx"

def verify():
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []

    # Check 1: New Word Lists
    if "ANIMALS" not in content or "INSTRUMENTS" not in content or "VERBS" not in content:
        errors.append("FAIL: New categories missing from WORD_LISTS.")

    # Check 2: Setup Logic
    if "const [wordCount, setWordCount] = useState(5);" not in content:
        errors.append("FAIL: wordCount state missing.")
    
    if "const [isSetup, setIsSetup] = useState(true);" not in content:
        errors.append("FAIL: isSetup state missing.")

    # Check 3: Timer Logic
    if "const [timer, setTimer] = useState(0);" not in content:
        errors.append("FAIL: timer state missing.")
    
    if "setInterval" not in content:
        errors.append("FAIL: setInterval logic missing.")

    # Check 4: Random Selection
    if ".sort(() => 0.5 - Math.random())" not in content:
        errors.append("FAIL: Random shuffle logic missing.")
    
    if ".slice(0, Math.min(wordCount, 15))" not in content:
        errors.append("FAIL: Word count limiting logic missing.")

    if errors:
         for e in errors:
            print(e)
         sys.exit(1)
    else:
        print("SUCCESS: V2 features verified.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
