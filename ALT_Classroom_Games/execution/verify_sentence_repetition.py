
import sys

target_file = r"d:\ALT_Classroom_Games\src\games\SentenceScramble.jsx"

def verify():
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []

    # Check 1: completedSentences state
    if "const [completedSentences, setCompletedSentences] = useState([]);" not in content:
        errors.append("FAIL: completedSentences state missing.")

    # Check 2: Filter Logic
    if "let available = allSentences.filter(s => !history.includes(s));" not in content:
        errors.append("FAIL: Filtering logic missing.")

    # Check 3: Cycle Reset
    if "available = allSentences;" not in content:
        errors.append("FAIL: Cycle reset logic missing.")
    
    # Check 4: Add to History
    if "setCompletedSentences(prev => [...prev, targetSentence]);" not in content:
        errors.append("FAIL: History update logic missing.")

    if errors:
         for e in errors:
            print(e)
         sys.exit(1)
    else:
        print("SUCCESS: Non-repeating logic verified.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
