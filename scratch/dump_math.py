import docx
import sys

doc = docx.Document('ZERO_ID_IEEE_Research_Paper_Submission.docx')
with open('scratch/math_paragraphs.txt', 'w', encoding='utf-8') as f:
    for i, p in enumerate(doc.paragraphs):
        if any(term in p.text for term in ['Adv', 'anti-fwd', 'e(A, B)', 'NullifierHash', 'C_HW', 'Groth16', 'Poseidon', 'Algorithm', 'Theorem']):
            f.write(f"Paragraph {i}:\n{p.text}\n\n")

print("Saved math paragraphs to scratch/math_paragraphs.txt")
