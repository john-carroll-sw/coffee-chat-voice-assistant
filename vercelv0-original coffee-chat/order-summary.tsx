import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface OrderSummaryProps {
  order: Array<{ item: string; price: number }>
}

export function OrderSummary({ order }: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const total = order.reduce((sum, item) => sum + item.price, 0)
  const tax = total * 0.08 // 8% tax
  const finalTotal = total + tax

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Your Order</h2>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden text-sm text-gray-500 flex items-center"
        >
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
      <div className={`space-y-2 ${isExpanded ? 'block' : 'hidden md:block'}`}>
        {order.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{item.item}</span>
            <span className="font-mono">${item.price.toFixed(2)}</span>
          </div>
        ))}
        
        <div className="border-t mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-mono">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (8%)</span>
            <span className="font-mono">${tax.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between font-semibold mt-4">
        <span>Total</span>
        <span className="font-mono">${finalTotal.toFixed(2)}</span>
      </div>
    </div>
  )
}

