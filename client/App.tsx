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
        const root = document.documentElement;

        if (theme === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
        } else {
            root.classList.add("light");
            root.classList.remove("dark");
        }
    }, [theme]);

    useEffect(() => {
        setFoodItems(MOCK_FOOD_ITEMS);
    }, []);
    useEffect(() => {
        const fetchOrders = async () => {
            if (currentUser?.email) {
                try {
                    const res = await fetch(`http://localhost:5000/api/orders/${currentUser.email}`);
                    if (!res.ok) throw new Error("Failed to fetch orders");
                    const data = await res.json();

                    // Convert backend data into your frontend shape
                    const formattedOrders = data.map((order: any) => ({
                        id: order._id,
                        items: order.items,
                        totalAmount: order.totalAmount,
                        status: OrderStatus.PLACED, // since backend uses "PLACED" string
                        date: order.date || order.createdAt,
                        userDetails: order.userDetails,
                    }));

                    setOrders(formattedOrders);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                }
            }
        };

        fetchOrders();
    }, [currentUser]);
    // 🔄 Auto-refresh orders every 5 seconds
    useEffect(() => {
        if (!currentUser) return;

        const interval = setInterval(() => {
            fetch(`http://localhost:5000/api/orders/${currentUser.email}`)
                .then(res => res.json())
                .then(data => {
                    const formattedOrders = data.map((order: any) => ({
                        id: order._id,
                        items: order.items,
                        totalAmount: order.totalAmount,
                        status: order.status as OrderStatus,
                        date: order.date || order.createdAt,
                        userDetails: order.userDetails,
                    }));
                    setOrders(formattedOrders);
                })
                .catch(err => console.error("Polling error:", err));
        }, 5000);

        return () => clearInterval(interval);
    }, [currentUser]);


    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleLogin = useCallback(async (email: string) => {
        try {
            const res = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) throw new Error("Invalid credentials");
            const data = await res.json();

            const user = {
                id: data.user._id,
                name: data.user.name,
                email: data.user.email,
                role: UserRole.STUDENT,
            };

            setCurrentUser(user);
            setCurrentPage("home");
            showToast(`Welcome back, ${user.name}!`);
        } catch (error) {
            showToast("Invalid credentials!");
        }
    }, [showToast]);

    const handleSignUp = useCallback(async (name: string, email: string) => {
        try {
            const res = await fetch("http://localhost:5000/api/users/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password: "default" }),
            });

            if (!res.ok) throw new Error("Signup failed");
            const data = await res.json();

            const user = {
                id: data.user._id,
                name: data.user.name,
                email: data.user.email,
                role: UserRole.STUDENT,
            };

            setCurrentUser(user);
            setCurrentPage("home");
            showToast(`Welcome, ${user.name}!`);
        } catch (error) {
            showToast("Signup failed!");
        }
    }, [showToast]);

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
    const placeOrder = useCallback(async (orderDetails: { name: string; email: string }) => {
        const orderData = {
            userEmail: orderDetails.email,
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
            })),
            totalAmount: cart.reduce((total, item) => total + item.price * item.quantity, 0),
        };

        try {
            const res = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });

            if (!res.ok) throw new Error("Failed to place order");
            const data = await res.json();

            // ✅ Build an order object that matches your frontend type
            const newOrder = {
                id: data.newOrder._id,
                items: data.newOrder.items,
                totalAmount: data.newOrder.totalAmount,
                status: OrderStatus.PLACED,
                date: data.newOrder.date,
                userDetails: data.newOrder.userDetails,
            };

            setOrders(prev => [newOrder, ...prev]); // add the real MongoDB order
            setCart([]);
            setCurrentPage("orders");
            showToast("Order placed successfully!");
        } catch (error) {
            showToast("Failed to place order.");
        }
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