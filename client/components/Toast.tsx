import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string | null;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
    const [visible, setVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');

    useEffect(() => {
        // FIX: Replaced explicit NodeJS.Timeout type with inferred type to be compatible with browser environments,
        // which resolves the "Cannot find namespace 'NodeJS'" error.
        // Also fixed a bug where the toast would not disappear if the message was cleared.
        if (message) {
            setCurrentMessage(message);
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 2800);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
        }
    }, [message]);

    return (
        <div 
            className={`fixed bottom-5 right-5 bg-secondary text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 transition-all duration-300
            ${visible ? 'animate-toast-in' : (currentMessage ? 'animate-toast-out' : 'hidden')}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cta-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-semibold">{currentMessage}</span>
        </div>
    );
};

export default Toast;
