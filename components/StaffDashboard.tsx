import React, { useState } from 'react';
import { FoodItem, Order, OrderStatus, FoodType, FoodCategory } from '../types';

interface StaffDashboardProps {
    menuItems: FoodItem[];
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    updateFoodItem: (item: FoodItem) => void;
    addFoodItem: (item: Omit<FoodItem, 'id'>) => void;
    showToast: (message: string) => void;
}

const MenuManagement: React.FC<{ items: FoodItem[], updateFoodItem: (item: FoodItem) => void, addFoodItem: (item: Omit<FoodItem, 'id'>) => void }> = ({ items, updateFoodItem, addFoodItem }) => {
    
    const [showAddForm, setShowAddForm] = useState(false);
    const initialNewItemState = {
        name: '', description: '', price: 0, image: `https://picsum.photos/seed/${Date.now()}/400/300`, type: FoodType.VEG,
        category: [], nutrition: { calories: 0, protein: 0, carbs: 0 }, inStock: true
    };
    const [newItem, setNewItem] = useState<Omit<FoodItem, 'id' | 'rating'>>(initialNewItemState);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        addFoodItem({...newItem, rating: 0});
        setShowAddForm(false);
        setNewItem(initialNewItemState); // Reset form
    };
    
    return (
        <div className="bg-card-bg dark:bg-gray-800 p-6 rounded-lg shadow-md animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-semibold text-secondary dark:text-gray-100">Menu Items ({items.length})</h3>
                 <button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-cta-hover font-semibold transition-colors">{showAddForm ? 'Cancel' : 'Add New Item'}</button>
            </div>
           
            {showAddForm && (
                <form onSubmit={handleAddItem} className="bg-neutral-bg dark:bg-gray-700/50 p-6 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{animationDuration: '300ms'}}>
                    <input type="text" placeholder="Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="p-3 border border-border-divider dark:border-gray-600 rounded-md col-span-2 bg-card-bg dark:bg-gray-800" required />
                    <textarea placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="p-3 border border-border-divider dark:border-gray-600 rounded-md col-span-2 bg-card-bg dark:bg-gray-800" required />
                    <input type="number" placeholder="Price" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})} className="p-3 border border-border-divider dark:border-gray-600 rounded-md bg-card-bg dark:bg-gray-800" required />
                    <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as FoodType})} className="p-3 border border-border-divider dark:border-gray-600 rounded-md bg-card-bg dark:bg-gray-800">
                        <option value={FoodType.VEG}>Veg</option>
                        <option value={FoodType.NON_VEG}>Non-Veg</option>
                    </select>
                     <input type="text" placeholder="Image URL" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} className="p-3 border border-border-divider dark:border-gray-600 rounded-md col-span-2 bg-card-bg dark:bg-gray-800" />
                    <button type="submit" className="bg-secondary text-white p-3 rounded-lg col-span-2 hover:bg-primary font-semibold text-lg transition-colors">Add Item to Menu</button>
                </form>
            )}

            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id} className="bg-neutral-bg dark:bg-gray-700/50 p-3 rounded-lg flex justify-between items-center transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                            <span className="font-semibold truncate pr-2">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="font-bold text-lg">₹{item.price.toFixed(2)}</span>
                            <button onClick={() => updateFoodItem({...item, inStock: !item.inStock})} 
                                className={`px-3 py-1 text-sm rounded-full font-semibold transition-colors ${item.inStock ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                                {item.inStock ? 'In Stock' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const OrderManagement: React.FC<{ orders: Order[], setOrders: React.Dispatch<React.SetStateAction<Order[]>>, showToast: (message: string) => void }> = ({ orders, setOrders, showToast }) => {
    
    const updateStatus = (orderId: string, status: OrderStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? {...o, status} : o));
        showToast(`Order #${orderId.slice(-6)} status updated to "${status}".`);
    };
    
    const activeOrders = orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PLACED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case OrderStatus.PREPARING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case OrderStatus.READY: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    }

    const renderActionButtons = (order: Order) => {
        const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
            [OrderStatus.PLACED]: OrderStatus.PREPARING,
            [OrderStatus.PREPARING]: OrderStatus.READY,
            [OrderStatus.READY]: OrderStatus.COMPLETED,
        };

        const nextStatus = nextStatusMap[order.status];

        const buttonTextMap: Partial<Record<OrderStatus, string>> = {
            [OrderStatus.PREPARING]: 'Start Preparing',
            [OrderStatus.READY]: 'Mark as Ready',
            [OrderStatus.COMPLETED]: 'Complete Order',
        };

        return (
            <div className="flex gap-2 mt-4 pt-4 border-t border-border-divider dark:border-gray-600">
                {nextStatus && buttonTextMap[nextStatus] && (
                    <button
                        onClick={() => updateStatus(order.id, nextStatus)}
                        className="flex-grow bg-secondary text-white px-3 py-2 text-sm rounded-lg hover:bg-primary transition-colors font-semibold"
                    >
                        {buttonTextMap[nextStatus]}
                    </button>
                )}
                {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                    <button
                        onClick={() => updateStatus(order.id, OrderStatus.CANCELLED)}
                        className="bg-accent text-white px-3 py-2 text-sm rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                        Cancel Order
                    </button>
                )}
            </div>
        );
    };
    
    return (
        <div className="bg-card-bg dark:bg-gray-800 p-6 rounded-lg shadow-md animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4 text-secondary dark:text-gray-100">Active Orders ({activeOrders.length})</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeOrders.length === 0 && <p className="text-text-secondary dark:text-gray-400 col-span-full">No active orders right now.</p>}
                {activeOrders.map(order => (
                    <div key={order.id} className="bg-neutral-bg dark:bg-gray-700/50 p-4 rounded-lg shadow-sm flex flex-col">
                        <div className="flex-grow">
                            <div className="flex justify-between items-center mb-2">
                                 <div>
                                    <h4 className="font-bold text-lg text-secondary dark:text-gray-100">Order #{order.id.slice(-6)}</h4>
                                    <p className="text-sm text-text-secondary dark:text-gray-400">{order.userDetails.name}</p>
                                </div>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <ul className="text-sm my-3 pl-4 list-disc text-text-primary dark:text-gray-300 space-y-1">
                                {order.items.map(i => <li key={i.id}>{i.name} <span className="font-semibold">x {i.quantity}</span></li>)}
                            </ul>
                        </div>
                        {renderActionButtons(order)}
                    </div>
                ))}
            </div>
        </div>
    );
};

const StaffDashboard: React.FC<StaffDashboardProps> = ({ menuItems, orders, setOrders, updateFoodItem, addFoodItem, showToast }) => {
    const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-secondary dark:text-gray-100 mb-6">Staff Dashboard</h1>
            <div className="flex space-x-2 border-b border-border-divider dark:border-gray-700 mb-6">
                <button onClick={() => setActiveTab('orders')} className={`px-6 py-3 font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'orders' ? 'bg-card-bg dark:bg-gray-800 border-t border-x border-border-divider dark:border-gray-700 text-primary' : 'text-text-secondary hover:text-primary bg-neutral-bg/50 dark:bg-gray-800/50'}`}>Order Management</button>
                <button onClick={() => setActiveTab('menu')} className={`px-6 py-3 font-semibold rounded-t-lg transition-colors duration-200 ${activeTab === 'menu' ? 'bg-card-bg dark:bg-gray-800 border-t border-x border-border-divider dark:border-gray-700 text-primary' : 'text-text-secondary hover:text-primary bg-neutral-bg/50 dark:bg-gray-800/50'}`}>Menu Management</button>
            </div>
            <div>
                {activeTab === 'orders' ? 
                    <OrderManagement orders={orders} setOrders={setOrders} showToast={showToast} /> : 
                    <MenuManagement items={menuItems} updateFoodItem={updateFoodItem} addFoodItem={addFoodItem} />}
            </div>
        </div>
    );
};

export default StaffDashboard;