
import React, { useState } from 'react';

const FeedbackPage: React.FC = () => {
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (feedback.trim()) {
            console.log("Feedback submitted:", feedback);
            setSubmitted(true);
            setFeedback('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-6 text-center">We Value Your Feedback</h1>
            {submitted ? (
                <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 rounded-md" role="alert">
                    <p className="font-bold">Thank you!</p>
                    <p>Your feedback has been submitted successfully.</p>
                </div>
            ) : (
                <div className="bg-card-bg dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="feedback" className="block text-text-secondary dark:text-gray-300 mb-2 font-semibold">
                                Please share your thoughts, suggestions, or any issues you've faced.
                            </label>
                            <textarea
                                id="feedback"
                                rows={8}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full p-3 border border-border-divider dark:border-gray-600 rounded-md bg-neutral-bg dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:outline-none"
                                placeholder="Type your feedback here..."
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-cta-hover transition-colors"
                        >
                            Submit Feedback
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FeedbackPage;
