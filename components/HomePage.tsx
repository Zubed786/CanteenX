import React, { useState, useEffect } from 'react';
import { FoodItem, FoodCategory } from '../types';
import FoodItemCard from './FoodItemCard';
import { Page } from '../App';

interface HomePageProps {
    foodItems: FoodItem[];
    addToCart: (item: FoodItem) => void;
    navigate: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ foodItems, addToCart, navigate }) => {
    const specialDishes = foodItems.filter(item => item.category.includes(FoodCategory.SPECIAL));
    const popularDishes = foodItems.filter(item => item.category.includes(FoodCategory.POPULAR));

    const Slider: React.FC<{dishes: FoodItem[], title: string}> = ({dishes, title}) => {
        const [currentIndex, setCurrentIndex] = useState(0);

        useEffect(() => {
            if (dishes.length <= 1) return;
            const interval = setInterval(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % dishes.length);
            }, 5000);
            return () => clearInterval(interval);
        }, [dishes.length]);
        
        if (dishes.length === 0) return null;

        return (
            <div className="mb-16">
                <h2 className="text-4xl font-bold text-secondary dark:text-gray-200 mb-8 text-center">{title}</h2>
                <div className="relative w-full max-w-6xl mx-auto overflow-hidden">
                    <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {dishes.map((item) => (
                            <div key={item.id} className="w-full flex-shrink-0 flex justify-center p-4">
                                <div className="w-full max-w-sm">
                                    <FoodItemCard item={item} onAddToCart={addToCart} />
                                </div>
                            </div>
                        ))}
                    </div>
                    { dishes.length > 1 && <>
                        <button
                            onClick={() => setCurrentIndex((currentIndex - 1 + dishes.length) % dishes.length)}
                            className="absolute top-1/2 left-0 sm:left-4 transform -translate-y-1/2 bg-white/70 dark:bg-gray-800/70 p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 focus:outline-none transition-colors"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={() => setCurrentIndex((currentIndex + 1) % dishes.length)}
                            className="absolute top-1/2 right-0 sm:right-4 transform -translate-y-1/2 bg-white/70 dark:bg-gray-800/70 p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 focus:outline-none transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </>}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <div
                className="bg-cover bg-center h-[500px] rounded-2xl mb-12 flex items-center justify-center text-white relative overflow-hidden"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1470&auto=format&fit=crop')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
                <div className="relative bg-black bg-opacity-40 p-10 rounded-lg text-center backdrop-blur-sm">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Fast, Fresh & Flavorful</h1>
                    <p className="text-xl mb-8 drop-shadow-md">Pre-order your meals at CanteenX and skip the queue!</p>
                    <button
                        onClick={() => navigate('menu')}
                        className="bg-primary text-white font-bold py-4 px-10 text-lg rounded-full hover:bg-cta-hover transition-transform transform hover:scale-105 duration-300 shadow-xl"
                    >
                        Explore Menu
                    </button>
                </div>
            </div>
            
            <Slider dishes={specialDishes} title="Today's Specials" />
            <Slider dishes={popularDishes} title="Popular Dishes" />
        </div>
    );
};

export default HomePage;