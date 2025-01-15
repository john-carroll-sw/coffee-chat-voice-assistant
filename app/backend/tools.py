from typing import Any

from order_state import order_state_singleton
from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
from azure.search.documents.aio import SearchClient
from azure.search.documents.models import VectorizableTextQuery

from rtmt import RTMiddleTier, Tool, ToolResult, ToolResultDirection


""""
Purpose of the Tool:
    Knowledge Base Search:
        Enable GPT-4o to search the knowledge base for information on beverages, including categories, names, descriptions, origins, caffeine content, brewing methods, popularity, and sizes.
    User Interaction:
        Provide users with detailed information about beverages, including categories, names, descriptions, origins, caffeine content, brewing methods, popularity, and sizes.
    Error Prevention:
        Prevent hallucination by ensuring that all information provided to the user is sourced from the knowledge base.
"""
search_tool_schema = {
    "type": "function",
    "name": "search",
    "description": "Search the knowledge base. The knowledge base is in English, translate to and from English if " + \
                   "needed. Results are formatted as a source name first in square brackets, followed by the text " + \
                   "content, and a line with '-----' at the end of each result.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search query"
            }
        },
        "required": ["query"],
        "additionalProperties": False
    }
}

async def search(
    search_client: SearchClient, 
    semantic_configuration: str,
    identifier_field: str,
    content_field: str,
    embedding_field: str,
    use_vector_query: bool,
    args: Any) -> ToolResult:

    query = args['query']
    print(f"\nStarting search for '{query}' in the knowledge base.")
    
    # Hybrid + Reranking query using Azure AI Search
    vector_queries = []
    if use_vector_query:
        vector_queries.append(VectorizableTextQuery(text=query, k_nearest_neighbors=50, fields=embedding_field))

    # Perform the hybrid search
    search_results = await search_client.search(
        search_text=query, 
        query_type="semantic",
        semantic_configuration_name=semantic_configuration,
        top=5,
        vector_queries=vector_queries,
        select=["id", "category", "name", "description", "longDescription", "origin", "caffeineContent", "brewingMethod", "popularity", "sizes"],
    )
    results = ""

    async for r in search_results:
        results += f"[{r['id']}]: Category: {r['category']}, Name: {r['name']}, Description: {r['description']}, Long Description: {r['longDescription']}, Origin: {r['origin']}, Caffeine Content: {r['caffeineContent']}, Brewing Method: {r['brewingMethod']}, Popularity: {r['popularity']}, Sizes: {r['sizes']}\n-----\n"
    print(f"Search results: {results}")
    return ToolResult(results, ToolResultDirection.TO_SERVER)



"""
Purpose of the Tool:
    Order Management:
        Enable GPT-4o to update the current order by adding or removing items based on user requests.
    State Management:
        Update the current order state, in both the frontend (UI) and backend, by adding or removing items based on user requests.
    User Interaction:
        Provide users with a seamless ordering experience by accurately updating their orders based on their requests.
"""
update_order_tool_schema = {
    "type": "function",
    "name": "update_order",
    "description": "Update the current order by adding or removing items.",
    "parameters": {
        "type": "object",
        "properties": {
            "action": { 
                "type": "string", 
                "description": "Action to perform: 'add' or 'remove'.", 
                "enum": ["add", "remove"]
            },
            "item_name": { 
                "type": "string", 
                "description": "Name of the item to update, e.g., 'Cappuccino'."
            },
            "size": { 
                "type": "string", 
                "description": "Size of the item to update, e.g., 'Large'."
            },
            "quantity": { 
                "type": "integer", 
                "description": "Quantity of the item to update. Represents the number of items."
            },
            "price": { 
                "type": "number", 
                "description": "Price of a single item to add. Required only for 'add' action. Note: This is the price per individual item, not the total price for the quantity."
            }
        },
        "required": ["action", "item_name", "size", "quantity"],
        "additionalProperties": False
    }
}

async def update_order(args, session_id: str) -> ToolResult:
    """
    Update the current order by adding or removing items.
    """
    print(f"\nUpdating the current order for session {session_id}.")
    print(f"Arguments: {args}")
    
    # Update the order state on the backend
    order_state_singleton.handle_order_update(session_id, args["action"], args["item_name"], args["size"], args.get("quantity", 0), args.get("price", 0.0))

    order_summary = order_state_singleton.get_order_summary(session_id)
    
    json_order_summary = order_summary.model_dump_json()
    print(f"Updated Order Summary: {json_order_summary}")

    # Return the updated order state to the frontend client
    return ToolResult(json_order_summary, ToolResultDirection.TO_CLIENT)


"""
Purpose of the Tool:
    Order Summary Retrieval:
        Retrieve the current order summary to provide the user with a concise overview of their order.
    State Management:
        Retrieve the current order state from the backend to display the items, total, tax, and final total.
    User Interaction:
        Enable GPT-4o to communicate the order summary to the user in a clear and concise manner.
"""
get_order_tool_schema = {
    "type": "function",
    "name": "get_order",
    "description": "Retrieve the current order summary.",
    "parameters": {
        "type": "object",
        "properties": {},
        "required": [],
        "additionalProperties": False
    }
}

async def get_order(session_id: str) -> ToolResult:
    """
    Retrieve the current order summary.
    """
    print(f"\nRetrieving the current order summary for session {session_id}.")
    
    order_summary = order_state_singleton.get_order_summary(session_id)
    print(f"Order Summary: {order_summary}")
        
    # Return the order summary to the model
    return ToolResult(order_summary.model_dump_json(), ToolResultDirection.TO_SERVER)


# Attach tools to the RTMiddleTier instance
def attach_tools_rtmt(rtmt: RTMiddleTier,
    credentials: AzureKeyCredential | DefaultAzureCredential,
    search_endpoint: str, search_index: str,
    semantic_configuration: str,
    identifier_field: str,
    content_field: str,
    embedding_field: str,
    title_field: str,
    use_vector_query: bool
    ) -> None:

    if not isinstance(credentials, AzureKeyCredential):
        credentials.get_token("https://search.azure.com/.default") # warm this up before we start getting requests
    search_client = SearchClient(search_endpoint, search_index, credentials, user_agent="RTMiddleTier")

    rtmt.tools["search"] = Tool(schema=search_tool_schema, target=lambda args: search(search_client, semantic_configuration, identifier_field, content_field, embedding_field, use_vector_query, args))
    rtmt.tools["update_order"] = Tool(schema=update_order_tool_schema, target=lambda args, session_id: update_order(args, session_id))
    rtmt.tools["get_order"] = Tool(schema=get_order_tool_schema, target=lambda _, session_id: get_order(session_id))


