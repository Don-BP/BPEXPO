
import subprocess
import sys

def install():
    print("Installing 3D dependencies...")
    cmd = "npm install three @types/three @react-three/fiber @react-three/drei @react-three/cannon"
    
    try:
        subprocess.check_call(cmd, shell=True,  cwd=r"d:\ALT_Classroom_Games")
        print("SUCCESS: Dependencies installed.")
    except subprocess.CalledProcessError as e:
        print(f"FAIL: Installation failed. {e}")
        sys.exit(1)

if __name__ == "__main__":
    install()
