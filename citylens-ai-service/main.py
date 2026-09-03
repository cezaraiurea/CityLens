from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from classifier import train_classifier, classify_traveler
from recommender import load_dataset, get_recommendations
from guide import generate_city_guide, generate_tip, generate_top_attractions

app = FastAPI(title="CityLens AI Service")

df, scaler = load_dataset('data/cities_europe.csv')
classifier_model = train_classifier('data/training_data.csv')

class QuizRequest(BaseModel):
    culture: int = 3
    adventure: int = 3
    nature: int = 3
    beaches: int = 3
    nightlife: int = 3
    cuisine: int = 3
    wellness: int = 3
    urban: int = 3
    seclusion: int = 3
    budget: int = 2
    duration: int = 2

class GuideRequest(BaseModel):
    city: str
    country: str =""
    travelerType: str =""

class TipRequest(BaseModel):
    city: str
    context: str

class AttractionsRequest(BaseModel):
    city: str
    country: str=""

@app.get("/health")
def health():
    return {"status": "ok", "message": "CityLens AI Service is running"}

@app.post("/api/ai/recommendations")
def recommend(request: QuizRequest):
    preferences = {
        'culture': request.culture,
        'adventure': request.adventure,
        'nature': request.nature,
        'beaches': request.beaches,
        'nightlife': request.nightlife,
        'cuisine': request.cuisine,
        'wellness': request.wellness,
        'urban': request.urban,
        'seclusion': request.seclusion,
        'budget': request.budget,
        'duration': request.duration
    }

    results = get_recommendations(preferences, df, scaler)
    traveler_type = classify_traveler(preferences, classifier_model)

    return {
        "status": "success",
        "traveler_type": traveler_type,
        "recommendations": results
    }

@app.post("/api/ai/city-guide")
def city_guide(request: GuideRequest):
    text = generate_city_guide(request.city, request.country, request.travelerType)
    return {"status": "success", "text": text}

@app.post("/api/ai/tip")
def tip(request: TipRequest):
    text = generate_tip(request.city, request.context)
    return {"status": "success", "text": text}

@app.post("/api/ai/top-attractions")
def top_attractions(request: AttractionsRequest):
    attractions = generate_top_attractions(request.city, request.country)
    return {"status": "success", "attractions": attractions}