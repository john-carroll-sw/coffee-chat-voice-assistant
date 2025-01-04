import re
from typing import Any

from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
from azure.search.documents.aio import SearchClient
from azure.search.documents.models import VectorizableTextQuery

from rtmt import RTMiddleTier, Tool, ToolResult, ToolResultDirection

_search_tool_schema = {
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

_grounding_tool_schema = {
    "type": "function",
    "name": "report_grounding",
    "description": "Report use of a source from the knowledge base as part of an answer (effectively, cite the source). Sources " + \
                   "appear in square brackets before each knowledge base passage. Always use this tool to cite sources when responding " + \
                   "with information from the knowledge base.",
    "parameters": {
        "type": "object",
        "properties": {
            "sources": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "List of source names from last statement actually used, do not include the ones not used to formulate a response"
            }
        },
        "required": ["sources"],
        "additionalProperties": False
    }
}

async def _search_tool(
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
        # select=", ".join([identifier_field, content_field])
        select=["id", "category", "item", "description", "price"],
    )
    result = ""

    async for r in search_results:
        # print(f"Search result fields: {r.keys()}")  # Debugging line to print available fields
        result += f"[{r['id']}]: Category: {r['category']}, Item: {r['item']}, Description: {r['description']}, Price: {r['price']}\n-----\n"
    return ToolResult(result, ToolResultDirection.TO_SERVER)

KEY_PATTERN = re.compile(r'^[a-zA-Z0-9_=\-]+$')

# TODO: move from sending all chunks used for grounding eagerly to only sending links to 
# the original content in storage, it'll be more efficient overall
async def _report_grounding_tool(search_client: SearchClient, identifier_field: str, title_field: str, content_field: str, args: Any) -> None:
    sources = [s for s in args["sources"]]
    list = " OR ".join(sources)
    print("\nReporting grounding sources...")
    print(f"Grounding source: {list}")
    # Use search instead of filter to align with how detailt integrated vectorization indexes
    # are generated, where chunk_id is searchable with a keyword tokenizer, not filterable 
    # search_results = await search_client.search(search_text=list, 
    #                                             search_fields=[identifier_field], 
    #                                             select=[identifier_field, title_field, content_field], 
    #                                             top=len(sources), 
    #                                             query_type="full")
    
    # If your index has a key field that's filterable but not searchable and with the keyword analyzer, you can 
    # use a filter instead (and you can remove the regex check above, just ensure you escape single quotes)
    search_results = await search_client.search(filter=f"search.in(id, '{list}')", select=["id", "category", "item", "description", "price"])

    docs = []
    async for r in search_results:
        docs.append({"id": r[identifier_field], "title": r[title_field], "content": r[content_field]})
    return ToolResult({"sources": docs}, ToolResultDirection.TO_CLIENT)

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

    rtmt.tools["search"] = Tool(schema=_search_tool_schema, target=lambda args: _search_tool(search_client, semantic_configuration, identifier_field, content_field, embedding_field, use_vector_query, args))
    # rtmt.tools["report_grounding"] = Tool(schema=_grounding_tool_schema, target=lambda args: _report_grounding_tool(search_client, identifier_field, title_field, content_field, args))
