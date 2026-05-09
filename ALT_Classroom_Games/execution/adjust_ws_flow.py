
import os
import re

target_file = r"d:\ALT_Classroom_Games\src\games\WordSearch.jsx"

def adjust_flow():
    if not os.path.exists(target_file):
        print(f"ERROR: {target_file} not found.")
        return

    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Change isSetup default to false
    content = content.replace("const [isSetup, setIsSetup] = useState(true);", "const [isSetup, setIsSetup] = useState(false);")

    # 2. Modify initGame to accept overrideCategory
    # Find "const initGame = () => {"
    if "const initGame = () => {" in content:
        content = content.replace("const initGame = () => {", "const initGame = (overrideCategory = null) => {")
    
    # 3. Use overrideCategory in initGame
    # Find "const allWords = WORD_LISTS[category];"
    if "const allWords = WORD_LISTS[category];" in content:
        content = content.replace("const allWords = WORD_LISTS[category];", "const allWords = WORD_LISTS[overrideCategory || category];")

    # 4. Add useEffect for random start
    # We'll insert it after the Timer State declaration or after timer useEffect
    # Start looking for the timer useEffect
    timer_effect_start = "useEffect(() => {"
    # We can just insert it before the "const formatTime" line for safety/ease
    insert_point = "const formatTime ="
    
    new_effect = """
    // Immediate random start
    useEffect(() => {
        const cats = Object.keys(WORD_LISTS);
        const randomCat = cats[Math.floor(Math.random() * cats.length)];
        setCategory(randomCat);
        initGame(randomCat);
    }, []);

    """
    
    if insert_point in content and "Immediate random start" not in content:
        content = content.replace(insert_point, new_effect + insert_point)

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"SUCCESS: Adjusted game flow in {target_file}")

if __name__ == "__main__":
    adjust_flow()
