import json
import numpy as np
from sentence_transformers import SentenceTransformer


CHUNKS_PATH = r"D:\udyamsetu-ai\backend\data\food\chunks.json"


print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")


print("Loading chunks...")

with open(CHUNKS_PATH, "r", encoding="utf-8") as file:
    chunks = json.load(file)


def cosine_similarity(a, b):
    return np.dot(a, b) / (
        np.linalg.norm(a) * np.linalg.norm(b)
    )


def search(query, top_k=3):

    query_embedding = model.encode(query)

    results = []

    for chunk in chunks:

        chunk_embedding = np.array(chunk["embedding"])

        score = cosine_similarity(
            query_embedding,
            chunk_embedding
        )

        results.append({
            "score": float(score),
            "page": chunk["page"],
            "text": chunk["text"]
        })

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return results[:top_k]


question = input("\nAsk a question: ")

results = search(question)


print("\n===== SEARCH RESULTS =====")

for i, result in enumerate(results):

    print(f"\nRESULT {i + 1}")
    print("Score:", result["score"])
    print("Page:", result["page"])
    print("Text:")
    print(result["text"])
    