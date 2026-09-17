import re

file_path = r"c:\Users\suyas\OneDrive\Desktop\PrivaKYC-main\scratch\build_full_document.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace all occurrences of PrivaKYC / Priva in titles and body
content = content.replace("ZERO-ID (PrivaKYC)", "ZERO-ID")
content = content.replace("ZERO-ID / PrivaKYC", "ZERO-ID")
content = content.replace("(ZERO-ID / PrivaKYC)", "(ZERO-ID)")
content = content.replace("PrivaKYC", "ZERO-ID")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated build_full_document.py successfully.")
