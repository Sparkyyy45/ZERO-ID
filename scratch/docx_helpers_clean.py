import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def add_page_number_to_run(run):
    """Properly adds Word PAGE field inside a run <w:r> element according to ECMA-376 OpenXML schema."""
    r_elem = run._r
    fldChar1 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
    instrText = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> PAGE </w:instrText>')
    fldChar2 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>')
    fldChar3 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')
    r_elem.append(fldChar1)
    r_elem.append(instrText)
    r_elem.append(fldChar2)
    r_elem.append(fldChar3)

def set_cell_background(cell, hex_color):
    """Sets cell background shading in a schema-compliant way."""
    tcPr = cell._element.get_or_add_tcPr()
    # Remove existing shd if any
    for existing in tcPr.findall(qn('w:shd')):
        tcPr.remove(existing)
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_table_borders(table, color="D0D5DD", sz="4"):
    """Sets clean single table borders."""
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        for existing in tblPr[0].findall(qn('w:tblBorders')):
            tblPr[0].remove(existing)
        borders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:left w:val="none"/>
                <w:right w:val="none"/>
                <w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideV w:val="none"/>
            </w:tblBorders>
        ''')
        tblPr[0].append(borders)

def set_box_left_border(cell, color="1D6FA5", sz="24"):
    """Adds a left accent border for callout/code boxes."""
    tcPr = cell._element.get_or_add_tcPr()
    for existing in tcPr.findall(qn('w:tcBorders')):
        tcPr.remove(existing)
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="{sz}" w:color="{color}"/>
            <w:top w:val="none"/>
            <w:right w:val="none"/>
            <w:bottom w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)
