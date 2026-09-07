import json

# -----------------------------
# CONFIG
# -----------------------------

FOOD_APPROVALS_PATH = "data/approvals/food_approvals.json"
HOSPITALITY_APPROVALS_PATH = "data/approvals/hospitality_approvals.json"
TEXTILE_APPROVALS_PATH = "data/approvals/textile_approvals.json"


# -----------------------------
# LOAD APPROVAL DATABASE
# -----------------------------

from pathlib import Path

def load_approvals(file_path):
    path = Path(file_path)
    if not path.exists():
        base_dir = Path(__file__).resolve().parent.parent
        path = base_dir / file_path
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# -----------------------------
# DETECT BUSINESS TYPE
# -----------------------------

def detect_business_type(description):

    text = description.lower()

    # Dairy
    if any(word in text for word in [
        "dairy",
        "milk",
        "paneer",
        "cheese",
        "curd",
        "ghee"
    ]):
        return "dairy"

    # Bakery
    if any(word in text for word in [
        "bakery",
        "bread",
        "cake",
        "biscuit"
    ]):
        return "bakery"

    # Restaurant
    if any(word in text for word in [
        "restaurant",
        "cafe",
        "food shop",
        "food service"
    ]):
        return "restaurant"

    # Hotel
    if any(word in text for word in [
        "hotel",
        "resort",
        "lodge"
    ]):
        return "hotel"

    # Food manufacturing
    if any(word in text for word in [
        "food processing",
        "food manufacturing",
        "food factory"
    ]):
        return "food_manufacturing"

    return "unknown"


# -----------------------------
# DETECT INDUSTRY
# -----------------------------

def detect_industry(business_type):

    food_businesses = [
        "dairy",
        "bakery",
        "restaurant",
        "food_manufacturing"
    ]

    hospitality_businesses = [
        "hotel",
        "resort",
        "lodge"
    ]

    textile_businesses = [
        "textile",
        "garment"
    ]

    if business_type in food_businesses:
        return "food"

    if business_type in hospitality_businesses:
        return "hospitality"

    if business_type in textile_businesses:
        return "textile"

    return "unknown"
# -----------------------------
# DETECT LOCATION
# -----------------------------

def detect_location(description):

    text = description.lower()

    locations = {
        "pune": "Pune",
        "mumbai": "Mumbai",
        "nagpur": "Nagpur",
        "nashik": "Nashik",
        "thane": "Thane",
        "aurangabad": "Aurangabad"
    }

    for keyword, location in locations.items():

        if keyword in text:
            return location

    return "Unknown"


# -----------------------------
# GET RELEVANT APPROVALS
# -----------------------------

def get_relevant_approvals(
    business_type,
    industry
):

    if industry == "food":

        approvals = load_approvals(
            FOOD_APPROVALS_PATH
        )

    elif industry == "hospitality":

        approvals = load_approvals(
            HOSPITALITY_APPROVALS_PATH
        )

    elif industry == "textile":

        approvals = load_approvals(
            TEXTILE_APPROVALS_PATH
        )

    else:

        return []

    relevant_approvals = []

    for approval in approvals:

        if business_type in approval["business_types"]:

            relevant_approvals.append(approval)

    return relevant_approvals

def get_approval_rag_query(
    approval_name,
    business_type,
    business_subtype=None,
    activities=None,
    scale=None,
    location=None
):

    approval_name_lower = approval_name.lower()

    subtype_text = business_subtype or business_type

    activities_text = ""

    if activities:
        activities_text = (
            f" Activities: {', '.join(activities)}."
        )

    scale_text = ""

    if scale:
        scale_text = f" Scale: {scale}."

    location_text = ""

    if location:
        location_text = f" Location: {location}."

    if "fssai" in approval_name_lower:

        return (
            f"FSSAI licensing and registration requirements "
            f"for {subtype_text}."
            f"{activities_text}"
            f"{scale_text}"
        )

    elif "gst" in approval_name_lower:

        return (
            f"GST registration requirements "
            f"for {subtype_text}."
            f"{activities_text}"
        )

    elif "udyam" in approval_name_lower:

        return (
            f"Udyam registration requirements "
            f"for {subtype_text}."
            f"{activities_text}"
            f"{scale_text}"
        )

    elif "fire" in approval_name_lower:

        scale_word = scale or "business"

        return (
            f"Fire safety approval and NOC requirements "
            f"for a {scale_word} {subtype_text} business."
            f"{location_text}"
        )

    elif "pollution" in approval_name_lower:

        return (
            f"Pollution control consent requirements "
            f"for {subtype_text}."
            f"{activities_text}"
            f"{scale_text}"
            f"{location_text}"
        )

    elif "textile" in approval_name_lower or "garment" in approval_name_lower:

        return (
            f"Textile and garment schemes, infrastructure, and policy support "
            f"for {subtype_text}."
            f"{activities_text}"
            f"{scale_text}"
            f"{location_text}"
        )

    else:

        return (
            f"{approval_name} requirements "
            f"for {subtype_text}."
            f"{activities_text}"
            f"{scale_text}"
            f"{location_text}"
        )
# -----------------------------
# DISPLAY RESULT
# -----------------------------

def display_result(business_description):

    business_type = detect_business_type(
        business_description
    )

    industry = detect_industry(
        business_type
    )

    location = detect_location(
        business_description
    )

    approvals = get_relevant_approvals(
        business_type,
        industry
    )

    print("\n================================")
    print("       UDYAMSETU AI")
    print("================================")

    print("\nBusiness idea:")
    print(business_description)

    print("\nIndustry:")
    print(industry)

    print("\nBusiness type:")
    print(business_type)

    print("\nLocation:")
    print(location)

    print("\nPossible approvals:\n")

    if not approvals:

        print(
            "No matching approvals found."
        )

        return

    for i, approval in enumerate(
        approvals,
        start=1
    ):

        print(
            f"{i}. {approval['approval_name']}"
        )

        print(
            f"   Authority: "
            f"{approval['authority']}"
        )

        print(
            f"   Applicability: "
            f"{approval['applicability']}"
        )

        print(
            f"   Conditions: "
            f"{'; '.join(approval['conditions'])}"
        )

        print(
            f"   Source: "
            f"{approval['source']}"
        )

        print()


# -----------------------------
# MAIN
# -----------------------------

if __name__ == "__main__":

    business_description = input(
        "\nDescribe your business idea: "
    )

    display_result(
        business_description
    )
