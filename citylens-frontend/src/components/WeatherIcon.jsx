import { motion } from 'framer-motion';
import { Sun, CloudRain, Cloud, Moon } from 'lucide-react';

const WeatherIcon = ({ weatherType, isCurrentlyRaining, localHour }) => {
    const isNightTime = localHour >= 22 || localHour < 5;

    const entranceAnimation = {
        start: { scale: 0, rotate: -180 },
        end: { scale: 1, rotate: 0 },
    };

    const chooseCurrentIcon = () => {
        if (isCurrentlyRaining) {
            return <CloudRain color="#60a5fa" size={48} />;
        }
        if (isNightTime && weatherType === 'Clear') {
            return <Moon color="#f1f5f9" size={48} fill="#f1f5f9" />;
        }
        if (weatherType === 'Clouds') {
            return <Cloud color="#94a3b8" size={48} />;
        }
        if (weatherType === 'Fog' || weatherType === 'Mist' || weatherType === 'Haze') {
        return <Cloud color="#94a3b8" size={48} />;
        }
        return (
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            >
                <Sun color="#fbbf24" size={48} />
            </motion.div>
        );
    };

    return (
        <motion.div
            key={`${weatherType}-${isNightTime}`}
            variants={entranceAnimation}
            initial="start"
            animate="end"
            transition={{ type: "spring", stiffness: 200 }}
        >
            {chooseCurrentIcon()}
        </motion.div>
    );
};

export default WeatherIcon;