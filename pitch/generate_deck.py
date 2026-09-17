import os

with open('pitch/template.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

with open('pitch/index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('Done. Lines:', len(html_content.splitlines()))
