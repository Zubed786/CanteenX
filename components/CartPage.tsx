import React, { useState } from 'react';
import { CartItem } from '../types';
import { TrashIcon } from './icons/Icons';

interface CartPageProps {
    cartItems: CartItem[];
    updateCartItemQuantity: (itemId: number, quantity: number) => void;
    placeOrder: (orderDetails: {name: string, email: string}) => void;
    clearCart: () => void;
}

const CartPage: React.FC<CartPageProps> = ({ cartItems, updateCartItemQuantity, placeOrder, clearCart }) => {
    const [checkout, setCheckout] = useState(false);
    const [userDetails, setUserDetails] = useState({ name: '', email: '' });

    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (userDetails.name && userDetails.email) {
            placeOrder(userDetails);
        }
    };

    if (cartItems.length === 0 && !checkout) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="text-6xl mb-4">🛒</div>
                <h1 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-4">Your Cart is Empty</h1>
                <p className="text-text-secondary dark:text-gray-400">Looks like you haven't added anything to your cart yet.</p>
            </div>
        )
    }
    
    if (checkout) {
        return (
             <div className="max-w-lg mx-auto bg-card-bg dark:bg-gray-800 p-8 rounded-lg shadow-xl animate-fade-in">
                <h2 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-6 text-center">Confirm Your Details</h2>
                <form onSubmit={handleCheckout}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-text-secondary dark:text-gray-300 mb-2">Full Name</label>
                        <input type="text" id="name" value={userDetails.name} onChange={e => setUserDetails({...userDetails, name: e.target.value})} className="w-full p-3 border border-border-divider dark:border-gray-600 rounded-md bg-neutral-bg dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none" required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-text-secondary dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="email" value={userDetails.email} onChange={e => setUserDetails({...userDetails, email: e.target.value})} className="w-full p-3 border border-border-divider dark:border-gray-600 rounded-md bg-neutral-bg dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none" required />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-cta-hover transition-colors text-lg shadow-md hover:shadow-lg">
                        Confirm & Pay ₹{totalAmount.toFixed(2)}
                    </button>
                     <button type="button" onClick={() => setCheckout(false)} className="w-full mt-3 text-center text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-cta-hover transition-colors">
                        Back to Cart
                    </button>
                </form>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-secondary dark:text-gray-100">Your Cart</h1>
                <button onClick={clearCart} className="flex items-center gap-2 text-sm text-accent hover:underline">
                    <TrashIcon /> Clear Cart
                </button>
            </div>
            <div className="bg-card-bg dark:bg-gray-800 rounded-lg shadow-xl">
                <ul className="divide-y divide-border-divider dark:divide-gray-700">
                    {cartItems.map(item => (
                        <li key={item.id} className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center space-x-4 w-full sm:w-auto">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg"/>
                                <div>
                                    <h2 className="font-semibold text-lg">{item.name}</h2>
                                    <p className="text-sm text-text-secondary">₹{item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3 bg-neutral-bg dark:bg-gray-700 rounded-full p-1">
                                    <button onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 font-bold">-</button>
                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                    <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 font-bold">+</button>
                                </div>
                                <span className="font-bold w-24 text-right text-lg">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="p-6 border-t border-border-divider dark:border-gray-700 flex justify-between items-center bg-neutral-bg/50 dark:bg-gray-900/20 rounded-b-lg">
                    <h2 className="text-xl font-bold">Total</h2>
                    <span className="text-3xl font-extrabold text-primary">₹{totalAmount.toFixed(2)}</span>
                </div>
            </div>
            <div className="mt-8 text-right">
                <button onClick={() => setCheckout(true)} className="bg-primary text-white font-bold py-4 px-10 text-lg rounded-full hover:bg-cta-hover transition-transform transform hover:scale-105 duration-300 shadow-xl">
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default CartPage;