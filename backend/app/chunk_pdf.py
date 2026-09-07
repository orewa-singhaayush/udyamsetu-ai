import fitz
import re
import os


BASE_DATA_FOLDER = r"D:\udyamsetu-ai\backend\data"

FOOD_FOLDER = os.path.join(
    BASE_DATA_FOLDER,
    "food"
)

GST_FOLDER = os.path.join(
    BASE_DATA_FOLDER,
    "gst"
)


# =========================================================
# EXTRACT TEXT FROM PDF
# =========================================================

def extract_text(pdf_path):

    doc = fitz.open(pdf_path)

    pages = []

    for page_number, page in enumerate(doc):

        text = page.get_text()

        # Normalize whitespace
        text = re.sub(r"\s+", " ", text).strip()

        if text:

            pages.append({
                "page": page_number + 1,
                "text": text
            })

    doc.close()

    return pages


# =========================================================
# DOCUMENT METADATA
# =========================================================

def get_document_metadata(filename):

    if filename == "fssai_2011_regulations.pdf":

        return {
            "document": "FSSAI Licensing and Registration Regulations 2011",
            "document_type": "base_regulation",
            "authority": "FSSAI",
            "domain": "FSSAI",
            "industry": "Food Processing",
            "language": "English",
            "year": 2011,
            "source_url": "https://www.fssai.gov.in/"
        }

    elif filename == "fssai_license.pdf":

        return {
            "document": "FSSAI Food Safety Licensing and Registration Guidance",
            "document_type": "guidance",
            "authority": "FSSAI",
            "domain": "FSSAI",
            "industry": "Food Processing",
            "language": "English",
            "year": None,
            "source_url": "https://www.fssai.gov.in/"
        }

    elif filename == "Letter_Hygiene_Rating_States_14_06_2019.pdf":

        return {
            "document": "FSSAI Hygiene Rating Scheme Letter",
            "document_type": "official_letter",
            "authority": "FSSAI",
            "domain": "FSSAI",
            "industry": "Food Processing",
            "language": "English",
            "year": 2019,
            "source_url": "https://www.fssai.gov.in/"
        }

    elif filename == "Licensing & Registration.pdf":

        return {
            "document": "FSSAI Licensing and Registration Second Amendment Regulations 2026",
            "document_type": "amendment",
            "authority": "FSSAI",
            "domain": "FSSAI",
            "industry": "Food Processing",
            "language": "English",
            "year": 2026,
            "source_url": "https://www.fssai.gov.in/"
        }
    elif filename == "cgst_act.pdf":

        return {
            "document": "Central Goods and Services Tax Act",
            "document_type": "act",
            "authority": "CBIC",
            "industry": "General",
            "domain": "GST",
            "language": "English",
            "year": None,
            "source_url": "https://taxinformation.cbic.gov.in/"
        }
    
    return {
        "document": filename,
        "document_type": "unknown",
        "authority": "Unknown",
        "domain": "Unknown",
        "industry": "General",
        "language": "English",
        "year": None,
        "source_url": ""
    }


# =========================================================
# SPLIT TEXT INTO BETTER CHUNKS
# =========================================================

def create_chunks(
    pages,
    metadata,
    chunk_size=1500,
    overlap=250
):

    chunks = []

    for page in pages:

        text = page["text"].strip()

        # -------------------------------------------------
        # Split only at stronger regulation/section starts
        # -------------------------------------------------

        sections = re.split(
            r"(?=\b(?:CHAPTER\s+\d+|SCHEDULE\s+\d+|"
            r"ANNEXURE\s+[A-Z]+|"
            r"\d+\.\d+\.\d+\s+|"
            r"\d+\.\d+\s+))",
            text,
            flags=re.IGNORECASE
        )

        sections = [
            section.strip()
            for section in sections
            if len(section.strip()) > 50
        ]

        # If nothing useful was detected
        if not sections:
            sections = [text]

        # -------------------------------------------------
        # Build meaningful chunks
        # -------------------------------------------------

        current_chunk = ""

        for section in sections:

            # If adding this section keeps the chunk reasonable
            if len(current_chunk) + len(section) <= chunk_size:

                if current_chunk:
                    current_chunk += "\n\n" + section
                else:
                    current_chunk = section

            else:

                # Save current chunk
                if current_chunk:

                    chunks.append({
                        "page": page["page"],
                        "text": current_chunk,
                        **metadata
                    })

                # If the section itself is too large,
                # split it with overlap
                if len(section) > chunk_size:

                    start = 0

                    while start < len(section):

                        end = start + chunk_size

                        chunk_text = section[start:end].strip()

                        if chunk_text:

                            chunks.append({
                                "page": page["page"],
                                "text": chunk_text,
                                **metadata
                            })

                        start = end - overlap

                    current_chunk = ""

                else:

                    current_chunk = section

        # -------------------------------------------------
        # Save remaining chunk
        # -------------------------------------------------

        if current_chunk:

            chunks.append({
                "page": page["page"],
                "text": current_chunk,
                **metadata
            })

    return chunks

# =========================================================
# PROCESS PDF FOLDER
# =========================================================

def process_folder(folder_path):

    all_chunks = []

    if not os.path.exists(folder_path):

        print(
            "\nFolder does not exist:",
            folder_path
        )

        return all_chunks

    for filename in os.listdir(folder_path):

        if filename.lower().endswith(".pdf"):

            pdf_path = os.path.join(
                folder_path,
                filename
            )

            print("\nProcessing:", filename)

            metadata = get_document_metadata(
                filename
            )

            pages = extract_text(
                pdf_path
            )

            chunks = create_chunks(
                pages,
                metadata
            )

            all_chunks.extend(
                chunks
            )

            print(
                "Pages:",
                len(pages)
            )

            print(
                "Chunks:",
                len(chunks)
            )

    return all_chunks


# =========================================================
# PROCESS FOOD
# =========================================================

food_chunks = process_folder(
    FOOD_FOLDER
)


# =========================================================
# PROCESS GST
# =========================================================

gst_chunks = process_folder(
    GST_FOLDER
)


# =========================================================
# COMBINE ALL CHUNKS
# =========================================================

all_chunks = (
    food_chunks +
    gst_chunks
)


# =========================================================
# FINAL RESULT
# =========================================================

print("\n==============================")

print(
    "TOTAL PAGES:",
    len(
        set(
            (
                chunk["document"],
                chunk["page"]
            )
            for chunk in all_chunks
        )
    )
)

print(
    "TOTAL CHUNKS:",
    len(all_chunks)
)

print("==============================")


# =========================================================
# DISPLAY FIRST 5 CHUNKS
# =========================================================

for i, chunk in enumerate(
    all_chunks[:5]
):

    print("\n==============================")

    print(
        "CHUNK:",
        i + 1
    )

    print(
        "DOMAIN:",
        chunk.get(
            "domain",
            "Unknown"
        )
    )

    print(
        "DOCUMENT:",
        chunk["document"]
    )

    print(
        "PAGE:",
        chunk["page"]
    )

    print("==============================")

    print(
        chunk["text"]
    )