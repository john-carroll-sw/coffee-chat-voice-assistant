
from typing import List
from models import OrderItem, OrderSummary

class OrderState:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OrderState, cls).__new__(cls)
            cls._instance.order_state = []
            cls._instance.order_summary = OrderSummary(items=[], total=0.0, tax=0.0, finalTotal=0.0)
        return cls._instance

    def _update_summary(self):
        total = sum(item.price * item.quantity for item in self.order_state)
        tax = total * 0.08  # 8% tax
        finalTotal = total + tax
        self.order_summary = OrderSummary(items=self.order_state, total=total, tax=tax, finalTotal=finalTotal)

    def handle_order_update(self, action: str, item_name: str, size: str, quantity: int, price: float):
        # Format the display name based on the size
        formatted_size = ""
        if size.lower() == "standard":
            formatted_size = ""
        elif size.lower() == "kannchen":
            formatted_size = "Kannchen of "
        elif size.lower() == "pot":
            formatted_size = "Pot of "
        else:
            formatted_size = f"{size.capitalize()} "

        display = f"{formatted_size}{item_name}".strip()

        # Check if the item already exists in the order by matching the item name and size
        existing_item_index = next((index for index, order_item in enumerate(self.order_state) if order_item.item == item_name and order_item.size == size), -1)

        if action == "add":
            if existing_item_index != -1:
                # If item exists, update the quantity
                self.order_state[existing_item_index].quantity += quantity
            else:
                # If item does not exist, add new item
                self.order_state.append(OrderItem(item=item_name, size=size, quantity=quantity, price=price, display=display))
        elif action == "remove":
            if existing_item_index != -1:
                # If item exists, decrement the quantity or remove it if quantity becomes zero
                if self.order_state[existing_item_index].quantity > quantity:
                    self.order_state[existing_item_index].quantity -= quantity
                else:
                    self.order_state.pop(existing_item_index)

        # Update the order summary
        self._update_summary()

    def get_order_summary(self) -> OrderSummary:
        return self.order_summary

# Create a singleton instance of OrderState
order_state_singleton = OrderState()