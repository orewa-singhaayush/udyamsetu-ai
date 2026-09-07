from fastapi import FastAPI
from pydantic import BaseModel

from app.supervisor import process_business


# --------------------------------
# FASTAPI APP
# --------------------------------

app = FastAPI(
    title="UdyamSetu AI",
    description="AI-powered business approval assistance system",
    version="1.0.0"
)


# --------------------------------
# REQUEST MODEL
# --------------------------------

class BusinessRequest(BaseModel):
    business_description: str


# --------------------------------
# HEALTH CHECK
# --------------------------------

@app.get("/")
def root():
    return {
        "message": "UdyamSetu AI API is running"
    }


# --------------------------------
# ANALYZE BUSINESS
# --------------------------------

@app.post("/api/analyze-business")
def analyze_business(request: BusinessRequest):

    result = process_business(
        request.business_description
    )

    return result
