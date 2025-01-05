from pydantic import BaseModel
from typing import List

class OrderItem(BaseModel):
    item: str
    size: str
    quantity: int
    price: float
    display: str
    
class OrderSummary(BaseModel):
    items: List[OrderItem]
    total: float
    tax: float
    finalTotal: float