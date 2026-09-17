import re

files_to_clean = [
    r"c:\Users\suyas\OneDrive\Desktop\PrivaKYC-main\PROJECT_REPORT_ZERO_ID_DESCRIPTION_OF_WORK.md",
    r"c:\Users\suyas\OneDrive\Desktop\PrivaKYC-main\scratch\docx_helpers_clean.py"
]

for file_path in files_to_clean:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        content = content.replace("ZERO-ID (PrivaKYC)", "ZERO-ID")
        content = content.replace("ZERO-ID / PrivaKYC", "ZERO-ID")
        content = content.replace("(PrivaKYC)", "")
        content = content.replace("PrivaKYC", "ZERO-ID")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Cleaned {file_path}")
    except Exception as e:
        print(f"Error cleaning {file_path}: {e}")
