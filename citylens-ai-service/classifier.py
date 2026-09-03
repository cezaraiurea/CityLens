import pandas as pd
from sklearn.ensemble import RandomForestClassifier

FEATURE_COLUMNS = ['culture', 'adventure', 'nature', 'beaches', 'nightlife',
                   'cuisine', 'wellness', 'urban', 'seclusion', 'budget', 'duration']

def train_classifier(path='data/training_data.csv'):
    df = pd.read_csv(path)
    X = df[FEATURE_COLUMNS]
    y = df['traveler_type']

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        random_state=42
    )
    model.fit(X, y)
    return model

def classify_traveler(preferences, model):
    row = [[preferences[f] for f in FEATURE_COLUMNS]]
    return model.predict(row)[0]

