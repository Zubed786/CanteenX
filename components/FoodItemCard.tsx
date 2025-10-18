import React from 'react';
import { FoodItem, FoodType } from '../types';
import { StarIcon, VegIcon, NonVegIcon, CartIcon } from './icons/Icons';

interface FoodItemCardProps {
    item: FoodItem;
    onAddToCart: (item: FoodItem) => void;
    className?: string;
    style?: React.CSSProperties;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onAddToCart, className, style }) => {
    return (
        <div 
            style={style}
            className={`bg-card-bg dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl overflow-hidden flex flex-col h-full transform hover:-translate-y-2 transition-all duration-300 group ${className || ''}`}
        >
            <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-52 object-cover" />
                <div className={`absolute top-3 right-3 p-1.5 rounded-full ${item.type === FoodType.VEG ? 'bg-green-100/80' : 'bg-red-100/80'} backdrop-blur-sm`}>
                    {item.type === FoodType.VEG ? <VegIcon /> : <NonVegIcon />}
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2">
                    <h3 className="text-xl font-bold text-secondary dark:text-gray-100 truncate">{item.name}</h3>
                </div>
                <p className="text-text-secondary dark:text-gray-400 text-sm mb-4 flex-grow">{item.description}</p>
                
                <div className="flex justify-between items-center text-xs text-text-secondary dark:text-gray-400 mb-4">
                    <span>{item.nutrition.calories} kcal</span>
                    <span>Protein: {item.nutrition.protein}g</span>
                    <span>Carbs: {item.nutrition.carbs}g</span>
                </div>

                <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center space-x-1">
                        <StarIcon />
                        <span className="text-highlight font-bold text-base">{item.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-2xl font-extrabold text-primary dark:text-cta-hover">${item.price.toFixed(2)}</span>
                </div>
                 <button
                    onClick={() => onAddToCart(item)}
                    disabled={!item.inStock}
                    className={`w-full mt-4 py-3 px-4 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        item.inStock 
                        ? 'bg-primary hover:bg-cta-hover shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    }`}
                >
                    {item.inStock ? 
                        (<> <CartIcon size='sm' /> <span>Add to Cart</span> </>) : 
                        'Out of Stock'
                    }
                </button>
            </div>
        </div>
    );
};

export default FoodItemCard;