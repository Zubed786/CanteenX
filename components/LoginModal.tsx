import React from 'react';
import { UserRole } from '../types';

interface LoginModalProps {
    onLogin: (email: string, role: UserRole) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
    
    const handleStudentLogin = () => {
        onLogin('student@canteenx.com', UserRole.STUDENT);
    }
    
    const handleStaffLogin = () => {
        onLogin('staff@canteenx.com', UserRole.STAFF);
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-card-bg dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-sm text-center transform transition-all animate-fade-in">
                <div className="mx-auto bg-primary/20 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                     <span className="text-5xl">🍔</span>
                </div>
                <h2 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-2">Welcome to CanteenX</h2>
                <p className="text-text-secondary dark:text-gray-400 mb-8">Your smart canteen solution.</p>
                
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-highlight text-yellow-800 dark:text-yellow-300 p-3 text-left text-sm mb-8 rounded-r-md">
                    <p><strong className="font-semibold">Demo Access:</strong> Click a button below to log in instantly.</p>
                </div>

                <div className="flex flex-col space-y-4">
                    <button 
                        onClick={handleStudentLogin}
                        className="w-full bg-primary text-white py-3 rounded-lg hover:bg-cta-hover transition-transform transform hover:scale-105 duration-300 font-semibold text-lg shadow-md hover:shadow-lg"
                    >
                        Login as Student
                    </button>
                    <button 
                        onClick={handleStaffLogin}
                        className="w-full bg-secondary text-white py-3 rounded-lg hover:bg-primary transition-transform transform hover:scale-105 duration-300 font-semibold text-lg shadow-md hover:shadow-lg"
                    >
                        Login as Staff
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;