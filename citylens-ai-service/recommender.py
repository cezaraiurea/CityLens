import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity

BUDGET_MAP = {
    'Budget': 1,
    'Mid-range': 2,
    'Luxury': 3
}

DURATION_MAP = {
    'Weekend': 1,
    'One week': 2,
    'Long trip': 3
}

FEATURE_COLUMNS = [
    'culture', 'adventure', 'nature', 'beaches',
    'nightlife', 'cuisine', 'wellness', 'urban', 'seclusion',
    'budget_num', 'duration_num'
]


def load_dataset(path='data/cities_europe.csv'):
    df = pd.read_csv(path)

    df['budget_num'] = df['budget_level'].map(BUDGET_MAP)

    def convert_duration(value):
        durations = value.split(',')
        max_val = 1
        for d in durations:
            d = d.strip().strip('"[]\'')
            mapped = DURATION_MAP.get(d, 1)
            if mapped > max_val:
                max_val = mapped
        return max_val

    df['duration_num'] = df['ideal_durations'].apply(convert_duration)

    scaler = MinMaxScaler()
    df[FEATURE_COLUMNS] = scaler.fit_transform(df[FEATURE_COLUMNS])

    return df, scaler


def build_user_vector(preferences, scaler):
    vector = [
        preferences.get('culture', 3),
        preferences.get('adventure', 3),
        preferences.get('nature', 3),
        preferences.get('beaches', 3),
        preferences.get('nightlife', 3),
        preferences.get('cuisine', 3),
        preferences.get('wellness', 3),
        preferences.get('urban', 3),
        preferences.get('seclusion', 3),
        preferences.get('budget', 2),
        preferences.get('duration', 2)
    ]

    user_df = pd.DataFrame([vector], columns=FEATURE_COLUMNS)
    vector_scaled = scaler.transform(user_df)
    return vector_scaled


def get_recommendations(preferences, df, scaler, top_k=5):
    user_vector = build_user_vector(preferences, scaler)

    city_vectors = df[FEATURE_COLUMNS].values

    scores = cosine_similarity(user_vector, city_vectors)[0]

    df = df.copy()
    df['score'] = scores

    top = df.nlargest(top_k, 'score')

    results = []
    for _, row in top.iterrows():
        results.append({
            'city': row['city'],
            'country': row['country'],
            'description': row['short_description'],
            'latitude': row['latitude'],
            'longitude': row['longitude'],
            'score': round(float(row['score']) * 100, 1),
            'safety': row['safety'],
            'best_months': row['best_months']
        })
    return results

