"""Build the Textile RAG knowledge base without regenerating Food or GST."""

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

import fitz
from sentence_transformers import SentenceTransformer


BACKEND_DIR = Path(__file__).resolve().parents[1]
TEXTILE_DIR = BACKEND_DIR / "data" / "textile"
OUTPUT_PATH = TEXTILE_DIR / "chunks.json"
MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 250

PDF_METADATA = {
    "national_textile_policy_2000.pdf": ("National Textile Policy 2000", "policy", "Ministry of Textiles", 2000, "https://texmin.nic.in/"),
    "notification.pdf": ("PM MITRA Parks Scheme Notification", "notification", "Ministry of Textiles", 2021, "https://texmin.nic.in/"),
    "guidelines_2022.pdf": ("PM MITRA Parks Operational Guidelines 2022", "guidelines", "Ministry of Textiles", 2022, "https://texmin.nic.in/"),
    "revised_guidelines_2025.pdf": ("Revised PM MITRA Parks Guidelines 2025", "guidelines", "Ministry of Textiles", 2025, "https://texmin.nic.in/"),
    "second_revised_guidelines_2026.pdf": ("Second Revised PM MITRA Parks Guidelines 2026", "guidelines", "Ministry of Textiles", 2026, "https://texmin.nic.in/"),
    "cis_guidelines_2026.pdf": ("PM MITRA Competitive Incentive Support Guidelines 2026", "guidelines", "Ministry of Textiles", 2026, "https://texmin.nic.in/"),
    "pli_textiles.pdf": ("Production Linked Incentive Scheme for Textiles", "scheme_guidelines", "Ministry of Textiles", None, "https://texmin.nic.in/"),
    "pm_mitra_parks.pdf": ("PM MITRA Parks Scheme", "scheme_guidelines", "Ministry of Textiles", None, "https://texmin.nic.in/"),
    "pm_mitra_sites.pdf": ("PM MITRA Parks Sites", "official_information", "Ministry of Textiles", None, "https://texmin.nic.in/"),
}


def metadata(document, document_type, authority, year, source_url):
    return {
        "document": document,
        "document_type": document_type,
        "authority": authority,
        "domain": "Textile",
        "industry": "Textile",
        "language": "English",
        "year": year,
        "source_url": source_url,
    }


def clean_text(text):
    return re.sub(r"\s+", " ", text).strip()


def split_text(text):
    if len(text) <= CHUNK_SIZE:
        return [text]
    chunks, start = [], 0
    while start < len(text):
        end = min(len(text), start + CHUNK_SIZE)
        if end < len(text):
            boundary = max(text.rfind(". ", start, end), text.rfind("; ", start, end), text.rfind(" ", start, end))
            if boundary > start + CHUNK_SIZE // 2:
                end = boundary + 1
        part = text[start:end].strip()
        if part:
            chunks.append(part)
        if end == len(text):
            break
        start = max(end - CHUNK_OVERLAP, start + 1)
    return chunks


def ingest_pdfs():
    chunks = []
    for filename, details in PDF_METADATA.items():
        pdf_path = TEXTILE_DIR / filename
        if not pdf_path.exists():
            raise FileNotFoundError(pdf_path)
        document, document_type, authority, year, source_url = details
        document_metadata = metadata(document, document_type, authority, year, source_url)
        with fitz.open(pdf_path) as pdf:
            for page_number, page in enumerate(pdf, start=1):
                text = clean_text(page.get_text())
                if not text:
                    continue
                for part in split_text(text):
                    chunks.append({
                        "page": page_number,
                        "text": part,
                        "source_file": filename,
                        **document_metadata
                    })
    return chunks


def excel_cell_value(cell, shared_strings, namespace):
    value_node = cell.find("m:v", namespace)
    if value_node is None:
        return ""
    value = value_node.text or ""
    return shared_strings[int(value)] if cell.attrib.get("t") == "s" else value


def ingest_amravati_excel():
    """Read only non-contact columns; contact-person, mobile, email and similar PII stay out of RAG."""
    source = TEXTILE_DIR / "maharashtra_textile.xlsx"
    namespace = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    with zipfile.ZipFile(source) as archive:
        shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        shared_strings = ["".join(node.text or "" for node in item.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")) for item in shared_root]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
    rows = []
    for row in sheet.findall("m:sheetData/m:row", namespace):
        cells = [excel_cell_value(cell, shared_strings, namespace) for cell in row.findall("m:c", namespace)]
        rows.append(cells)
    headers = [clean_text(value) for value in rows[1]]
    blocked = ("contact", "mobile", "phone", "email", "website", "catalog")
    allowed_indexes = [index for index, header in enumerate(headers) if header and not any(term in header.lower() for term in blocked)]
    excel_metadata = metadata("Maharashtra Textile Enterprises - Amravati", "spreadsheet_directory", "Government of Maharashtra source workbook", None, "")
    chunks = []
    for row in rows[2:]:
        fields = []
        for index in allowed_indexes:
            if index < len(row) and clean_text(row[index]):
                fields.append(f"{headers[index]}: {clean_text(row[index])}")
        if fields:
            chunks.append({
                "page": "Spreadsheet row",
                "text": "Amravati textile enterprise directory. " + "; ".join(fields),
                "location": "Amravati, Maharashtra",
                "source_file": source.name,
                **excel_metadata
            })
    return chunks


def main():
    chunks = ingest_pdfs() + ingest_amravati_excel()
    if not chunks:
        raise RuntimeError("No Textile chunks were created.")
    model = SentenceTransformer(MODEL_NAME)
    embeddings = model.encode([chunk["text"] for chunk in chunks], show_progress_bar=True)
    for chunk, embedding in zip(chunks, embeddings):
        chunk["embedding"] = embedding.tolist()
    if len(chunks[0]["embedding"]) != 384:
        raise ValueError("Expected 384-dimensional all-MiniLM-L6-v2 embeddings.")
    OUTPUT_PATH.write_text(json.dumps(chunks, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(chunks)} Textile chunks to {OUTPUT_PATH}")
    print("Embedding dimension: 384")


if __name__ == "__main__":
    main()
