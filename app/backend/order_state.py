from typing import List, Dict
from models import OrderItem, OrderSummary
import logging
import uuid

logger = logging.getLogger("order_state")

class OrderState:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OrderState, cls).__new__(cls)
            cls._instance.sessions = {}
        return cls._instance

    def _update_summary(self, session_id: str):
        session = self.sessions[session_id]
        total = sum(item.price * item.quantity for item in session["order_state"])
        tax = total * 0.08  # 8% tax
        finalTotal = total + tax
        session["order_summary"] = OrderSummary(items=session["order_state"], total=total, tax=tax, finalTotal=finalTotal)
        logger.info(f"Order Summary Updated for session {session_id}: {session['order_summary']}")

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "order_state": [],
            "order_summary": OrderSummary(items=[], total=0.0, tax=0.0, finalTotal=0.0)
        }
        self._update_summary(session_id)
        logger.info(f"Session created with ID {session_id}")
        return session_id

    def handle_order_update(self, session_id: str, action: str, item_name: str, size: str, quantity: int, price: float):
        session = self.sessions[session_id]
        order_state = session["order_state"]

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

        existing_item_index = next((index for index, order_item in enumerate(order_state) if order_item.item == item_name and order_item.size == size), -1)

        if action == "add":
            if existing_item_index != -1:
                order_state[existing_item_index].quantity += quantity
                logger.info(f"Updated quantity for {display} in session {session_id}")
            else:
                order_state.append(OrderItem(item=item_name, size=size, quantity=quantity, price=price, display=display))
                logger.info(f"Added {display} to session {session_id}")
        elif action == "remove":
            if existing_item_index != -1:
                if order_state[existing_item_index].quantity > quantity:
                    order_state[existing_item_index].quantity -= quantity
                    logger.info(f"Decreased quantity for {display} in session {session_id}")
                else:
                    order_state.pop(existing_item_index)
                    logger.info(f"Removed {display} from session {session_id}")

        self._update_summary(session_id)

    def get_order_summary(self, session_id: str) -> OrderSummary:
        order_summary = self.sessions[session_id]["order_summary"]
        logger.info(f"Order Summary Retrieved for session {session_id}: {order_summary}")
        return order_summary

# Create a singleton instance of OrderState
order_state_singleton = OrderState()