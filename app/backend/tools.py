import re
from typing import Any

from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
from azure.search.documents.aio import SearchClient
from azure.search.documents.models import VectorizableTextQuery

from rtmt import RTMiddleTier, Tool, ToolResult, ToolResultDirection

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
    print("\nStarting search...")
    print(f"Searching for '{query}' in the knowledge base.")
    
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
    Dynamic Price Retrieval:
        Whenever GPT-4o encounters a pricing-related request (e.g., "How much is a Large Cappuccino?" or "Add a Large Mocha to my order"), it should query the menu for the item's price and size.
    State Management:
        Update the order state in both the frontend (UI) and backend to reflect the current items and prices.
    Error Prevention:
        Avoid hallucination by always calling the backend function for price lookup and calculation instead of relying on the model to calculate totals.
    Support User Queries:
        Enable GPT-4o to explain price breakdowns (e.g., "The Large Cappuccino costs $5.50, and the extra shot adds $1.00.").
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
            "price": { 
                "type": "number", 
                "description": "Price of the item to add. Required only for 'add' action."
            }
        },
        "required": ["action", "item_name", "size"],
        "additionalProperties": False
    }
}

async def update_order(args):
    """
    Update the current order by adding or removing items.
    """
    print("\nStarting update_order...")
    print(args)
    return ToolResult(args, ToolResultDirection.TO_CLIENT)

def attach_tools(rtmt: RTMiddleTier,
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
    rtmt.tools["update_order"] = Tool(schema=update_order_tool_schema, target=lambda args: update_order(args))
    
