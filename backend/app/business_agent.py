import re
import json
import subprocess


# =========================================================
# BUSINESS TYPE DETECTION
# =========================================================

def detect_business_type(description):

    text = description.lower()

    if any(word in text for word in [
        "restaurant",
        "cafe",
        "food outlet",
        "eatery"
    ]):
        return "restaurant"

    elif any(word in text for word in [
        "bakery",
        "baker",
        "bread",
        "cake"
    ]):
        return "bakery"

    elif any(word in text for word in [
        "dairy",
        "milk processing",
        "milk plant",
        "paneer",
        "cheese"
    ]):
        return "dairy"

    elif any(word in text for word in [
        "food manufacturing",
        "food manufacturing unit",
        "food factory",
        "food processing unit"
    ]):
        return "food_manufacturing"

    elif any(word in text for word in [
        "textile",
        "garment",
        "clothing manufacturing",
        "fabric manufacturing"
    ]):
        return "textile"

    elif any(word in text for word in [
        "automobile",
        "auto component",
        "vehicle manufacturing",
        "ev manufacturing"
    ]):
        return "automobile"

    return "unknown"


# =========================================================
# INDUSTRY DETECTION
# =========================================================

def detect_industry(business_type):

    if business_type in [
        "restaurant",
        "bakery",
        "dairy",
        "food_manufacturing"
    ]:
        return "food"

    elif business_type == "textile":
        return "textile"

    elif business_type == "automobile":
        return "automobile"

    return "unknown"


# =========================================================
# LOCATION DETECTION
# =========================================================

def detect_location(description):

    locations = [
        "Pune",
        "Mumbai",
        "Nashik",
        "Nagpur",
        "Thane",
        "Aurangabad",
        "Amravati"
    ]

    text = description.lower()

    for location in locations:

        if location.lower() in text:
            return location

    return None


# =========================================================
# BUDGET EXTRACTION
# =========================================================

def detect_budget(description):

    text = description.lower()

    # Examples:
    # ₹20 lakh
    # 20 lakh
    # 20 lakhs
    # 20 l
    # 20 crore
    # 2 cr

    lakh_match = re.search(
        r"(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|l)\b",
        text
    )

    if lakh_match:

        amount = float(
            lakh_match.group(1)
        )

        return int(
            amount * 100000
        )

    crore_match = re.search(
        r"(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b",
        text
    )

    if crore_match:

        amount = float(
            crore_match.group(1)
        )

        return int(
            amount * 10000000
        )

    # Direct rupee amount
    rupee_match = re.search(
        r"(?:₹|rs\.?|inr)\s*([\d,]+)",
        text
    )

    if rupee_match:

        amount = rupee_match.group(1).replace(
            ",",
            ""
        )

        return int(amount)

    return None


# =========================================================
# SCALE DETECTION
# =========================================================

def detect_scale(description):

    text = description.lower()

    if any(word in text for word in [
        "small",
        "small scale",
        "small-scale"
    ]):
        return "small"

    if any(word in text for word in [
        "medium",
        "medium scale",
        "medium-scale"
    ]):
        return "medium"

    if any(word in text for word in [
        "large",
        "large scale",
        "large-scale"
    ]):
        return "large"

    return None


# =========================================================
# SUBTYPE DETECTION
# =========================================================

def detect_subtype(description, business_type):

    text = description.lower()

    if business_type == "restaurant":
        if "cafe" in text:
            return "cafe"

        if "cloud kitchen" in text:
            return "cloud kitchen"

        return "restaurant"

    if business_type == "bakery":

        if "bread" in text:
            return "bread bakery"

        if "cake" in text:
            return "cake bakery"

        return "bakery"

    if business_type == "dairy":

        if "paneer" in text:
            return "paneer manufacturing"

        if "cheese" in text:
            return "cheese manufacturing"

        if "milk processing" in text:
            return "milk processing"

        return "dairy processing"

    if business_type == "textile":

        if "garment" in text:
            return "garment manufacturing"

        if "dyeing" in text:
            return "textile dyeing"

        if "weaving" in text:
            return "textile weaving"

        return "textile manufacturing"

    if business_type == "automobile":

        if "ev" in text:
            return "EV manufacturing"

        if "battery" in text:
            return "automotive battery"

        if "component" in text:
            return "auto components"

        return "automobile manufacturing"

    return None


# =========================================================
# ACTIVITY DETECTION
# =========================================================

def detect_activities(description, business_type):

    text = description.lower()

    activities = []

    if business_type == "restaurant":

        activities.append("food preparation")

        if "delivery" in text:
            activities.append("food delivery")

        if "dine" in text:
            activities.append("dine-in service")

        if "takeaway" in text:
            activities.append("takeaway service")

    elif business_type == "bakery":

        activities.append("food preparation")
        activities.append("baking")

        if "bread" in text:
            activities.append("bread production")

        if "cake" in text:
            activities.append("cake production")

    elif business_type == "dairy":

        activities.append("milk processing")

        if "paneer" in text:
            activities.append("paneer production")

        if "cheese" in text:
            activities.append("cheese production")

    elif business_type == "textile":

        activities.append("textile manufacturing")

        if "weaving" in text:
            activities.append("weaving")

        if "dyeing" in text:
            activities.append("dyeing")

        if "garment" in text:
            activities.append("garment manufacturing")

    elif business_type == "automobile":

        activities.append("automobile manufacturing")

        if "component" in text:
            activities.append("component manufacturing")

        if "battery" in text:
            activities.append("battery manufacturing")

        if "ev" in text:
            activities.append("EV manufacturing")

    return activities


# =========================================================
# MISSING INFORMATION
# =========================================================

def detect_missing_information(
    business_type,
    location,
    budget,
    scale,
    subtype
):

    missing = []

    if business_type == "unknown":
        missing.append("business type")

    if not subtype:
        missing.append("business subtype")

    if not location:
        missing.append("location")

    if budget is None:
        missing.append("budget")

    if not scale:
        missing.append("business scale")

    return missing


# =========================================================
# MAIN BUSINESS ANALYZER
# =========================================================

def analyze_business(description):

    business_type = detect_business_type(
        description
    )

    industry = detect_industry(
        business_type
    )

    location = detect_location(
        description
    )

    budget = detect_budget(
        description
    )

    scale = detect_scale(
        description
    )

    subtype = detect_subtype(
        description,
        business_type
    )

    activities = detect_activities(
        description,
        business_type
    )

    missing_information = detect_missing_information(
        business_type,
        location,
        budget,
        scale,
        subtype
    )

    return {
        "business_type": business_type,
        "business_subtype": subtype,
        "industry": industry,
        "location": location,
        "budget": budget,
        "scale": scale,
        "activities": activities,
        "missing_information": missing_information
    }


# =========================================================
# DISPLAY
# =========================================================

def display_business_profile(profile):

    print("\n================================")
    print("       BUSINESS PROFILE")
    print("================================")

    print(
        "\nBusiness Type:",
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


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    description = input(
        "\nDescribe your business idea: "
    )

    profile = analyze_business(
        description
    )

    display_business_profile(
        profile
    )
