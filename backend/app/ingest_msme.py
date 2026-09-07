import json
import re
from pathlib import Path

import fitz
from sentence_transformers import SentenceTransformer


# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MSME_DIR = BASE_DIR / "data" / "msme"
OUTPUT_FILE = MSME_DIR / "chunks.json"

MODEL_NAME = "all-MiniLM-L6-v2"

CHUNK_SIZE = 1500
CHUNK_OVERLAP = 250


PDF_METADATA = {
    "msme_classification_2025.pdf": {
        "document": "MSME Classification Notification 2025",
        "document_type": "official_notification",
        "authority": "Ministry of Micro, Small & Medium Enterprises",
        "year": 2025,
        "source_url": "https://udyamregistration.gov.in/",
    },

    "msme_schemes_2026.pdf": {
        "document": "MSME Schemes at a Glance 2026",
        "document_type": "scheme_guidelines",
        "authority": "Ministry of Micro, Small & Medium Enterprises",
        "year": 2026,
        "source_url": "https://www.msme.gov.in/",
    },

    "udyam_registration_benefits.pdf": {
        "document": "Udyam Registration Benefits",
        "document_type": "official_information",
        "authority": "Udyam Registration Portal",
        "year": None,
        "source_url": "https://udyamregistration.gov.in/",
    },

    "udyam_registration_sample_form.pdf": {
        "document": "Udyam Registration Sample Form",
        "document_type": "registration_form",
        "authority": "Udyam Registration Portal",
        "year": None,
        "source_url": "https://udyamregistration.gov.in/",
    },
}


# ---------------------------------------------------------
# TEXT CLEANING
# ---------------------------------------------------------

def clean_text(text: str) -> str:
    """
    Clean extracted PDF text while preserving useful content.
    """

    text = text.replace("\x00", " ")

    # Remove excessive whitespace
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    return text.strip()


# ---------------------------------------------------------
# PDF EXTRACTION
# ---------------------------------------------------------

def extract_pdf(pdf_path: Path):
    """
    Extract text page-by-page from a PDF.
    """

    pages = []

    doc = fitz.open(pdf_path)

    try:
        for page_number, page in enumerate(doc, start=1):

            text = page.get_text("text")

            text = clean_text(text)

            if not text:
                continue

            pages.append({
                "page": page_number,
                "text": text,
            })

    finally:
        doc.close()

    return pages


# ---------------------------------------------------------
# CHUNKING
# ---------------------------------------------------------

def chunk_text(text: str):
    """
    Split text into overlapping chunks.
    """

    if len(text) <= CHUNK_SIZE:
        return [text]

    chunks = []

    start = 0

    while start < len(text):

        end = start + CHUNK_SIZE

        chunk = text[start:end]

        chunk = chunk.strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start = end - CHUNK_OVERLAP

    return chunks


# ---------------------------------------------------------
# BUILD CHUNKS
# ---------------------------------------------------------

def build_chunks():

    all_chunks = []

    for filename, metadata in PDF_METADATA.items():

        pdf_path = MSME_DIR / filename

        if not pdf_path.exists():
            print(f"WARNING: Missing file: {pdf_path}")
            continue

        print(f"\nProcessing: {filename}")

        pages = extract_pdf(pdf_path)

        print(f"Pages extracted: {len(pages)}")

        for page_data in pages:

            page_number = page_data["page"]
            text = page_data["text"]

            chunks = chunk_text(text)

            for chunk_index, chunk in enumerate(chunks):

                record = {
                    "id": len(all_chunks),

                    "text": chunk,

                    "source_file": filename,

                    "document": metadata["document"],

                    "document_type": metadata["document_type"],

                    "authority": metadata["authority"],

                    "page": page_number,

                    "chunk_index": chunk_index,

                    "domain": "msme",

                    "industry": "MSME",

                    "year": metadata["year"],

                    "source_url": metadata["source_url"],
                }

                all_chunks.append(record)

    return all_chunks


# ---------------------------------------------------------
# EMBEDDINGS
# ---------------------------------------------------------

def generate_embeddings(chunks):

    print("\nLoading embedding model...")

    model = SentenceTransformer(MODEL_NAME)

    texts = [chunk["text"] for chunk in chunks]

    print(f"Generating embeddings for {len(texts)} chunks...")

    embeddings = model.encode(
        texts,
        show_progress_bar=True,
        normalize_embeddings=True,
    )

    for chunk, embedding in zip(chunks, embeddings):

        chunk["embedding"] = embedding.tolist()

    return chunks


# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------

def main():

    print("=" * 60)
    print("MSME / UDYAM RAG INGESTION")
    print("=" * 60)

    MSME_DIR.mkdir(parents=True, exist_ok=True)

    chunks = build_chunks()

    if not chunks:
        print("\nERROR: No chunks were generated.")
        return

    print(f"\nTotal chunks generated: {len(chunks)}")

    chunks = generate_embeddings(chunks)

    print("\nSaving chunks...")

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            chunks,
            file,
            ensure_ascii=False,
            indent=2,
        )

    print("\n" + "=" * 60)
    print("MSME / UDYAM INGESTION COMPLETE")
    print("=" * 60)

    print(f"Output: {OUTPUT_FILE}")
    print(f"Total chunks: {len(chunks)}")
    print("Embedding dimension: 384")


if __name__ == "__main__":
    main()
    