from app import business_agent
from app import approval_agent
from app import rag

def clean_rag_results(results):
    cleaned = []

    for score, chunk in results:
        chunk_copy = chunk.copy()
        chunk_copy.pop("embedding", None)

        cleaned.append([
            score,
            chunk_copy
        ])

    return cleaned

def clean_approval_for_api(approval):
    return {
        "approval_name": approval.get("approval_name"),
        "authority": approval.get("authority"),
        "applicability": approval.get("applicability"),
        "conditions": approval.get("conditions", []),
        "status": approval.get("status"),

        "rag_domain": approval.get("rag_domain"),
        "rag_query": approval.get("rag_query"),
        "rag_answer": approval.get("rag_answer"),

        "sources": [
            {
                "document": chunk.get("document"),
                "page": chunk.get("page"),
                "authority": chunk.get("authority"),
                "source_url": chunk.get("source_url")
            }
            for score, chunk in approval.get("rag_results", [])
        ]
    }
# -----------------------------
# APPROVAL → RAG DOMAIN
# -----------------------------

def get_rag_domain(approval_name):

    approval_name_lower = approval_name.lower()

    if "fssai" in approval_name_lower:
        return "food"

    elif "gst" in approval_name_lower:
        return "gst"

    elif "textile" in approval_name_lower or "garment" in approval_name_lower:
        return "textile"

    # Future domains
    elif "udyam" in approval_name_lower:
        return "msme"

    elif "fire" in approval_name_lower:
        return "fire"

    elif "pollution" in approval_name_lower:
        return "pollution"

    return None


# -----------------------------
# SUPERVISOR
# -----------------------------

def process_business(business_description):

    # --------------------------------
    # 1. UNDERSTAND BUSINESS
    # --------------------------------

    business_profile = (
        business_agent.analyze_business(
            business_description
        )
    )

    business_type = (
        business_profile["business_type"]
    )

    industry = (
        business_profile["industry"]
    )

    location = (
        business_profile["location"]
    )

    subtype = (
        business_profile["business_subtype"]
    )

    activities = (
        business_profile["activities"]
    )

    scale = (
        business_profile["scale"]
    )


    # --------------------------------
    # 2. FIND RELEVANT APPROVALS
    # --------------------------------

    approvals = (
        approval_agent.get_relevant_approvals(
            business_type,
            industry
        )
    )


    # --------------------------------
    # 3. PROCESS EACH APPROVAL
    # --------------------------------

    for approval in approvals:

        approval_name = (
            approval["approval_name"]
        )


        # Generate approval-specific query

        rag_query = (
            approval_agent.get_approval_rag_query(
                approval_name,
                business_type,
                business_subtype=subtype,
                activities=activities,
                scale=scale,
                location=location
            )
        )


        # Save query

        approval["rag_query"] = rag_query


        # Determine knowledge domain

        domain = get_rag_domain(
            approval_name
        )

        approval["rag_domain"] = domain


        # --------------------------------
        # RAG SEARCH
        # --------------------------------

        if domain:

            search_results = (
                rag.search_knowledge_base(
                    rag_query,
                    domain=domain,
                    business_type=business_type,
                    industry=industry
                )
            )

            search_results = clean_rag_results(search_results)

        else:

            search_results = []


        # --------------------------------
        # BUILD CONTEXT
        # --------------------------------

        context = (
            rag.build_context(
                search_results
            )
        )


        # --------------------------------
        # ASK GEMMA
        # --------------------------------

        if domain:

            answer = (
                rag.ask_gemma(
                    rag_query,
                    context
                )
            )

        else:

            answer = """Answer:
No knowledge base is currently configured
for this approval.

Important:
This approval will be connected to its
knowledge base in a later implementation stage.
"""


        # --------------------------------
        # SAVE RAG RESULTS
        # --------------------------------

        approval["rag_results"] = (
            search_results
        )

        approval["rag_answer"] = answer


    # --------------------------------
    # RETURN COMPLETE RESULT
    # --------------------------------

    clean_approvals = [
        clean_approval_for_api(approval)
        for approval in approvals
    ]

    return {
        "business_description": business_description,
        "business_profile": business_profile,
        "industry": industry,
        "business_type": business_type,
        "location": location,
        "approvals": clean_approvals
    }


# -----------------------------
# DISPLAY RESULT
# -----------------------------

def display_result(result):

    print(
        "\n================================"
    )

    print(
        "          UDYAMSETU AI"
    )

    print(
        "================================"
    )


    # -------------------------
    # BUSINESS
    # -------------------------

    print("\nBusiness:")

    print(
        result["business_description"]
    )


    # -------------------------
    # BUSINESS PROFILE
    # -------------------------

    profile = (
        result["business_profile"]
    )

    print("\nBusiness Profile:")

    print(
        "--------------------------------"
    )

    print(
        "Business Type:",
        profile["business_type"]
    )

    print(
        "Business Subtype:",
        profile["business_subtype"]
    )

    print(
        "Industry:",
        profile["industry"]
    )

    print(
        "Location:",
        profile["location"]
    )

    print(
        "Budget:",
        profile["budget"]
    )

    print(
        "Scale:",
        profile["scale"]
    )

    print(
        "Activities:",
        profile["activities"]
    )

    print(
        "Missing Information:",
        profile["missing_information"]
    )


    # -------------------------
    # APPROVALS
    # -------------------------

    print("\nPossible Approvals:")

    print(
        "--------------------------------"
    )


    if not result["approvals"]:

        print(
            "No matching approvals found."
        )

        return


    for i, approval in enumerate(
        result["approvals"],
        start=1
    ):

        print(
            f"\n{i}. "
            f"{approval['approval_name']}"
        )

        print(
            f"   Authority: "
            f"{approval['authority']}"
        )

        print(
            f"   Applicability: "
            f"{approval.get('applicability', 'Not specified')}"
        )

        print(
            f"   RAG Domain: "
            f"{approval.get('rag_domain', 'Not configured')}"
        )

        print(
            f"   RAG Query: "
            f"{approval.get('rag_query', 'Not generated')}"
        )


        # -------------------------
        # AI ANSWER
        # -------------------------

        print(
            "\n   AI Information:"
        )

        print(
            "   ----------------------------"
        )

        print(
            approval.get(
                "rag_answer",
                "No answer generated."
            )
        )


        # -------------------------
        # RAG SOURCES
        # -------------------------

        print(
            "\n   RAG Sources:"
        )

        sources = approval.get(
            "rag_results",
            []
        )


        if not sources:

            print(
                "   No RAG sources found."
            )

        else:

            for j, (score, chunk) in enumerate(
                sources,
                start=1
            ):

                print(
                    f"\n   {j}. "
                    f"Page {chunk.get('page', 'Unknown')} "
                    f"| Score: {score:.3f}"
                )

                print(
                    f"      Domain: "
                    f"{chunk.get('domain', 'Unknown')}"
                )

                print(
                    f"      Authority: "
                    f"{chunk.get('authority', 'Unknown')}"
                )

                print(
                    f"      Document: "
                    f"{chunk.get('document', 'Unknown')}"
                )

                print(
                    f"      Industry: "
                    f"{chunk.get('industry', 'Unknown')}"
                )


# -----------------------------
# MAIN
# -----------------------------

if __name__ == "__main__":

    business_description = input(
        "\nDescribe your business idea: "
    )

    result = process_business(
        business_description
    )

    display_result(
        result
    )
