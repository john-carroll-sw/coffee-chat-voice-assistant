import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface OrderSummaryProps {
    order: Array<{ item: string; price: number }>;
}

export default function OrderSummary({ order }: OrderSummaryProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const total = order.reduce((sum, item) => sum + item.price, 0);
    const tax = total * 0.08; // 8% tax
    const finalTotal = total + tax;

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
                {order.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                        <span>{item.item}</span>
                        <span className="font-mono">${item.price.toFixed(2)}</span>
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
