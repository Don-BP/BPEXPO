
import sys
import os

three_dice_path = r"d:\ALT_Classroom_Games\src\components\ThreeDice.jsx"
sl_path = r"d:\ALT_Classroom_Games\src\games\SnakesAndLadders.jsx"

def verify():
    errors = []

    # Check 1: ThreeDice.jsx exists
    if not os.path.exists(three_dice_path):
        errors.append("FAIL: ThreeDice.jsx was not created.")
    else:
        with open(three_dice_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if "Canvas" not in content or "Physics" not in content:
                errors.append("FAIL: ThreeDice.jsx content seems incomplete.")

    # Check 2: SnakesAndLadders.jsx integration
    if os.path.exists(sl_path):
        with open(sl_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if "import ThreeDice" not in content:
                 errors.append("FAIL: ThreeDice import missing in SnakesAndLadders.jsx")
            if "<ThreeDice" not in content:
                 errors.append("FAIL: ThreeDice component not used in render.")
            if "handleDiceRollComplete" not in content:
                 errors.append("FAIL: handleDiceRollComplete logic missing.")

    if errors:
         for e in errors:
            print(e)
         sys.exit(1)
    else:
        print("SUCCESS: 3D Dice implementation verified.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
