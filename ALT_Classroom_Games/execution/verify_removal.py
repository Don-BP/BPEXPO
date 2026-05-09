
import os
import sys

def verify():
    errors = []
    
    # Check 1: File deletion
    game_file = r"d:\ALT_Classroom_Games\src\games\DrawAndGuess.jsx"
    if os.path.exists(game_file):
        errors.append(f"FAIL: {game_file} still exists.")
    
    # Check 2: App.jsx
    app_jsx = r"d:\ALT_Classroom_Games\src\App.jsx"
    with open(app_jsx, 'r') as f:
        content = f.read()
        if "DrawAndGuess" in content:
            errors.append("FAIL: App.jsx still contains 'DrawAndGuess'")
        if "game/pictionary" in content:
            errors.append("FAIL: App.jsx still contains 'game/pictionary'")

    # Check 3: Home.jsx
    home_jsx = r"d:\ALT_Classroom_Games\src\pages\Home.jsx"
    with open(home_jsx, 'r') as f:
        content = f.read()
        if "id: 'pictionary'" in content:
            errors.append("FAIL: Home.jsx still contains 'pictionary' setup")

    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    else:
        print("SUCCESS: All verification checks passed.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
