import React, { useState, useEffect, useCallback } from 'react';
// FIX: Add OrderStatus to imports
import { User, UserRole, CartItem, Order, SmartCart, FoodItem, OrderStatus } from './types';
import { MOCK_USERS, MOCK_FOOD_ITEMS } from './constants';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import HomePage from './components/HomePage';
import MenuPage from './components/MenuPage';
import CartPage from './components/CartPage';
import OrderPage from './components/OrderPage';
import SmartCartPage from './components/SmartCartPage';
import FeedbackPage from './components/FeedbackPage';
import AboutPage from './components/AboutPage';
import StaffDashboard from './components/StaffDashboard';
import Toast from './components/Toast';

export type Page = 'home' | 'menu' | 'orders' | 'smart-cart' | 'feedback' | 'about' | 'cart' | 'dashboard';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    
    const [foodItems, setFoodItems] = useState<FoodItem[]>(MOCK_FOOD_ITEMS);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [smartCarts, setSmartCarts] = useState<SmartCart[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleLogin = (email: string, role: UserRole) => {
        const user = MOCK_USERS.find(u => u.email === email && u.role === role);
        if (user) {
            setCurrentUser(user);
            if(user.role === UserRole.STAFF) {
                setCurrentPage('dashboard');
            } else {
                setCurrentPage('home');
            }
        } else {
            alert('Invalid credentials!');
        }
    };
    
    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    }, []);

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentPage('home');
        setCart([]);
    };
    
    const addToCart = useCallback((item: FoodItem) => {
        const isExistingInCart = cart.find(cartItem => cartItem.id === item.id);

        setCart(prevCart => {
            if (isExistingInCart) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });

        if (isExistingInCart) {
            showToast(`${item.name} quantity updated in cart.`);
        } else {
            showToast(`${item.name} added to cart!`);
        }
    }, [cart, showToast]);

    const updateCartItemQuantity = (itemId: number, quantity: number) => {
        setCart(prevCart => {
            if (quantity <= 0) {
                const itemToRemove = prevCart.find(item => item.id === itemId);
                if (itemToRemove) {
                    showToast(`${itemToRemove.name} removed from cart.`);
                }
                return prevCart.filter(item => item.id !== itemId);
            }
            const itemToUpdate = prevCart.find(item => item.id === itemId);
            if (itemToUpdate && itemToUpdate.quantity !== quantity) {
                showToast(`${itemToUpdate.name} quantity updated.`);
            }
            return prevCart.map(item => item.id === itemId ? { ...item, quantity } : item);
        });
    };

    const clearCart = () => {
        if (cart.length > 0) {
            setCart([]);
            showToast("Cart has been cleared.");
        }
    };

    const placeOrder = (orderDetails: {name: string, email: string}) => {
        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            items: cart,
            totalAmount: cart.reduce((total, item) => total + item.price * item.quantity, 0),
            // FIX: Use OrderStatus enum instead of string literal
            status: OrderStatus.PLACED,
            date: new Date().toISOString(),
            userDetails: orderDetails,
        };
        setOrders(prevOrders => [newOrder, ...prevOrders]);
        setCart([]);
        setCurrentPage('orders');
        showToast('Order placed successfully!');
    };
    
    const updateFoodItem = (updatedItem: FoodItem) => {
      setFoodItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      showToast(`${updatedItem.name} has been updated.`);
    };

    const addFoodItem = (newItem: Omit<FoodItem, 'id'>) => {
      const newFoodItem = { ...newItem, id: Date.now() };
      setFoodItems(prev => [newFoodItem, ...prev]);
      showToast(`${newItem.name} has been added to the menu.`);
    };

    const renderPage = () => {
        if (currentUser?.role === UserRole.STAFF && currentPage !== 'dashboard') {
            setCurrentPage('dashboard');
        }

        switch (currentPage) {
            case 'home':
                return <HomePage foodItems={foodItems} addToCart={addToCart} navigate={setCurrentPage} />;
            case 'menu':
                return <MenuPage foodItems={foodItems} addToCart={addToCart} />;
            case 'cart':
                return <CartPage cartItems={cart} updateCartItemQuantity={updateCartItemQuantity} placeOrder={placeOrder} clearCart={clearCart} />;
            case 'orders':
                return <OrderPage orders={orders} />;
            case 'smart-cart':
                return <SmartCartPage smartCarts={smartCarts} setSmartCarts={setSmartCarts} currentCart={cart} setCart={setCart} showToast={showToast} allFoodItems={foodItems} />;
            case 'feedback':
                return <FeedbackPage showToast={showToast} />;
            case 'about':
                return <AboutPage />;
            case 'dashboard':
                 return <StaffDashboard menuItems={foodItems} orders={orders} setOrders={setOrders} updateFoodItem={updateFoodItem} addFoodItem={addFoodItem} showToast={showToast} />;
            default:
                return <HomePage foodItems={foodItems} addToCart={addToCart} navigate={setCurrentPage} />;
        }
    };

    if (!currentUser) {
        return <LoginModal onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-neutral-bg dark:bg-gray-900 text-text-primary dark:text-gray-200 animate-fade-in">
            <Header
                user={currentUser}
                onLogout={handleLogout}
                onNavigate={setCurrentPage}
                toggleTheme={toggleTheme}
                theme={theme}
                cartItemCount={cart.reduce((count, item) => count + item.quantity, 0)}
            />
            <main className="flex-grow container mx-auto px-4 py-8">
                {renderPage()}
            </main>
            <Toast message={toastMessage} />
        </div>
    );
};

export default App;