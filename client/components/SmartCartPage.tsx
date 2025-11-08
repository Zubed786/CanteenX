
import React, { useState, useMemo } from 'react';
import { SmartCart, CartItem, FoodItem } from '../types';

interface CreateSmartCartModalProps {
    allFoodItems: FoodItem[];
    onClose: () => void;
    onSave: (newCartData: { name: string; items: CartItem[] }) => void;
    showToast: (message: string) => void;
}

const CreateSmartCartModal: React.FC<CreateSmartCartModalProps> = ({ allFoodItems, onClose, onSave, showToast }) => {
    const [name, setName] = useState('');
    const [items, setItems] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleUpdateQuantity = (foodItem: FoodItem, change: 1 | -1) => {
        const existingItem = items.find(i => i.id === foodItem.id);
        if (existingItem) {
            const newQuantity = existingItem.quantity + change;
            if (newQuantity <= 0) {
                setItems(items.filter(i => i.id !== foodItem.id));
            } else {
                setItems(items.map(i => i.id === foodItem.id ? { ...i, quantity: newQuantity } : i));
            }
        } else if (change === 1) {
            setItems([...items, { ...foodItem, quantity: 1 }]);
        }
    };

    const totalAmount = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);
    
    const filteredFoodItems = useMemo(() => 
        allFoodItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) && item.inStock
        ), [allFoodItems, searchTerm]);

    const handleSaveClick = () => {
        if (!name.trim()) {
            showToast("Please enter a name for your new Smart Cart.");
            return;
        }
        if (items.length === 0) {
            showToast("Please add at least one item to the cart.");
            return;
        }
        onSave({ name, items });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-card-bg dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-secondary dark:text-gray-100">Create a New Smart Cart</h2>
                    <button onClick={onClose} className="text-2xl hover:text-accent">&times;</button>
                </div>
                
                <div className="p-4">
                     <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter Smart Cart Name (e.g., 'My Quick Lunch')" className="w-full p-3 border dark:border-gray-600 rounded-md bg-neutral-bg dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
                    {/* Available Items */}
                    <div className="bg-neutral-bg dark:bg-gray-900/50 rounded-lg flex flex-col overflow-hidden">
                        <div className="p-3 border-b dark:border-gray-700">
                             <input type="text" placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border dark:border-gray-600 rounded-md bg-card-bg dark:bg-gray-700" />
                        </div>
                        <div className="overflow-y-auto p-2">
                            {filteredFoodItems.map(foodItem => (
                                <div key={foodItem.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <div>
                                        <p className="font-semibold">{foodItem.name}</p>
                                        <p className="text-sm text-text-secondary">₹{foodItem.price.toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => handleUpdateQuantity(foodItem, 1)} className="bg-primary text-white w-8 h-8 rounded-full hover:bg-cta-hover font-bold text-lg">+</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* New Cart */}
                    <div className="bg-neutral-bg dark:bg-gray-900/50 rounded-lg flex flex-col overflow-hidden">
                       <h3 className="text-lg font-semibold p-3 border-b dark:border-gray-700">Your New Cart ({items.reduce((acc, i) => acc + i.quantity, 0)})</h3>
                       <div className="overflow-y-auto p-2 flex-grow">
                           {items.length === 0 ? <p className="text-center text-text-secondary p-4">Add items from the left.</p> :
                            items.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-2">
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-text-secondary">₹{item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleUpdateQuantity(item, -1)} className="border w-6 h-6 rounded-md">-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => handleUpdateQuantity(item, 1)} className="border w-6 h-6 rounded-md">+</button>
                                    </div>
                                </div>
                            ))
                           }
                       </div>
                    </div>
                </div>

                <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
                    <div className="text-xl font-bold">Total: <span className="text-primary">₹{totalAmount.toFixed(2)}</span></div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-md border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">Cancel</button>
                        <button onClick={handleSaveClick} className="bg-secondary text-white px-8 py-2 rounded-md hover:bg-primary font-semibold">Save Cart</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface SmartCartPageProps {
    smartCarts: SmartCart[];
    setSmartCarts: React.Dispatch<React.SetStateAction<SmartCart[]>>;
    currentCart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    showToast: (message: string) => void;
    allFoodItems: FoodItem[];
}

const SmartCartPage: React.FC<SmartCartPageProps> = ({ smartCarts, setSmartCarts, currentCart, setCart, showToast, allFoodItems }) => {
    const [newCartName, setNewCartName] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleSaveCurrentCart = () => {
        if (!newCartName.trim()) {
            showToast("Please enter a name for your Smart Cart.");
            return;
        }
        if (currentCart.length === 0) {
            showToast("Your current cart is empty. Add items to save a Smart Cart.");
            return;
        }
        const newSmartCart: SmartCart = {
            id: `SC-${Date.now()}`,
            name: newCartName,
            items: currentCart,
        };
        setSmartCarts(prev => [...prev, newSmartCart]);
        setNewCartName('');
        showToast(`Smart Cart "${newCartName}" saved!`);
    };
    
    const handleCreateAndSaveNewCart = (newCartData: { name: string; items: CartItem[] }) => {
        const newSmartCart: SmartCart = {
            id: `SC-${Date.now()}`,
            name: newCartData.name,
            items: newCartData.items,
        };
        setSmartCarts(prev => [...prev, newSmartCart]);
        setIsCreateModalOpen(false);
        showToast(`Smart Cart "${newSmartCart.name}" created!`);
    };

    const handleLoadCart = (cart: SmartCart) => {
        setCart(cart.items);
        showToast(`Smart Cart "${cart.name}" loaded into your current cart.`);
    };

    const handleDeleteCart = (cartId: string) => {
        setSmartCarts(prev => prev.filter(c => c.id !== cartId));
        showToast("Smart Cart deleted.");
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-6">Smart Carts</h1>
            <div className="bg-card-bg dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Save Your Current Order as a Smart Cart</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="text" 
                        value={newCartName}
                        onChange={(e) => setNewCartName(e.target.value)}
                        placeholder="e.g., My usual lunch"
                        className="flex-grow p-3 border dark:border-gray-600 rounded-md bg-neutral-bg dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <button onClick={handleSaveCurrentCart} className="bg-primary text-white px-6 py-3 rounded-md hover:bg-cta-hover font-semibold">
                        Save Current Cart
                    </button>
                </div>
                 <p className="text-xs text-text-secondary mt-2">First, add items to your main cart from the Menu page, then save it here for quick reordering.</p>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary dark:text-cta-hover">Your Saved Carts</h2>
                     <button onClick={() => setIsCreateModalOpen(true)} className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary font-semibold flex items-center gap-2">
                        <span className="text-xl">+</span> Create New Cart
                    </button>
                </div>
                {smartCarts.length > 0 ? (
                    <div className="space-y-4">
                        {smartCarts.map(cart => (
                            <div key={cart.id} className="bg-card-bg dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-lg">{cart.name}</h3>
                                    <p className="text-sm text-text-secondary">{cart.items.length} items &bull; Total: ₹{cart.items.reduce((t, i) => t + i.price * i.quantity, 0).toFixed(2)}</p>
                                </div>
                                <div className="space-x-2 flex-shrink-0">
                                    <button onClick={() => handleLoadCart(cart)} className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-primary text-sm font-semibold">Order Again</button>
                                    <button onClick={() => handleDeleteCart(cart.id)} className="bg-accent text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-semibold">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-neutral-bg dark:bg-gray-800 rounded-lg">
                        <p className="text-text-secondary dark:text-gray-400">You have no saved Smart Carts.</p>
                        <p className="text-sm text-text-secondary dark:text-gray-500 mt-2">Click 'Create New Cart' to get started!</p>
                    </div>
                )}
            </div>

            {isCreateModalOpen && (
                <CreateSmartCartModal 
                    allFoodItems={allFoodItems}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleCreateAndSaveNewCart}
                    showToast={showToast}
                />
            )}
        </div>
    );
};

export default SmartCartPage;