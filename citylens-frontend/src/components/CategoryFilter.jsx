import { LayoutGrid, Coffee, Utensils, TreePine, Landmark, Wine, Cookie } from 'lucide-react';
import './CategoryFilter.css';

const categories = [
    { id: null, name: 'All', icon: LayoutGrid },
    { id: 1, name: 'Cafes', icon: Coffee },
    { id: 3, name: 'Restaurants', icon: Utensils },
    { id: 10, name: 'Parks', icon: TreePine },
    { id: 6, name: 'Museums', icon: Landmark },
    { id: 2, name: 'Bars', icon: Wine },
    { id: 4, name: 'Bakeries', icon: Cookie },
]; 

const CategoryFilter = ({ activeCategoryId, onSelectCategory }) => {
    return (
        <div className="category-filter-container">
            {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategoryId === category.id;

                return (
                    <button
                       key={category.id || 'all'}
                       className={`category-pill ${isActive ? 'active' : ''}`}
                       onClick={() => {
                        if (category.id === null) {
                            onSelectCategory(activeCategoryId === null ? 'none' : null);
                        }
                        else {
                            onSelectCategory(category.id);
                        }
                    }}
                    >
                        <Icon size={15} />
                        <span>{category.name}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryFilter;