
import sys

target_file = r"d:\ALT_Classroom_Games\src\games\WordSearch.jsx"

def verify():
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []

    # Check 1: gameStatus state
    if "const [gameStatus, setGameStatus] = useState('idle');" not in content:
        errors.append("FAIL: gameStatus default is not 'idle'.")

    # Check 2: Start Overlay
    if "handleStartGame" not in content:
        errors.append("FAIL: handleStartGame function missing.")
    if "START" not in content: # Button text
        errors.append("FAIL: Start button text not found.")

    # Check 3: Animation Variants
    if "cellVariants" not in content:
        errors.append("FAIL: cellVariants definition missing.")
    if "delay: custom * 0.05" not in content:
        errors.append("FAIL: Wave delay logic missing.")

    # Check 4: Timer Logic
    if "if (gameStatus === 'playing')" not in content:
        errors.append("FAIL: Timer logic not guarded by 'playing' status.")

    if errors:
         for e in errors:
            print(e)
         sys.exit(1)
    else:
        print("SUCCESS: Animation logic verified.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
