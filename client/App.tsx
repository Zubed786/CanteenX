import React, { useState, useEffect, useCallback } from 'react';
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

export type Page =
  | 'home'
  | 'menu'
  | 'orders'
  | 'smart-cart'
  | 'feedback'
  | 'about'
  | 'cart';

/* ---------------------------------------------------------
   ✅ mapStatus — Convert Backend String to Frontend Enum
---------------------------------------------------------- */
const mapStatus = (backendStatus: string): OrderStatus => {
  switch (backendStatus) {
    case 'PLACED': return OrderStatus.PLACED;
    case 'PREPARING': return OrderStatus.PREPARING;
    case 'READY': return OrderStatus.READY;
    case 'COMPLETED': return OrderStatus.COMPLETED;
    case 'CANCELLED': return OrderStatus.CANCELLED;
    default: return OrderStatus.PLACED;
  }
};

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

  /* ---------------------------------------------------------
      DARK MODE SYNC
  ---------------------------------------------------------- */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  /* ---------------------------------------------------------
      Load Static Food Items (since no DB)
  ---------------------------------------------------------- */
  useEffect(() => {
    setFoodItems(MOCK_FOOD_ITEMS);
  }, []);

  /* ---------------------------------------------------------
      Fetch Orders ON LOGIN
  ---------------------------------------------------------- */
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.email) return;

      try {
        const res = await fetch(`http://localhost:5000/api/orders/${currentUser.email}`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();

        const formattedOrders = data.map((order: any) => ({
          id: order._id,
          items: order.items,
          totalAmount: order.totalAmount,
          status: mapStatus(order.status), // FIXED
          date: order.date || order.createdAt,
          userDetails: order.userDetails,
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [currentUser]);

  /* ---------------------------------------------------------
      Auto Refresh Orders Every 5 Secs (polling)
  ---------------------------------------------------------- */
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      fetch(`http://localhost:5000/api/orders/${currentUser.email}`)
        .then((res) => res.json())
        .then((data) => {
          const formattedOrders = data.map((order: any) => ({
            id: order._id,
            items: order.items,
            totalAmount: order.totalAmount,
            status: mapStatus(order.status), // FIXED
            date: order.date || order.createdAt,
            userDetails: order.userDetails,
          }));
          setOrders(formattedOrders);
        })
        .catch((err) => console.error('Polling error:', err));
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  /* ---------------------------------------------------------
      Toast Utility
  ---------------------------------------------------------- */
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  /* ---------------------------------------------------------
      Auth Functions
  ---------------------------------------------------------- */
  const handleLogin = useCallback(
    async (email: string) => {
      try {
        const res = await fetch('http://localhost:5000/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) throw new Error('Invalid credentials');
        const data = await res.json();

        const user = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: UserRole.STUDENT,
        };

        setCurrentUser(user);
        setCurrentPage('home');
        showToast(`Welcome back, ${user.name}!`);
      } catch {
        showToast('Invalid credentials!');
      }
    },
    [showToast]
  );

  const handleSignUp = useCallback(
    async (name: string, email: string) => {
      try {
        const res = await fetch('http://localhost:5000/api/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password: 'default' }),
        });

        if (!res.ok) throw new Error('Signup failed');
        const data = await res.json();

        const user = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: UserRole.STUDENT,
        };

        setCurrentUser(user);
        setCurrentPage('home');
        showToast(`Welcome, ${user.name}!`);
      } catch {
        showToast('Signup failed!');
      }
    },
    [showToast]
  );

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage('home');
    setCart([]);
  }, []);

  /* ---------------------------------------------------------
      Cart Functions
  ---------------------------------------------------------- */
  const addToCart = useCallback(
    (item: FoodItem) => {
      setCart((prev) => {
        const found = prev.find((c) => c.id === item.id);
        if (found) {
          showToast(`${item.name} quantity increased`);
          return prev.map((c) =>
            c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          );
        }
        showToast(`${item.name} added to cart`);
        return [...prev, { ...item, quantity: 1 }];
      });
    },
    [showToast]
  );

  const updateCartItemQuantity = useCallback(
    (id: number, qty: number) => {
      setCart((prev) => {
        if (qty <= 0) return prev.filter((x) => x.id !== id);
        return prev.map((x) => (x.id === id ? { ...x, quantity: qty } : x));
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('Cart cleared');
  }, [showToast]);

  /* ---------------------------------------------------------
      Place Order
  ---------------------------------------------------------- */
  const placeOrder = useCallback(
    async (details: { name: string; email: string }) => {
      const payload = {
        userEmail: details.email,
        items: cart.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        totalAmount: cart.reduce((sum, x) => sum + x.price * x.quantity, 0),
      };

      try {
        const res = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Failed');

        const data = await res.json();

        const newOrder = {
          id: data.newOrder._id,
          items: data.newOrder.items,
          totalAmount: data.newOrder.totalAmount,
          status: mapStatus(data.newOrder.status),
          date: data.newOrder.date,
          userDetails: data.newOrder.userDetails,
        };

        setOrders((p) => [newOrder, ...p]);
        setCart([]);
        setCurrentPage('orders');
        showToast('Order placed!');
      } catch {
        showToast('Order failed');
      }
    },
    [cart, showToast]
  );

  /* ---------------------------------------------------------
      Page Rendering
  ---------------------------------------------------------- */
  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage foodItems={foodItems} addToCart={addToCart} navigate={setCurrentPage} />;
      case 'menu': return <MenuPage foodItems={foodItems} addToCart={addToCart} />;
      case 'cart': return <CartPage cartItems={cart} updateCartItemQuantity={updateCartItemQuantity} placeOrder={placeOrder} clearCart={clearCart} />;
      case 'orders': return <OrderPage orders={orders} />;
      case 'smart-cart': return <SmartCartPage smartCarts={smartCarts} setSmartCarts={setSmartCarts} currentCart={cart} setCart={setCart} showToast={showToast} allFoodItems={foodItems} />;
      case 'feedback': return <FeedbackPage showToast={showToast} />;
      case 'about': return <AboutPage />;
      default: return <HomePage foodItems={foodItems} addToCart={addToCart} navigate={setCurrentPage} />;
    }
  };

  /* ---------------------------------------------------------
      Auth Check
  ---------------------------------------------------------- */
  if (!currentUser) return <LoginModal onLogin={handleLogin} onSignUp={handleSignUp} />;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-bg dark:bg-gray-900 text-text-primary dark:text-gray-200 animate-fade-in">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
        toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        theme={theme}
        cartItemCount={cart.reduce((s, x) => s + x.quantity, 0)}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        {renderPage()}
      </main>

      <Toast message={toastMessage} />
    </div>
  );
};

export default App;
