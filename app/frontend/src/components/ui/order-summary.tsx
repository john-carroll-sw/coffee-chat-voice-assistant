import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface OrderItem {
    item: string;
    size: string;
    quantity: number;
    price: number;
    display: string;
}

export interface OrderSummaryProps {
    items: OrderItem[];
    total: number;
    tax: number;
    finalTotal: number;
}

export function calculateOrderSummary(items: OrderItem[]): OrderSummaryProps {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = total * 0.08; // 8% tax
    const finalTotal = total + tax;

    return {
        items,
        total,
        tax,
        finalTotal
    };
}

export default function OrderSummary({ order }: { order: OrderSummaryProps }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { items, total, tax, finalTotal } = order;

    return (
        <div className="rounded-lg border bg-white p-4 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Your Order</h2>
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center text-sm text-gray-500 dark:text-gray-300 md:hidden">
                    {isExpanded ? (
                        <>
                            Less <ChevronUp className="ml-1 h-4 w-4" />
                        </>
                    ) : (
                        <>
                            More <ChevronDown className="ml-1 h-4 w-4" />
                        </>
                    )}
                </button>
            </div>
            <div className={`space-y-2 ${isExpanded ? "block" : "hidden md:block"}`}>
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                        <span>
                            {item.display} {item.quantity > 1 && `(x${item.quantity})`}
                        </span>
                        <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}

                <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <div className="flex justify-between text-sm text-gray-900 dark:text-gray-100">
                        <span>Subtotal</span>
                        <span className="font-mono">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-900 dark:text-gray-100">
                        <span>Tax (8%)</span>
                        <span className="font-mono">${tax.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-between font-semibold text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span className="font-mono">${finalTotal.toFixed(2)}</span>
            </div>
        </div>
    );
}
