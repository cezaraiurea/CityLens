import { useState } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ onLocationFound }) => {
    const [query, setQuery] = useState('');

    const handleSearch = async(e) => {
        e.preventDefault();
        if(!query)
            return;

        try { 
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            const data = await response.json();

            if(data.length > 0) {
                onLocationFound([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                setQuery('');
            }
            else {
                alert('Location not found');
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    return (
        <form className="search-bar" onSubmit={handleSearch}>
            <input
               type="text"
               placeholder="Search for a city or place..."
               value={query}
               onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
               <Search size={17} />
            </button>
        </form>
    );
};

export default SearchBar;

