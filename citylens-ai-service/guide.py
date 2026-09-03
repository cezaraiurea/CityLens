import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_city_guide(city, country, traveler_type):
    profile = traveler_type if traveler_type else "traveler"

    prompt = f"""Ești un ghid turistic prietenos și inteligent.
    Scrie o scurtă introducere de bun venit (4-5 propoziții) despre {city}, {country}
    pentru un călător al cărui stil este "{profile}". Prima propoziție să fie de "bunvenit în"
    si numele orasului, atat, nu ai voie sa zici de tipul de călător,
    iar restul direct la subiect despre orașul respectiv, exemple de locuri renumite, 
    care îl disting.
    Adaptează tonul și accentul în funcție de tipul de călător.
    Vorbește direct cu călătorul, spune ca o poveste totul. Nu folosi liste sau markdown, doar text cu fraze.
    Scrie în limba română."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content


def generate_tip(city, context):
    prompt = f"""Ești un ghid local pentru {city}. {context}
    Răspunde DOAR cu numele unui singur loc real din {city} fără explicații, fără punct final."""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()


def generate_top_attractions(city, country=""):
    prompt = f"""Listează exact 5 atracții turistice principale din {city}, {country}.
    Răspunde DOAR cu numele lor, exact așa cum sunt acolo cunoscute în {city}, nu traduce
    numele în română. Scrie-le separate prin virgulă, fără numerotare, fără explicații, fără
    punct final. De exemplu: Sagrada Familia, Park Guell, Casa Batllo, Gothic Quarter"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.choices[0].message.content.strip()
    attractions = [a.strip() for a in text.split(",") if a.strip()]
    return attractions[:5]

