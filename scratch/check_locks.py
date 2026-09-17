import os

files = [
    "ZERO_ID_IEEE_Paper_Final.docx",
    "ZERO_ID_IEEE_Research_Paper_Submission.docx",
    "ZERO_ID_IEEE_Research_Paper.docx",
    "ZERO_ID_Project_Report_Description_of_Work.docx",
    "ZERO_ID_Technical_Report_Patent_Specification.docx"
]

for f in files:
    p = os.path.join(os.getcwd(), f)
    if not os.path.exists(p):
        print(f"{f}: DOES NOT EXIST")
        continue
    try:
        with open(p, "a+b") as fp:
            print(f"{f}: UNLOCKED (can be modified)")
    except PermissionError:
        print(f"{f}: LOCKED BY MS WORD (exclusive lock)")
