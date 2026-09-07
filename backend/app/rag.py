import json
import subprocess
import re
import numpy as np
from sentence_transformers import SentenceTransformer


# -----------------------------
# CONFIG
# -----------------------------

BASE_DATA_FOLDER = r"D:\udyamsetu-ai\backend\data"

DOMAIN_PATHS = {
    "food": "data/food/chunks.json",
    "fssai": "data/food/chunks.json",

    "gst": "data/gst/chunks.json",

    "textile": "data/textile/chunks.json",
    "garment": "data/textile/chunks.json",

    # MSME / Udyam
    "msme": "data/msme/chunks.json",
    "udyam": "data/msme/chunks.json",
}

MODEL_NAME = "gemma3:4b"
TOP_K = 5


# -----------------------------
# LOAD EMBEDDING MODEL
# -----------------------------

print("Loading embedding model...")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

print("Embedding model loaded.")


# -----------------------------
# LOAD DOMAIN DATABASE
# -----------------------------

def load_knowledge_base(domain):

    domain = domain.lower().strip()

    if domain not in DOMAIN_PATHS:
        print("Unknown domain:", domain)
        return []

    chunks_path = DOMAIN_PATHS[domain]

    print("\nLoading knowledge base:")
    print(chunks_path)

    try:

        with open(
            chunks_path,
            "r",
            encoding="utf-8"
        ) as f:

            chunks = json.load(f)

        print(
            f"Loaded {len(chunks)} chunks "
            f"for domain: {domain}"
        )

        return chunks

    except FileNotFoundError:

        print(
            "\nKnowledge base not found:"
        )

        print(chunks_path)

        return []

    except Exception as e:

        print(
            "\nError loading knowledge base:"
        )

        print(e)

        return []


# -----------------------------
# COSINE SIMILARITY
# -----------------------------

def cosine_similarity(a, b):

    denominator = (
        np.linalg.norm(a) *
        np.linalg.norm(b)
    )

    if denominator == 0:
        return 0

    return np.dot(a, b) / denominator


# -----------------------------
# BUSINESS KEYWORDS
# -----------------------------

def get_business_keywords(business_type):

    business_keywords = []

    if not business_type:
        return business_keywords

    business_type = business_type.lower()

    business_keywords.append(
        business_type
    )

    if business_type == "restaurant":

        business_keywords.extend([
            "restaurant",
            "food service",
            "food service provider",
            "hotel",
            "catering"
        ])

    elif business_type == "bakery":

        business_keywords.extend([
            "bakery",
            "baker",
            "bread",
            "cake"
        ])

    elif business_type == "dairy":

        business_keywords.extend([
            "dairy",
            "milk",
            "milk products",
            "milk processing",
            "paneer",
            "cheese"
        ])

    elif business_type == "food_manufacturing":

        business_keywords.extend([
            "food manufacturer",
            "food manufacturing",
            "manufacturing",
            "food processing"
        ])

    elif business_type == "textile":

        business_keywords.extend([
            "textile",
            "garment",
            "clothing",
            "fabric"
        ])

    elif business_type == "garment":

        business_keywords.extend([
            "garment",
            "textile",
            "clothing",
            "apparel",
            "fabric"
        ])

    elif business_type == "automobile":

        business_keywords.extend([
            "automobile",
            "automotive",
            "vehicle",
            "auto component"
        ])

    return business_keywords

        # -----------------------------
# MSME / UDYAM TOPIC SCORE
# -----------------------------

def get_msme_topic_score(question, document, source_file, text):
    """
    Give a relevance boost to the correct MSME/Udyam
    source document based on the user's question.

    This does NOT generate answers.
    It only improves retrieval.
    """

    question_lower = question.lower()
    document_lower = document.lower()
    source_lower = source_file.lower()
    text_lower = text.lower()

    score = 0

    # --------------------------------
    # CLASSIFICATION
    # --------------------------------

    classification_terms = [
        "classification",
        "classify",
        "micro",
        "small enterprise",
        "medium enterprise",
        "investment",
        "turnover",
        "threshold",
        "limit",
        "limits",
        "category",
        "categories"
    ]

    if any(term in question_lower for term in classification_terms):

        if (
            "classification" in document_lower
            or "classification" in source_lower
        ):
            score += 2.0

    # --------------------------------
    # UDYAM REGISTRATION
    # --------------------------------

    registration_terms = [
        "udyam registration",
        "registration process",
        "register",
        "registration",
        "aadhaar",
        "pan",
        "gstin",
        "certificate",
        "form",
        "renewal"
    ]

    if any(term in question_lower for term in registration_terms):

        if (
            "registration" in document_lower
            or "registration" in source_lower
            or "udyam" in document_lower
        ):
            score += 1.5

    # --------------------------------
    # UDYAM BENEFITS
    # --------------------------------

    benefit_terms = [
        "benefit",
        "benefits",
        "advantage",
        "advantages",
        "free",
        "paperless",
        "qr",
        "certificate"
    ]

    if any(term in question_lower for term in benefit_terms):

        if (
            "benefit" in document_lower
            or "benefit" in source_lower
        ):
            score += 2.0

    # --------------------------------
    # MSME SCHEMES
    # --------------------------------

    scheme_terms = [
        "scheme",
        "schemes",
        "subsidy",
        "credit",
        "loan",
        "support",
        "procurement",
        "cluster",
        "technology",
        "finance",
        "fund",
        "pmegp",
        "vishwakarma"
    ]

    if any(term in question_lower for term in scheme_terms):

        if (
            "scheme" in document_lower
            or "scheme" in source_lower
        ):
            score += 2.0

    return score
# -----------------------------
# INDUSTRY MAPPING
# -----------------------------

def get_expected_industry(industry):

    if not industry:
        return None

    industry_mapping = {

        "food": "Food Processing",

        "textile": "Textile",

        "automobile": "Automobile",

        "hospitality": "Hospitality"
    }

    return industry_mapping.get(
        industry.lower(),
        industry
    )


def is_location_or_site_query(question):

    return bool(
        re.search(
            r"\b(?:location|locations|site|sites|where|located)\b",
            question.lower()
        )
    )


# -----------------------------
# SEARCH KNOWLEDGE BASE
# -----------------------------

def search_knowledge_base(
    question,
    domain=None,
    business_type=None,
    industry=None
):

    # --------------------------------
    # LOAD CORRECT DOMAIN
    # --------------------------------

    if domain is None:

        # Backward compatibility:
        # If no domain is provided,
        # use FSSAI/Food.

        domain = "food"

    chunks = load_knowledge_base(
        domain
    )

    if not chunks:

        return []


    # --------------------------------
    # QUESTION EMBEDDING
    # --------------------------------

    question_embedding = (
        embedding_model.encode(
            question
        )
    )


    # --------------------------------
    # BUSINESS KEYWORDS
    # --------------------------------

    business_keywords = (
        get_business_keywords(
            business_type
        )
    )


    # --------------------------------
    # QUERY WORDS
    # --------------------------------

    query_words = set(
        question.lower().split()
    )

    question_lower = question.lower()

    location_or_site_query = (
        is_location_or_site_query(
            question
        )
    )


    # --------------------------------
    # EXPECTED INDUSTRY
    # --------------------------------

    expected_industry = (
        get_expected_industry(
            industry
        )
    )


    # --------------------------------
    # SEARCH EACH CHUNK
    # --------------------------------

    results = []

    for chunk in chunks:

        # Get chunk text FIRST

        text = chunk.get(
            "text",
            ""
        ).lower()

        document = chunk.get(
            "document",
            ""
        ).lower()

        source_file = chunk.get(
            "source_file",
            ""
        ).lower().replace("_", " ")


        # --------------------------------
        # INDUSTRY FILTER
        # --------------------------------


        if expected_industry:

            chunk_industry = (
                chunk.get(
                    "industry",
                    ""
                )
            )

            # "General" documents can apply
            # across multiple industries.
            #
            # MSME/Udyam documents are also
            # cross-industry documents.
            #
            # Therefore, do NOT apply the
            # industry filter to MSME/Udyam.

            if (
                domain not in ["msme", "udyam"]
                and chunk_industry
                and chunk_industry != "General"
                and chunk_industry != expected_industry
            ):
                continue
        # --------------------------------
        # SEMANTIC SCORE
        # --------------------------------

        if "embedding" not in chunk:

            continue

        chunk_embedding = np.array(
            chunk["embedding"]
        )

        semantic_score = (
            cosine_similarity(
                question_embedding,
                chunk_embedding
            )
        )


        # --------------------------------
        # GENERAL KEYWORD SCORE
        # --------------------------------

        keyword_matches = 0

        for word in query_words:

            if (
                len(word) > 2
                and word in text
            ):

                keyword_matches += 1

        if query_words:

            keyword_score = (
                keyword_matches /
                len(query_words)
            )

        else:

            keyword_score = 0


        # --------------------------------
        # BUSINESS TYPE SCORE
        # --------------------------------

        business_matches = 0

        for keyword in business_keywords:

            if keyword in text:

                business_matches += 1

        if business_keywords:

            business_score = (
                business_matches /
                len(business_keywords)
            )

        else:

            business_score = 0

        # --------------------------------
        # MSME / UDYAM TOPIC BOOST
        # --------------------------------

        msme_topic_score = 0

        if domain in ["msme", "udyam"]:

            msme_topic_score = get_msme_topic_score(
                question,
                document,
                source_file,
                text
        )
        # --------------------------------
        # SCHEME NAME BOOST
        # --------------------------------

        # PM MITRA is an official scheme name.  Preserve
        # exact-name intent so generic textile policy pages
        # do not outrank the dedicated scheme documents.

        scheme_score = 0

        if (
            "pm mitra" in question_lower
            and (
                "pm mitra" in text
                or "mitra" in document
            )
        ):
            scheme_score = 1


        # --------------------------------
        # LOCATION / SITE SOURCE BOOST
        # --------------------------------

        # When users ask where something is located, prioritize
        # documents explicitly labelled as sites/locations and
        # chunks that state selected sites. This remains generic
        # across schemes and domains; it does not supply answers.

        location_source_score = 0

        if location_or_site_query:

            location_query_terms = set(
                re.findall(
                    r"\b(?:site|sites|location|locations|park|parks)\b",
                    question_lower
                )
            )

            if re.search(
                r"\b(?:site|sites|location|locations)\b",
                document
            ):
                location_source_score = 2

            elif any(
                term in source_file
                for term in location_query_terms
            ):
                # A source filename such as "*_parks.pdf" or
                # "*_sites.pdf" is a strong, reusable relevance
                # signal for a location-oriented query.
                location_source_score = 1.5

            elif re.search(
                r"\b(?:sites?\s+selected|selected\s+sites?|park\s+sites?)\b",
                text
            ):
                location_source_score = 0.75


        # --------------------------------
        # FINAL SCORE
        # --------------------------------

        final_score = (

            0.55 * semantic_score

            +

            0.20 * keyword_score

            +

            0.25 * business_score

            +

            0.30 * scheme_score

            +

            0.40 * location_source_score

            +

            0.35 * msme_topic_score
        )


        results.append(
            (
                final_score,
                chunk
            )
        )


    # --------------------------------
    # SORT
    # --------------------------------

    results.sort(
        key=lambda x: x[0],
        reverse=True
    )


    # Location questions benefit from complementary source coverage:
    # do not let consecutive pages from one site/location document
    # crowd out other directly relevant location sources.

    if location_or_site_query:

        diverse_results = []
        source_counts = {}

        for score, chunk in results:

            source_key = chunk.get(
                "source_file",
                chunk.get("document", "Unknown")
            )

            if source_counts.get(source_key, 0) >= 2:
                continue

            diverse_results.append((score, chunk))
            source_counts[source_key] = (
                source_counts.get(source_key, 0) + 1
            )

            if len(diverse_results) == TOP_K:
                break

        return diverse_results


    return results[:TOP_K]


# -----------------------------
# BUILD CONTEXT
# -----------------------------

def build_context(results):

    context = ""

    for score, chunk in results:

        context += f"""
SOURCE:

Authority: {chunk.get("authority", "Unknown")}
Document: {chunk.get("document", "Unknown")}
Page: {chunk.get("page", "Unknown")}
Domain: {chunk.get("domain", "Unknown")}
Industry: {chunk.get("industry", "Unknown")}
Year: {chunk.get("year", "Unknown")}

CONTENT:

{chunk.get("text", "")}

--------------------------------
"""

    return context


# -----------------------------
# ASK GEMMA
# -----------------------------

def ask_gemma(
    question,
    context
):

    if not context.strip():

        return """Answer:
The available documents do not provide enough information to answer this question.

Important:
No relevant source content was retrieved.
"""


    prompt = f"""
You are UdyamSetu AI.

Your job is to help a business owner understand government
approval and compliance requirements using the provided
government source documents.

You MUST use the provided source content as the basis
of your answer.

USER QUESTION:

{question}


RETRIEVED SOURCE CONTENT:

{context}


IMPORTANT RULES:

1. Use ONLY the information contained in the
   retrieved source content.

2. Do NOT use outside knowledge.

3. Do NOT invent requirements, fees, thresholds,
   documents, authorities, deadlines, exemptions,
   or legal conditions.

4. Extract useful information from the sources even if
   the sources do not answer every part of the question.

5. Do NOT say "not enough information" if the sources
   contain relevant information that can answer part
   of the question.

6. If only part of the question can be answered,
   answer that part and clearly state what information
   is not available.

7. Pay attention to conditions and exceptions.

8. If a rule applies only to a particular category,
   clearly state that category.

9. Do not generalize a rule from one business category
   to another business category.

10. Do not claim that an approval is definitely required
    unless the source explicitly supports that conclusion.

11. Use cautious language such as:

    "The retrieved documents indicate..."

    "The source states..."

    "Based on the available documents..."

12. Do NOT create source metadata yourself.

13. Do NOT mention page numbers, document names,
    authorities, or years inside the answer unless
    they are explicitly present in the retrieved content.

14. The Python program will display verified source
    metadata separately.

15. Keep the answer simple and useful for a business owner.

16. If the sources contain a specific requirement
    relevant to the user's business activity, explain
    that requirement clearly.

17. Do not discuss information unrelated to the user's
    business activity unless it is an important exception.

18. If the retrieved documents belong to a specific
    regulatory domain, answer only using that domain's
    retrieved documents.

ANSWER FORMAT:

Answer:
<clear answer based only on retrieved source content>

Important:
<important condition, exception, or limitation>

"""


    # --------------------------------
    # RUN GEMMA
    # --------------------------------

    result = subprocess.run(
        [
            "ollama",
            "run",
            MODEL_NAME,
            prompt
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace"
    )


    if result.returncode != 0:

        return f"""Answer:
Unable to generate an answer from the local AI model.

Important:
{result.stderr.strip()}
"""


    return result.stdout.strip()


# -----------------------------
# DISPLAY VERIFIED SOURCES
# -----------------------------

def display_sources(results):

    print(
        "\n===== VERIFIED SOURCES ====="
    )


    if not results:

        print(
            "No relevant sources found."
        )

        return


    for i, (score, chunk) in enumerate(
        results,
        start=1
    ):

        print(
            f"\n{i}. "
            f"{chunk.get('document', 'Unknown')}"
        )

        print(
            f"   Authority: "
            f"{chunk.get('authority', 'Unknown')}"
        )

        print(
            f"   Domain: "
            f"{chunk.get('domain', 'Unknown')}"
        )

        print(
            f"   Page: "
            f"{chunk.get('page', 'Unknown')}"
        )

        print(
            f"   Industry: "
            f"{chunk.get('industry', 'Unknown')}"
        )

        print(
            f"   Year: "
            f"{chunk.get('year', 'Unknown')}"
        )

        print(
            f"   Similarity Score: "
            f"{score:.3f}"
        )


# -----------------------------
# MAIN
# -----------------------------

if __name__ == "__main__":

    print(
        "\n===== UDYAMSETU AI ====="
    )

    question = input(
        "\nAsk your question: "
    )


    # --------------------------------
    # Temporary standalone test
    # --------------------------------

    domain = input(
        "\nDomain (food/gst/textile/msme/udyam): "
    )


    results = search_knowledge_base(
        question,
        domain=domain
    )


    # --------------------------------
    # SHOW RETRIEVED SOURCES
    # --------------------------------

    print(
        "\nRetrieved Sources:"
    )


    if not results:

        print(
            "No relevant sources found."
        )

    else:

        for i, (score, chunk) in enumerate(
            results,
            start=1
        ):

            print(
                f"\n{i}. "
                f"Page {chunk.get('page', 'Unknown')} | "
                f"Score: {score:.3f}"
            )

            print(
                f"   Domain: "
                f"{chunk.get('domain', 'Unknown')}"
            )

            print(
                f"   Authority: "
                f"{chunk.get('authority', 'Unknown')}"
            )

            print(
                f"   Document: "
                f"{chunk.get('document', 'Unknown')}"
            )


    # --------------------------------
    # BUILD CONTEXT
    # --------------------------------

    context = build_context(
        results
    )


    # --------------------------------
    # ASK GEMMA
    # --------------------------------

    answer = ask_gemma(
        question,
        context
    )


    # --------------------------------
    # DISPLAY ANSWER
    # --------------------------------

    print(
        "\n===== ANSWER =====\n"
    )

    print(answer)


    # --------------------------------
    # DISPLAY VERIFIED SOURCES
    # --------------------------------

    display_sources(
        results
    )


    print(
        "\n=================="
    )
