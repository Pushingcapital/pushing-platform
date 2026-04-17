import subprocess
import os

def test_shell(command):
    print(f"Executing: {command}")
    try:
        completed = subprocess.run(
            ["/bin/zsh", "-lc", command],
            capture_output=True,
            text=True,
            check=False,
            timeout=10,
        )
        print(f"Return Code: {completed.returncode}")
        print(f"STDOUT: {completed.stdout}")
        print(f"STDERR: {completed.stderr}")
    except Exception as exc:
        print(f"Error: {exc}")

if __name__ == "__main__":
    test_shell("ls /Users/emmanuelhaddad/pushing-platform")
    test_shell("docker ps")
