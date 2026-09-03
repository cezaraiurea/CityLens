import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from recommender import load_dataset, get_recommendations

def load_test_profiles(path='test_data/test_profiles.csv'):
    df = pd.read_csv(path)
    profiles = []

    for _, row in df.iterrows():
        profiles.append({
            'name': row['name'],
            'preferences': {
                'culture': row['culture'],
                'adventure': row['adventure'],
                'nature': row['nature'],
                'beaches': row['beaches'],
                'nightlife': row['nightlife'],
                'cuisine': row['cuisine'],
                'wellness': row['wellness'],
                'urban': row['urban'],
                'seclusion': row['seclusion'],
                'budget': row['budget'],
                'duration': row['duration']
            },
            'expected': [city.strip() for city in row['expected'].split(',')]
        })
    return profiles


def calculate_precision(recommended, expected):
    recommended_cities = [r['city'] for r in recommended]
    relevant = sum(1 for city in recommended_cities if city in expected)
    return relevant / len(recommended_cities)


def calculate_recall(recommended, expected):
    recommended_cities = [r['city'] for r in recommended]
    relevant = sum(1 for city in recommended_cities if city in expected)
    return relevant / len(expected)


def calculate_f1(precision, recall):
    if precision + recall == 0:
        return 0
    return 2 * (precision * recall) / (precision + recall)


def evaluate_model():
    df, scaler = load_dataset('data/cities_europe.csv')
    profiles = load_test_profiles('test_data/test_profiles.csv')

    results = []

    print("\n=== EVALUARE MODEL CITYLENS AI ===\n")
    print(f"{'Profil':<25} {'Precision@8':<15} {'Recall@8':<12} {'F1 Score':<10}")
    print("-" * 65)

    for profile in profiles:
        recommended = get_recommendations(profile['preferences'], df, scaler, top_k=5)

        precision = calculate_precision(recommended, profile['expected'])
        recall = calculate_recall(recommended, profile['expected'])
        f1 = calculate_f1(precision, recall)

        results.append({
            'name': profile['name'],
            'precision': precision,
            'recall': recall,
            'f1': f1
        })

        print(f"{profile['name']:<25} {precision:<15.2f} {recall:<12.2f} {f1:<10.2f}")

    avg_precision = np.mean([r['precision'] for r in results])
    avg_recall = np.mean([r['recall'] for r in results])
    avg_f1 = np.mean([r['f1'] for r in results])

    print("-" * 65)
    print(f"{'MEDIA':<25} {avg_precision:<15.2f} {avg_recall:<12.2f} {avg_f1:<10.2f}")

    generate_charts(results, avg_precision, avg_recall, avg_f1)

    return results


def generate_charts(results, avg_precision, avg_recall, avg_f1):
    names = [r['name'] for r in results]
    precisions = [r['precision'] for r in results]
    recalls = [r['recall'] for r in results]
    f1_scores = [r['f1'] for r in results]

    x = np.arange(len(names))
    width = 0.25

    fig, axes = plt.subplots(1, 2, figsize=(18, 7))
    fig.suptitle('Evaluare Model CityLens AI', fontsize=14, fontweight='bold')

    axes[0].bar(x - width, precisions, width, label='Precision@5', color='#4CAF50')
    axes[0].bar(x, recalls, width, label='Recall@5', color='#2196F3')
    axes[0].bar(x + width, f1_scores, width, label='F1 Score', color='#FF9800')

    axes[0].set_xlabel('Profiluri de test')
    axes[0].set_ylabel('Scor (0-1)')
    axes[0].set_title('Metrici per profil')
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(names, rotation=45, ha='right', fontsize=8)
    axes[0].legend()
    axes[0].set_ylim(0, 1.2)

    metrics = ['Precision@5', 'Recall@5', 'F1 Score']
    averages = [avg_precision, avg_recall, avg_f1]
    colors = ['#4CAF50', '#2196F3', '#FF9800']

    bars = axes[1].bar(metrics, averages, color=colors, width=0.4)
    axes[1].set_ylabel('Scor mediu (0-1)')
    axes[1].set_title('Medii generale')
    axes[1].set_ylim(0, 1.2)

    for bar, val in zip(bars, averages):
        axes[1].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.02,
            f'{val:.2f}',
            ha='center', va='bottom', fontweight='bold'
        )

    plt.tight_layout()
    plt.savefig('evaluation_results.png', dpi=150, bbox_inches='tight')
    plt.show()
    print("\nGraficul a fost salvat ca evaluation_results.png")


if __name__ == "__main__":
    evaluate_model()