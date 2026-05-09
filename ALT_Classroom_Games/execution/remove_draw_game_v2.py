
import os
import re

def remove_file(path):
    if os.path.exists(path):
        try:
            os.remove(path)
            print(f"SUCCESS: Removed {path}")
        except Exception as e:
            print(f"ERROR: Could not remove {path}. Reason: {e}")
    else:
        print(f"WARNING: File {path} does not exist.")

def remove_lines_containing(file_path, pattern):
    if not os.path.exists(file_path):
        print(f"ERROR: File {file_path} not found.")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        removed_count = 0
        for line in lines:
            if re.search(pattern, line):
                removed_count += 1
                continue
            new_lines.append(line)
        
        if removed_count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"SUCCESS: Removed {removed_count} lines from {file_path} matching '{pattern}'")
        else:
            print(f"INFO: No lines found matching '{pattern}' in {file_path}")

    except Exception as e:
        print(f"ERROR: Failed to update {file_path}. Reason: {e}")

def main():
    # 1. Remove the game file
    game_file = r"d:\ALT_Classroom_Games\src\games\DrawAndGuess.jsx"
    remove_file(game_file)

    # 2. Remove references from App.jsx
    app_jsx = r"d:\ALT_Classroom_Games\src\App.jsx"
    # Remove import
    remove_lines_containing(app_jsx, r"import DrawAndGuess from './games/DrawAndGuess';")
    # Remove Route
    # <Route path="game/pictionary" element={<DrawAndGuess />} />
    remove_lines_containing(app_jsx, r"path=\"game/pictionary\"")

    # 3. Remove references from Home.jsx
    home_jsx = r"d:\ALT_Classroom_Games\src\pages\Home.jsx"
    # The config line in GAMES array:
    # { id: 'pictionary', title: 'Draw & Guess', icon: <Palette size={40} />, color: '#FFE66D', desc: 'Creative Classic' },
    remove_lines_containing(home_jsx, r"id: 'pictionary'")

if __name__ == "__main__":
    main()
