import React, { useState } from 'react';
import { CloseIcon } from './icons/Icons';

interface LoginModalProps {
    onLogin: (email: string) => void;
    onSignUp: (name: string, email: string) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onSignUp }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('student@canteenx.com');
    const [password, setPassword] = useState('password');
    const [confirmPassword, setConfirmPassword] = useState('password');

    const resetFieldsForMode = (signUpMode: boolean) => {
        setName('');
        setPassword('password');
        setConfirmPassword('password');
        if (signUpMode) {
            setEmail('');
        } else {
            setEmail('student@canteenx.com');
        }
    };

    const toggleMode = () => {
        const newIsSignUp = !isSignUp;
        setIsSignUp(newIsSignUp);
        resetFieldsForMode(newIsSignUp);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignUp) {
            if (password !== confirmPassword) {
                alert("Passwords do not match!"); // Simple validation for demo
                return;
            }
            onSignUp(name, email);
        } else {
            onLogin(email);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-card-bg dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-sm relative transition-all">
                <button 
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  aria-label="Close"
                >
                    <CloseIcon />
                </button>
                
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-2">
                        {isSignUp ? 'Create Student Account' : 'Welcome to CanteenX'}
                    </h2>
                    <p className="text-text-secondary dark:text-gray-400">
                        {isSignUp ? 'Get started with your new account' : 'Sign in to order fresh, healthy meals'}
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="animate-fade-in" style={{animationDuration: '300ms'}} key={isSignUp ? 'signup' : 'login'}>
                    <div className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-2">Full Name</label>
                                <input 
                                    id="name" 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 border border-border-divider dark:border-gray-600 rounded-lg bg-neutral-bg dark:bg-gray-700 text-text-primary dark:text-gray-200 focus:ring-1 focus:ring-primary focus:outline-none focus:border-primary transition-shadow"
                                    required 
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-2">Email</label>
                            <input 
                                id="email" 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-border-divider dark:border-gray-600 rounded-lg bg-neutral-bg dark:bg-gray-700 text-text-primary dark:text-gray-200 focus:ring-1 focus:ring-primary focus:outline-none focus:border-primary transition-shadow"
                                required 
                                placeholder={isSignUp ? "Enter your email" : ""}
                            />
                        </div>
                        <div>
                            <label htmlFor="password"  className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-2">Password</label>
                            <input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-border-divider dark:border-gray-600 rounded-lg bg-neutral-bg dark:bg-gray-700 text-text-primary dark:text-gray-200 focus:ring-1 focus:ring-primary focus:outline-none focus:border-primary transition-shadow"
                                required
                             />
                        </div>
                        {isSignUp && (
                            <div>
                                <label htmlFor="confirmPassword"  className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-2">Confirm Password</label>
                                <input 
                                    id="confirmPassword" 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 border border-border-divider dark:border-gray-600 rounded-lg bg-neutral-bg dark:bg-gray-700 text-text-primary dark:text-gray-200 focus:ring-1 focus:ring-primary focus:outline-none focus:border-primary transition-shadow"
                                    required
                                />
                            </div>
                        )}
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full bg-primary text-white py-3 mt-6 rounded-lg font-semibold hover:bg-cta-hover transition-transform transform hover:scale-105 duration-300 shadow-md hover:shadow-lg"
                    >
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-text-secondary mt-6">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <button onClick={toggleMode} className="font-semibold text-primary hover:underline focus:outline-none">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginModal;