import json
import os
from sentence_transformers import SentenceTransformer

# -----------------------------------
# BASE FOLDERS
# -----------------------------------

BASE_DATA_FOLDER = r"D:\udyamsetu-ai\backend\data"

FOOD_FOLDER = os.path.join(BASE_DATA_FOLDER, "food")
GST_FOLDER = os.path.join(BASE_DATA_FOLDER, "gst")

FOOD_OUTPUT = os.path.join(FOOD_FOLDER, "chunks.json")
GST_OUTPUT = os.path.join(GST_FOLDER, "chunks.json")


# -----------------------------------
# LOAD EMBEDDING MODEL
# -----------------------------------

print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Embedding model loaded.")


# -----------------------------------
# IMPORT PDF FUNCTIONS
# -----------------------------------

from chunk_pdf import (
    extract_text,
    create_chunks,
    get_document_metadata
)


# -----------------------------------
# PROCESS ONE FOLDER
# -----------------------------------

def process_folder(folder_path):

    all_chunks = []

    if not os.path.exists(folder_path):
        print("\nFolder does not exist:", folder_path)
        return all_chunks

    for filename in os.listdir(folder_path):

        if filename.lower().endswith(".pdf"):

            pdf_path = os.path.join(folder_path, filename)

            print("\nProcessing:", filename)

            metadata = get_document_metadata(filename)

            pages = extract_text(pdf_path)

            chunks = create_chunks(
                pages,
                metadata
            )

            all_chunks.extend(chunks)

            print("Pages:", len(pages))
            print("Chunks:", len(chunks))

    return all_chunks


# -----------------------------------
# CREATE EMBEDDINGS AND SAVE
# -----------------------------------

def create_embeddings_and_save(chunks, output_file, domain):

    if not chunks:
        print("\nNo chunks found for:", domain)
        return

    print("\n==============================")
    print("DOMAIN:", domain)
    print("TOTAL CHUNKS:", len(chunks))
    print("==============================")

    # -----------------------------------
    # EXTRACT TEXT
    # -----------------------------------

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    # -----------------------------------
    # CREATE EMBEDDINGS
    # -----------------------------------

    print("\nCreating embeddings for", domain, "...")

    embeddings = model.encode(
        texts,
        show_progress_bar=True
    )

    # -----------------------------------
    # ATTACH EMBEDDINGS
    # -----------------------------------

    for i, chunk in enumerate(chunks):

        chunk["embedding"] = embeddings[i].tolist()

    # -----------------------------------
    # SAVE JSON
    # -----------------------------------

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            chunks,
            f,
            ensure_ascii=False,
            indent=2
        )

    print("\nSaved:", output_file)
    print("Chunks:", len(chunks))
    print("Embedding size:", len(embeddings[0]))


# -----------------------------------
# MAIN
# -----------------------------------

print("\n===================================")
print("UDYAMSETU AI - EMBEDDING PIPELINE")
print("===================================")


# -----------------------------------
# PROCESS FSSAI / FOOD
# -----------------------------------

food_chunks = process_folder(FOOD_FOLDER)

create_embeddings_and_save(
    food_chunks,
    FOOD_OUTPUT,
    "FSSAI / FOOD"
)


# -----------------------------------
# PROCESS GST
# -----------------------------------

gst_chunks = process_folder(GST_FOLDER)

create_embeddings_and_save(
    gst_chunks,
    GST_OUTPUT,
    "GST"
)


# -----------------------------------
# FINAL SUMMARY
# -----------------------------------

print("\n===================================")
print("EMBEDDING PIPELINE COMPLETE")
print("===================================")

print("Food chunks:", len(food_chunks))
print("GST chunks:", len(gst_chunks))

print("\nFood database:")
print(FOOD_OUTPUT)

print("\nGST database:")
print(GST_OUTPUT)