import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderPageProps {
    orders: Order[];
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PLACED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case OrderStatus.PREPARING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case OrderStatus.READY: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case OrderStatus.COMPLETED: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        default: return '';
    }
}

const OrderCard: React.FC<{ order: Order, isCurrent?: boolean }> = ({ order, isCurrent }) => {
    const statuses = [OrderStatus.PLACED, OrderStatus.PREPARING, OrderStatus.READY];
    const currentStatusIndex = statuses.indexOf(order.status);

    return (
        <div className="bg-card-bg dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold text-secondary dark:text-gray-100">Order #{order.id.slice(-6)}</h2>
                    <p className="text-sm text-text-secondary dark:text-gray-400">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                </div>
            </div>
            {isCurrent && currentStatusIndex !== -1 && (
                 <div className="flex items-center w-full my-6">
                    {statuses.map((status, index) => {
                        const isCompleted = index < currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        return (
                            <React.Fragment key={status}>
                                <div className="flex flex-col items-center text-center flex-shrink-0 px-2">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
                                        ${isCompleted ? 'bg-primary text-white' : ''}
                                        ${isCurrent ? 'bg-primary text-white ring-4 ring-primary/30' : ''}
                                        ${!isCompleted && !isCurrent ? 'bg-gray-200 dark:bg-gray-600 text-text-secondary dark:text-gray-300' : ''}
                                        `}
                                    >
                                        {isCompleted ? '✓' : index + 1}
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold w-24 break-words
                                        ${isCurrent ? 'text-primary dark:text-cta-hover' : 'text-text-secondary dark:text-gray-400'}
                                    `}>
                                        {status}
                                    </p>
                                </div>

                                {index < statuses.length - 1 && (
                                    <div className={`flex-1 h-1.5 transition-colors duration-500
                                        ${isCompleted ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}
                                    `}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
            <div>
                {order.items.map(item => (
                    <div key={item.id} className="flex justify-between py-1 text-sm">
                        <span className="text-text-secondary dark:text-gray-300">{item.name} x {item.quantity}</span>
                        <span className="text-text-primary dark:text-gray-200">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="border-t border-border-divider dark:border-gray-700 mt-2 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};


const OrderPage: React.FC<OrderPageProps> = ({ orders }) => {
    const activeOrders = orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);
    const pastOrders = orders.filter(o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED);

    return (
        <div>
            <h1 className="text-3xl font-bold text-secondary dark:text-gray-100 mb-6">My Orders</h1>
            
            <h2 className="text-2xl font-semibold text-primary dark:text-cta-hover mb-4">Current Orders</h2>
            {activeOrders.length > 0 ? (
                activeOrders.map(order => <OrderCard key={order.id} order={order} isCurrent={true} />)
            ) : (
                <p className="text-text-secondary dark:text-gray-400">You have no active orders.</p>
            )}

            <h2 className="text-2xl font-semibold text-primary dark:text-cta-hover mt-10 mb-4">Order History</h2>
            {pastOrders.length > 0 ? (
                pastOrders.map(order => <OrderCard key={order.id} order={order} />)
            ) : (
                <p className="text-text-secondary dark:text-gray-400">No past orders found.</p>
            )}
        </div>
    );
};

export default OrderPage;