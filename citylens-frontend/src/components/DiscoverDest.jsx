import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import './DiscoverDest.css';

const CITIES = ['Paris', 'Barcelona', 'Amsterdam', 'New York', 'Marbella', 'Tokyo', 'Prague', 'Lisbon', 'Dubai', 'Buenos Aires'];

const DiscoverDest = ({ onStart }) => {
    const [cityIdx, setCityIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => { setCityIdx((i) => (i+1) % CITIES.length);}, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="discover-dest">
            <div className="discover-dest-inner">
                <div className="discover-dest-text">
                    <div className="discover-dest-kicker">
                        Destination finder
                    </div>
                    <h2 className="discover-dest-title">
                        Still not sure where to go?
                    </h2>
                    <div className="discover-dest-cycle">
                        Maybe&nbsp;
                        <span key={cityIdx} className="discover-dest-city">{CITIES[cityIdx]}</span>
                        &nbsp;?
                    </div>
                </div>

                <button className="discover-dest-btn" onClick={onStart}>
                    Let's start
                    <ArrowRight size={17} />
                </button>
            </div>
        </section>
    );
};

export default DiscoverDest;