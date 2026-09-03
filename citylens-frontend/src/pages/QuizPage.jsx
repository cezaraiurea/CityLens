import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { fetchQuizResults } from '../services/quizService';
import { fetchCityImage } from '../services/unsplashService';
import './QuizPage.css';

const QUESTIONS = [
    {
        q: "What attracts you most to a destination?",
        options: [
            { label: "Culture & history", set: { culture: 5, urban: 4, beaches: 1 } },
            { label: "Beaches & relaxation", set: { beaches: 5, wellness: 4, urban: 1, seclusion: 4 } },
            { label: "Adventure & nature", set: { adventure: 5, nature: 5, seclusion: 4, beaches: 1 } },
            { label: "City life & food", set: { urban: 4, cuisine: 5, nightlife: 3, culture: 4 } },
        ]
    },
    {
        q: "What does a perfect evening look like?",
        options: [
            { label: "Fine dining", set: { cuisine: 5, culture:4, urban:4, nightlife: 3, wellness: 2, seclusion: 1} },
            { label: "Bars & nightlife", set: { nightlife: 5, cuisine: 3 } },
            { label: "Quiet & cozy", set: { nightlife: 1, wellness: 4, seclusion: 4 } },
            { label: "Cultural events", set: { culture: 4, nightlife: 2 } },
        ]
    },
    {
        q: "How much does nature matter to you?",
        options: [
            { label: "Essential", set: { nature: 5, adventure: 4 } },
            { label: "A nice bonus", set: { nature: 3 } },
            { label: "I prefer the city", set: { nature: 1, urban: 4 } },
        ]
    },
    {
        q: "Crowds or solitude?",
        options: [
            { label: "Busy and lively", set: { urban: 5, seclusion: 1 } },
            { label: "A bit of both", set: { urban: 3, seclusion: 3 } },
            { label: "Quiet and peaceful", set: { urban: 1, seclusion: 5 } },
        ]
    },
    {
        q: "How important is wellness & relaxation?",
        options: [
            { label: "Very important", set: { wellness: 5, adventure: 2 } },
            { label: "It's nice to have", set: { wellness: 3 } },
            { label: "I prefer action", set: { wellness: 1, adventure: 4 } },
        ]
    },
    {
        q: "What's your budget?",
        options: [
            { label: "Budget-friendly", set: { budget: 1 } },
            { label: "Mid-range", set: { budget: 2 } },
            { label: "Luxury", set: { budget: 3 } },
        ]
    },
    {
        q: "How long is your trip?",
        options: [
            { label: "A weekend", set: { duration: 1 } },
            { label: "About a week", set: { duration: 2 } },
            { label: "Longer than a week", set: { duration: 3 } },
        ]
    },
    {
    q: "Who are you traveling with?",
    options: [
        { label: "Solo", set: { seclusion: 4 } },
        { label: "With my partner", set: { wellness: 4, cuisine: 4, nightlife: 2 } },
        { label: "With friends", set: { nightlife: 5, urban: 4 } },
        { label: "With family", set: { wellness: 4, nightlife: 1, adventure: 2 } },
    ]
    },
];

const DEFAULTS = {
    culture: 3, adventure: 3, nature: 3, beaches: 3, nightlife: 3,
    cuisine: 3, wellness: 3, urban: 3, seclusion: 3, budget: 2, duration: 2
};

const TRAVELER_PROFILES = {
    "Beach Lover":       "You live for sun, sand and the sound of the waves.",
    "Culture Seeker":    "Museums, history and local traditions are your thing.",
    "Adventure Seeker":  "You are always chasing your next big adventure.",
    "Luxury Traveler":   "You enjoy the finer things and effortless comfort.",
    "Nature Lover":      "Forests, mountains and fresh air are your escape.",
    "Foodie":            "You travel one delicious bite at a time.",
    "Party Seeker":      "Nightlife, music and good company keep you going.",
    "Wellness Seeker":   "You crave calm, balance and time to recharge.",
    "Urban Explorer":    "You thrive in the buzz of big, vibrant cities.",
    "Budget Backpacker": "You go far, see more and spend smart.",
    "Romantic Couple":   "You love charming, intimate getaways for two.",
    "Solo Traveler":     "You travel your own way, at your own pace.",
    "History Buff":      "Ancient ruins and old stories fascinate you.",
    "Island Hopper":     "You drift from one island paradise to the next.",
    "Mountain Lover":    "Peaks, trails and crisp air call your name.",
    "Digital Nomad":     "You work from anywhere and call the world home.",
    "Cozy Traveler":     "You seek charm, calm and slow, beautiful days.",
    "Art Lover":         "Galleries, architecture and beauty inspire you.",
    "City Breaker":      "You love quick, lively escapes to great cities.",
    "Luxury Adventurer": "You want thrill and comfort in equal measure.",
    "Ultra Budget":      "You prove the best trips don't cost a fortune.",
    "Ultra Luxury":      "You expect the finest in everything you experience.",
};

const CityCard = ({ city, index, onSelect }) => {
    const[img, setImg] = useState(null);

    useEffect(() => {
        fetchCityImage(city.city).then(setImg);
    }, [city.city]);

    return (
        <div
            className={`quiz-city-card ${index === 0 ? 'top' : ''}`}
            onClick={onSelect}
        >
            <div className="quiz-city-photo">
                {img ? <img src={img} alt={city.city} /> : <div className="quiz-city-photo-empty" />}
            </div>
            <div className="quiz-city-info">
                <div className="quiz-city-name">{city.city}, <span>{city.country}</span></div>
                <div className="quiz-city-desc">{city.description}</div> 
            </div>
            <div className="quiz-city-score">{city.score}%</div>
        </div>
    );
};

const QuizPage = () => {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});   
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const totalQ = QUESTIONS.length;
    const selectedOption = answers[currentQ];

    const selectOption = (optIdx) => { 
        const newAnsers = {...answers, [currentQ]: optIdx} ;
        setAnswers(newAnsers);

        setTimeout(() => {
            if(currentQ < totalQ-1) {
                setCurrentQ(currentQ + 1);

            }
            else {
                finishQuiz(newAnsers);
            }
        }, 350);
    };

    const finishQuiz = async (finalAnswers) => {
        setLoading(true);
        let prefs = { ...DEFAULTS};
        QUESTIONS.forEach((question, qIdx) => {
            const optIdx = finalAnswers[qIdx];
            if(optIdx !== undefined) {
                prefs = { ...prefs, ...question.options[optIdx].set};
            }
        });
        const data = await fetchQuizResults(prefs);
        setResult(data);
        setLoading(false);
    }

 
    const handleBack = () => {
        if (currentQ > 0) setCurrentQ(currentQ - 1);
    };

    const restart = () => {
        setAnswers({});
        setCurrentQ(0);
        setResult(null);
    };
 
    if (loading) {
        return (
            <div className="quiz-page">
                <div className="quiz-loading">Finding your perfect destinations...</div>
            </div>
        );
    }
 
    if (result) {
        return (
            <div className="quiz-page">
                <div className="quiz-results">
                    <div className="quiz-results-kicker">You are a</div>
                    <h1 className="quiz-results-type">{result.traveler_type}</h1>
                    <p className="quiz-results-desc">{TRAVELER_PROFILES[result.traveler_type]}</p>

                    <div className="quiz-results-label">Your top destinations</div>
                    <div className="quiz-results-list">
                        {result.recommendations.map((city, i) => (
                            <CityCard 
                              key={i}
                              city={city}
                              index={i}
                              onSelect={() => navigate('/plan', 
                                { state: {
                                    city: city.city,
                                    country: city.country,
                                    lat: city.latitude,
                                    lng: city.longitude,
                                    travelerType: result.traveler_type,
                                    description: city.description,
                                    safety: city.safety,
                                    bestMonths: city.best_months
                                 }
                                })}
                            />
                        ))}        
                    </div>

                    <div className="quiz-results-actions">
                        <button className="quiz-btn-ghost" onClick={restart}>Retake quiz</button>
                        <button className="quiz-btn-primary" onClick={() => navigate('/home')}>Back to map</button>
                    </div>
                </div>
            </div>
        );
    }
 
    const question = QUESTIONS[currentQ]; 

    return (
        <div className="quiz-page">
            <div className="quiz-topbar">
                {currentQ > 0 ? (
                    <button className="quiz-back" onClick={handleBack}><ArrowLeft size={18} /> Back</button>
                ) : <div />}

                <div className="quiz-dots">
                    {QUESTIONS.map((_, i) => (
                        <span key={i} className={`quiz-dot ${i <= currentQ ? 'active' : ''}`} />
                    ))}
                    <span className="quiz-counter">{currentQ + 1} of {totalQ}</span>
                </div>

                <button className="quiz-close" onClick={() => navigate('/home')}><X size={20} /></button>
            </div>

            <div className="quiz-progress">
                <div className="quiz-progress-bar" style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }} />
            </div>

            <div className="quiz-body">
                <div className="quiz-kicker">Question {currentQ + 1}</div>
                <h2 className="quiz-question">{question.q}</h2>

                <div className="quiz-options">
                    {question.options.map((opt, i) => (
                        <button
                            key={i}
                            className={`quiz-option ${selectedOption === i ? 'selected' : ''}`}
                            onClick={() => selectOption(i)}
                        > 
                            <span className="quiz-option-label">{opt.label}</span>
                        </button>
                    ))}
                </div> 
            </div>
        </div>
    );
};

export default QuizPage;