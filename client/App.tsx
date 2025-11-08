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
import Toast from './components/Toast';

export type Page = 'home' | 'menu' | 'orders' | 'smart-cart' | 'feedback' | 'about' | 'cart';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('home');

    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [foodItems, setFoodItems] = useState<FoodItem[]>(MOCK_FOOD_ITEMS);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [smartCarts, setSmartCarts] = useState<SmartCart[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // useEffect(() => {
    //     const root = window.document.documentElement;
    //     root.classList.remove(theme === 'light' ? 'dark' : 'light');
    //     root.classList.add(theme);
    // }, [theme]);
    useEffect(() => {
        const fetchFoodItems = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/items");
                if (!res.ok) throw new Error("Network error");
                const data = await res.json();
                setFoodItems(data); // Replace mock data with MongoDB items
                console.log("✅ Fetched from backend:", data);
            } catch (err) {
                console.error("❌ Backend fetch failed, using mock data:", err);
                setFoodItems(MOCK_FOOD_ITEMS);
            }
        };

        fetchFoodItems();
    }, []);


    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleLogin = useCallback((email: string) => {
        const user = users.find(u => u.email === email && u.role === UserRole.STUDENT);
        if (user) {
            setCurrentUser(user);
            setCurrentPage('home');
            showToast(`Welcome back, ${user.name}!`);
        } else {
            showToast('Invalid credentials!');
        }
    }, [users, showToast]);

    const handleSignUp = useCallback((name: string, email: string) => {
        if (users.find(u => u.email === email)) {
            showToast('An account with this email already exists.');
            return;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email,
            role: UserRole.STUDENT,
        };

        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        setCurrentPage('home');
        showToast(`Welcome, ${name}! Your account has been created.`);
    }, [users, showToast]);

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        setCurrentPage('home');
        setCart([]);
    }, []);

    const addToCart = useCallback((item: FoodItem) => {
        setCart(prevCart => {
            const isExistingInCart = prevCart.find(cartItem => cartItem.id === item.id);
            if (isExistingInCart) {
                showToast(`${item.name} quantity updated in cart.`);
                return prevCart.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            showToast(`${item.name} added to cart!`);
            return [...prevCart, { ...item, quantity: 1 }];
        });
    }, [showToast]);

    const updateCartItemQuantity = useCallback((itemId: number, quantity: number) => {
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
    }, [showToast]);

    const clearCart = useCallback(() => {
        if (cart.length > 0) {
            setCart([]);
            showToast("Cart has been cleared.");
        }
    }, [cart.length, showToast]);

    const placeOrder = useCallback((orderDetails: { name: string, email: string }) => {
        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            items: cart,
            totalAmount: cart.reduce((total, item) => total + item.price * item.quantity, 0),
            status: OrderStatus.PLACED,
            date: new Date().toISOString(),
            userDetails: orderDetails,
        };
        setOrders(prevOrders => [newOrder, ...prevOrders]);
        setCart([]);
        setCurrentPage('orders');
        showToast('Order placed successfully!');
    }, [cart, showToast]);

    const renderPage = () => {
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
            default:
                return <HomePage foodItems={foodItems} addToCart={addToCart} navigate={setCurrentPage} />;
        }
    };

    if (!currentUser) {
        return <LoginModal onLogin={handleLogin} onSignUp={handleSignUp} />;
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