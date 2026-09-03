const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;

export const fetchCityImage = async(cityName, size = 'small') => {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityName)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_KEY}`
        );
        const data = await response.json();

        if(data.results && data.results.length > 0) {
            const photo = data.results[0];
            
            if(size==='hero') {
                return `${photo.urls.raw}&w=1800&q=80&fit=crop`;
            }
            return photo.urls[size];
        }
        return null;
    }
    catch (error) {
        console.error('Unsplash error:', error);
        return null;
    }
};