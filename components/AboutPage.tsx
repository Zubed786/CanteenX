
import React from 'react';

const AboutPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto bg-card-bg dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl font-extrabold text-primary dark:text-cta-hover mb-4 text-center">About CanteenX</h1>
            <p className="text-lg text-text-secondary dark:text-gray-300 text-center mb-8">
                Revolutionizing the campus dining experience.
            </p>
            <div className="space-y-6 text-text-primary dark:text-gray-200">
                <p>
                    CanteenX is a modern, digital-first solution designed to streamline the canteen experience for both students and staff. Our mission is to eliminate long queues, reduce wait times, and provide a seamless, enjoyable way to order and enjoy food on campus.
                </p>
                <p>
                    With our intuitive web platform, students can browse the full menu, place pre-orders from anywhere, and get notified when their food is ready for pickup. This means more time for studying, socializing, and relaxing, and less time spent waiting in line.
                </p>
                <div>
                    <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 mb-2">Key Features for Students:</h2>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li><strong>Online Pre-ordering:</strong> Order your favorite meals ahead of time.</li>
                        <li><strong>Real-time Order Tracking:</strong> Know exactly when your order is ready.</li>
                        <li><strong>Smart Carts:</strong> Save your regular orders for one-click reordering.</li>
                        <li><strong>Detailed Menu:</strong> View nutritional information, ratings, and ingredients.</li>
                        <li><strong>Easy Filtering:</strong> Find exactly what you're craving with smart filters.</li>
                    </ul>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-secondary dark:text-gray-100 mb-2">Powerful Tools for Staff:</h2>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                        <li><strong>Menu Management:</strong> Easily add, update, and manage food items and availability.</li>
                        <li><strong>Order Dashboard:</strong> A centralized view to manage all incoming orders efficiently.</li>
                        <li><strong>Billing & Analytics:</strong> Streamline billing and gain insights into sales trends.</li>
                    </ul>
                </div>
                <p>
                    We believe in using technology to create smarter, more efficient campus environments. CanteenX is more than just an app; it's a commitment to a better, tastier, and more convenient dining experience for everyone.
                </p>
            </div>
        </div>
    );
};

export default AboutPage;
