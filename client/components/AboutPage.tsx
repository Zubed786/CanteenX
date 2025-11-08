import React, { useState, useEffect } from 'react';
import { TimeSaveIcon, EasyFilterIcon, AnalyticsIcon, OrderIcon, SmartCartIcon, MenuIcon } from './icons/Icons';

interface ParallaxBannerProps {
    imageUrl: string;
    children: React.ReactNode;
}

const ParallaxBanner: React.FC<ParallaxBannerProps> = ({ imageUrl, children }) => {
    const [scrollOffset, setScrollOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            // Only update if the element is in view for performance
            const element = document.getElementById(imageUrl); // Use URL as a makeshift ID
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom >= 0) {
                     setScrollOffset(window.pageYOffset - element.offsetTop);
                }
            }
        };

        // Attach event listener with a unique ID for the component instance
        const element = document.getElementById(imageUrl);
        if (element) {
             window.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (element) {
                window.removeEventListener('scroll', handleScroll);
            }
        };
    }, [imageUrl]);

    return (
        <div
            id={imageUrl}
            className="bg-cover bg-center bg-fixed h-80 rounded-2xl my-16 flex items-center justify-center text-white relative overflow-hidden shadow-2xl"
            style={{
                backgroundImage: `url('${imageUrl}')`,
                backgroundPositionY: `${scrollOffset * 0.3}px`
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30"></div>
            <div className="relative text-center p-8 z-10">
                {children}
            </div>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-card-bg dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
        <div className="mx-auto bg-primary/20 text-primary rounded-full h-16 w-16 flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-secondary dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-text-secondary dark:text-gray-400">{description}</p>
    </div>
);


const AboutPage: React.FC = () => {
    return (
        <div className="animate-fade-in">
            <div className="text-center mb-16">
                <h1 className="text-5xl font-extrabold text-primary dark:text-cta-hover mb-4 leading-tight">
                    Welcome to CanteenX
                </h1>
                <p className="text-xl text-text-secondary dark:text-gray-300 max-w-3xl mx-auto">
                    We're revolutionizing the campus dining experience by bringing speed, convenience, and delicious food right to your fingertips.
                </p>
            </div>

            <ParallaxBanner imageUrl="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1374&auto=format&fit=crop">
                 <h2 className="text-4xl font-bold drop-shadow-md">Our Mission</h2>
                <p className="mt-4 max-w-2xl text-lg drop-shadow-sm">To eliminate queues and provide a seamless, enjoyable way for students and staff to order and enjoy food on campus.</p>
            </ParallaxBanner>

            <div className="grid md:grid-cols-2 gap-12 items-center my-20">
                <div className="prose dark:prose-invert max-w-none">
                     <h3 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-4">Our Story</h3>
                    <p>
                        CanteenX was born from a simple observation: students and staff spend too much valuable time waiting in line for food. We saw an opportunity to use technology to reclaim that time.
                    </p>
                    <p>
                        We envisioned a smarter, more efficient campus where pre-ordering meals is the norm, allowing everyone to focus on what truly matters—learning, collaboration, and enjoying their break time.
                    </p>
                </div>
                 <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1470&auto=format&fit=crop" alt="Happy students collaborating" className="rounded-lg shadow-xl" />
            </div>

            <div className="my-20">
                <h3 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-10 text-center">Why Choose CanteenX?</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<TimeSaveIcon />}
                        title="Save Time"
                        description="Order ahead and skip the queue entirely. Your food is ready when you are."
                    />
                     <FeatureCard 
                        icon={<EasyFilterIcon />}
                        title="Smart Search"
                        description="Easily filter by diet, category, or rating to find exactly what you're craving."
                    />
                     <FeatureCard 
                        icon={<OrderIcon />}
                        title="Track Your Order"
                        description="Get real-time updates on your order status from preparation to pickup."
                    />
                     <FeatureCard 
                        icon={<SmartCartIcon />}
                        title="One-Click Reorder"
                        description="Save your favorite meals in a 'Smart Cart' for lightning-fast reordering next time."
                    />
                     <FeatureCard 
                        icon={<MenuIcon />}
                        title="Easy Menu Control"
                        description="For staff: effortlessly update menu items, prices, and stock status in real-time."
                    />
                     <FeatureCard 
                        icon={<AnalyticsIcon />}
                        title="Actionable Insights"
                        description="Staff get access to a powerful dashboard to track sales and manage orders efficiently."
                    />
                </div>
            </div>

             <ParallaxBanner imageUrl="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1470&auto=format&fit=crop">
                <h2 className="text-4xl font-bold drop-shadow-md">Built on Modern Technology</h2>
                <p className="mt-4 max-w-2xl text-lg drop-shadow-sm">A fast, reliable, and intuitive platform designed for the best user experience.</p>
            </ParallaxBanner>

            <div className="grid md:grid-cols-2 gap-12 items-center my-20">
                 <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1470&auto=format&fit=crop" alt="Staff dashboard on a laptop" className="rounded-lg shadow-xl order-last md:order-first" />
                 <div className="prose dark:prose-invert max-w-none">
                     <h3 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-4">Powerful Tools for Staff</h3>
                    <p>
                        We empower canteen staff with a simple yet powerful dashboard. Managing online orders, updating menu availability, and adjusting prices has never been easier. This efficiency translates to faster service and happier customers.
                    </p>
                </div>
            </div>
             <div className="text-center mt-20">
                <h2 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-4">Join the CanteenX Revolution</h2>
                <p className="text-text-secondary dark:text-gray-400 max-w-xl mx-auto">Ready for a smarter, tastier, and more convenient dining experience? We're excited to have you with us.</p>
            </div>
        </div>
    );
};

export default AboutPage;