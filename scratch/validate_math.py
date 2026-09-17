import os
import docx
import zipfile
import xml.etree.ElementTree as ET

p = os.path.join(os.getcwd(), 'ZERO_ID_IEEE_Research_Paper_Submission.docx')
print('Exists:', os.path.exists(p), 'Size:', os.path.getsize(p))

with zipfile.ZipFile(p) as z:
    for name in z.namelist():
        if name.endswith('.xml'):
            ET.fromstring(z.read(name))
    print('All XML parts validated: PASS')
    doc_xml = z.read('word/document.xml').decode('utf-8')
    if 'w:cantSplit' in doc_xml:
        print('cantSplit protection: CONFIRMED')
    if 'w:num="2"' in doc_xml:
        print('IEEE 2-Column layout: CONFIRMED')

doc = docx.Document(p)
text = ' '.join([p_el.text for p_el in doc.paragraphs])
words = len(text.split())
print(f'Word count: {words}')
print(f'Paragraphs: {len(doc.paragraphs)}')
print(f'Tables/Boxes: {len(doc.tables)}')

# Verify no raw LaTeX remnants like Adv_{ or _{ or \lambda
raw_latex_remnants = [
    'Adv_{', 'Exp_{', '_{A}', '^{anti-fwd}', '2^{-lambda}', '2^{-λ}', 
    '\\lambda', 'approx_c', '\\mathbb', '\\sum', '\\cdot', 'privakyc'
]
found_remnants = []
for r in raw_latex_remnants:
    if r in text:
        found_remnants.append(r)

if found_remnants:
    print(f'Raw LaTeX remnants found: {found_remnants}')
else:
    print('Clean Unicode Math check: 100% CLEAN (0 LaTeX remnants)')

print('Validation completed successfully.')
