import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Page } from '../App';
import { HomeIcon, MenuIcon, OrderIcon, SmartCartIcon, FeedbackIcon, AboutIcon, CartIcon, SunIcon, MoonIcon, UserIcon, StaffIcon, HamburgerIcon, CloseIcon } from './icons/Icons';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    onNavigate: (page: Page) => void;
    toggleTheme: () => void;
    theme: 'light' | 'dark';
    cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onNavigate, toggleTheme, theme, cartItemCount }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleMobileNavClick = (page: Page) => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
    };
    
    const studentNavItems = [
        { name: 'Home', page: 'home' as Page, icon: <HomeIcon /> },
        { name: 'Menu', page: 'menu' as Page, icon: <MenuIcon /> },
        { name: 'My Orders', page: 'orders' as Page, icon: <OrderIcon /> },
        { name: 'Smart Cart', page: 'smart-cart' as Page, icon: <SmartCartIcon /> },
        { name: 'Feedback', page: 'feedback' as Page, icon: <FeedbackIcon /> },
        { name: 'About', page: 'about' as Page, icon: <AboutIcon /> },
    ];
    
    const staffNavItems = [
        { name: 'Dashboard', page: 'dashboard' as Page, icon: <StaffIcon /> },
    ];

    const navItems = user.role === UserRole.STUDENT ? studentNavItems : staffNavItems;

    return (
        <>
            <header className="bg-card-bg/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-border-divider/50 dark:border-gray-700/50 shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4">
                    <div className="flex items-center py-4">
                        <div className="flex items-center space-x-8">
                            <div className="text-2xl font-bold text-primary dark:text-cta-hover cursor-pointer flex-shrink-0" onClick={() => onNavigate(user.role === UserRole.STAFF ? 'dashboard' : 'home')}>
                                CanteenX
                            </div>
                            <nav className="hidden md:flex items-center space-x-6">
                                {navItems.map(item => (
                                    <button key={item.name} onClick={() => onNavigate(item.page)} className="flex items-center space-x-2 text-text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-cta-hover transition duration-200 group">
                                        <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
                            <button onClick={toggleTheme} className="p-2 rounded-full text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-cta-hover transition-colors">
                                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                            </button>
                            {user.role === UserRole.STUDENT && (
                                <button onClick={() => onNavigate('cart')} className="relative p-2 rounded-full text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-cta-hover transition-colors">
                                    <CartIcon />
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-accent text-white text-xs flex items-center justify-center animate-pulse">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </button>
                            )}
                            <div className="relative">
                                <button onClick={() => setProfileOpen(!profileOpen)} className="p-2 rounded-full text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-cta-hover transition-colors">
                                    <UserIcon />
                                </button>
                                {profileOpen && (
                                    <div 
                                        className="absolute right-0 mt-2 w-56 bg-card-bg dark:bg-gray-700 rounded-md shadow-lg py-1 z-50 origin-top-right animate-fade-in"
                                        style={{animationDuration: '150ms'}}
                                    >
                                        <div className="px-4 py-3 text-sm text-text-secondary dark:text-gray-300 border-b border-border-divider dark:border-gray-600">
                                            <p className="font-semibold text-text-primary dark:text-white truncate">Welcome, {user.name}</p>
                                            <p className="truncate">{user.email}</p>
                                        </div>
                                        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); setProfileOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-accent dark:hover:text-accent transition-colors">
                                            Sign Out
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="md:hidden">
                                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-full text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <HamburgerIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Backdrop */}
            <div
                className={`md:hidden fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
                    isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            ></div>

            {/* Mobile Menu Drawer */}
            <div
                className={`md:hidden fixed top-0 right-0 h-full w-80 bg-neutral-bg dark:bg-gray-900 z-40 shadow-2xl transform transition-transform duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-4 flex justify-between items-center border-b border-border-divider dark:border-gray-700">
                     <h2 className="font-bold text-lg text-primary">Menu</h2>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon />
                    </button>
                </div>
                <nav className="flex flex-col p-4 space-y-2">
                    {navItems.map(item => (
                        <button 
                            key={item.name} 
                            onClick={() => handleMobileNavClick(item.page)} 
                            className="flex items-center space-x-4 text-lg p-3 rounded-md text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-cta-hover transition duration-200 group"
                        >
                            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Header;
