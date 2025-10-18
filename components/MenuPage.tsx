import React, { useState, useMemo } from 'react';
import { FoodItem, FoodType, FoodCategory } from '../types';
import FoodItemCard from './FoodItemCard';
import { SearchIcon } from './icons/Icons';

interface MenuPageProps {
    foodItems: FoodItem[];
    addToCart: (item: FoodItem) => void;
}

const allCategories = Object.values(FoodCategory);

const MenuPage: React.FC<MenuPageProps> = ({ foodItems, addToCart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ type: FoodType | 'all', category: FoodCategory | 'all', price: 'all' | 'asc' | 'desc' }>({
        type: 'all',
        category: 'all',
        price: 'all',
    });

    const filteredAndSortedItems = useMemo(() => {
        let items = [...foodItems];

        if (searchTerm) {
            items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (filters.type !== 'all') {
            items = items.filter(item => item.type === filters.type);
        }

        if (filters.category !== 'all') {
            const category = filters.category;
            items = items.filter(item => item.category.includes(category));
        }

        if (filters.price === 'asc') {
            items.sort((a, b) => a.price - b.price);
        } else if (filters.price === 'desc') {
            items.sort((a, b) => b.price - a.price);
        }

        return items;
    }, [foodItems, searchTerm, filters]);

    const animationKey = useMemo(() => {
        return searchTerm + JSON.stringify(filters);
    }, [searchTerm, filters]);

    const handleFilterChange = <T extends keyof typeof filters,>(key: T, value: (typeof filters)[T]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div>
            <div className="bg-card-bg dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-4xl font-bold text-secondary dark:text-gray-100 mb-4 text-center">Our Menu</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2 lg:col-span-1">
                         <input
                            type="text"
                            placeholder="Search for food..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 border border-border-divider dark:border-gray-600 rounded-md bg-neutral-bg dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <SearchIcon />
                        </div>
                    </div>
                    <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value as FoodType | 'all')} className="w-full p-3 border border-border-divider dark:border-gray-600 rounded-md bg-neutral-bg dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none">
                        <option value="all">All Types</option>
                        <option value={FoodType.VEG}>Veg</option>
                        <option value={FoodType.NON_VEG}>Non-Veg</option>
                    </select>
                    <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value as FoodCategory | 'all')} className="w-full p-3 border border-border-divider dark:border-gray-600 rounded-md bg-neutral-bg dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none">
                        <option value="all">All Categories</option>
                        {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select value={filters.price} onChange={(e) => handleFilterChange('price', e.target.value as 'all' | 'asc' | 'desc')} className="w-full p-3 border border-border-divider dark:border-gray-600 rounded-md bg-neutral-bg dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none">
                        <option value="all">Sort by Price</option>
                        <option value="asc">Price: Low to High</option>
                        <option value="desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            <div key={animationKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredAndSortedItems.length > 0 ? (
                    filteredAndSortedItems.map((item, index) => (
                        <FoodItemCard 
                            key={item.id} 
                            item={item} 
                            onAddToCart={addToCart} 
                            className="animate-card-pop-in"
                            style={{ animationDelay: `${Math.min(index * 60, 600)}ms`, animationFillMode: 'backwards' }}
                        />
                    ))
                ) : (
                    <p className="col-span-full text-center text-text-secondary text-lg">No items match your criteria.</p>
                )}
            </div>
        </div>
    );
};

export default MenuPage;