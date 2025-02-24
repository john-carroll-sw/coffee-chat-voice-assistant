import logging
import os
from pathlib import Path

from aiohttp import web
from azure.core.credentials import AzureKeyCredential
from azure.identity import AzureDeveloperCliCredential, DefaultAzureCredential
from dotenv import load_dotenv

from tools import attach_tools_rtmt
from rtmt import RTMiddleTier
from azurespeech import AzureSpeech

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voicerag")

# Load environment variables from .env file
load_dotenv()

# Create the web application
async def create_app():
    if not os.environ.get("RUNNING_IN_PRODUCTION"):
        logger.info("Running in development mode, loading from .env file")
        load_dotenv()
    
    llm_endpoint = os.environ.get("AZURE_OPENAI_EASTUS2_ENDPOINT")
    llm_deployment = os.environ.get("AZURE_OPENAI_REALTIME_DEPLOYMENT")
    llm_key = os.environ.get("AZURE_OPENAI_EASTUS2_API_KEY")
    search_key = os.environ.get("AZURE_SEARCH_API_KEY")

    credential = None
    if not llm_key or not search_key:
        if tenant_id := os.environ.get("AZURE_TENANT_ID"):
            logger.info("Using AzureDeveloperCliCredential with tenant_id %s", tenant_id)
            credential = AzureDeveloperCliCredential(tenant_id=tenant_id, process_timeout=60)
        else:
            logger.info("Using DefaultAzureCredential")
            credential = DefaultAzureCredential()
    llm_credential = AzureKeyCredential(llm_key) if llm_key else credential
    search_credential = AzureKeyCredential(search_key) if search_key else credential
    
    app = web.Application()

    rtmt = RTMiddleTier(
        credentials=llm_credential,
        endpoint=llm_endpoint,
        deployment=llm_deployment,
        voice_choice=os.environ.get("AZURE_OPENAI_REALTIME_VOICE_CHOICE") or "alloy"
    )
    rtmt.temperature = 0.6
    rtmt.system_message = (
        "You are a virtual barista assistant for a café, dedicated to providing an exceptional customer experience. "
        "Your role is to assist customers in ordering beverages from the café menu and managing their orders with accuracy, clarity, and friendliness. "
        "Always prioritize grounding your responses in the café menu using the 'search' tool, ensuring every interaction is informative and aligned with the menu offerings. "
        "Maintain a warm, professional tone in every interaction, ensuring customers feel valued and understood. "
        "When a customer speaks to you in a specific language, such as Spanish, you must respond in that same language. "
        "If the customer switches to a different language during the conversation, you must also switch to that new language for your responses. "

        "Important Guidelines: "
        "1. Always use the 'search' tool to check the café menu for accurate information before responding to any question. "
        "2. Use the 'update_order' tool to add items to the customer's order, specifying the item name, size, quantity, and price, only after the customer has requested and confirmed the item. "
        "3. Use the 'update_order' tool to remove items from the customer's order, specifying the item name, size, and quantity, only when the customer explicitly requests it. "
        "4. Use the 'get_order' tool to provide a concise summary of the customer's current order when requested. Always call this tool when the customer indicates they are ready to finish the order, and ensure to communicate the total price of the order clearly. "
        "5. Provide answers that are as short as possible while still being friendly and complete. Aim for single-sentence responses unless further clarification is requested. "
        "6. If the required information is not available in the menu, respond with, 'I'm sorry, I don't have that information right now.' "

        "Additional Considerations: "
        "1. The user is listening to your responses with audio, so ensure your answers are clear, engaging, and easy to understand. "
        "2. Never read file names, source names, or keys out loud to the customer. "
        "3. Always respect the customer's preferences and maintain a courteous and professional demeanor. "
        "4. Where appropriate, ask the customer if they would like to add whipped cream ($0.50), a flavor shot ($0.75), or an extra shot of espresso ($1.00) as separate items to their order. Ensure these are added as individual line items with their respective costs in the itemized order. "
    )

    attach_tools_rtmt(rtmt,
        credentials=search_credential,
        search_endpoint=os.environ.get("AZURE_SEARCH_ENDPOINT"),
        search_index=os.environ.get("AZURE_SEARCH_INDEX"),
        semantic_configuration=os.environ.get("AZURE_SEARCH_SEMANTIC_CONFIGURATION") or "default",
        identifier_field=os.environ.get("AZURE_SEARCH_IDENTIFIER_FIELD") or "chunk_id",
        content_field=os.environ.get("AZURE_SEARCH_CONTENT_FIELD") or "chunk",
        embedding_field=os.environ.get("AZURE_SEARCH_EMBEDDING_FIELD") or "text_vector",
        title_field=os.environ.get("AZURE_SEARCH_TITLE_FIELD") or "title",
        use_vector_query=(os.environ.get("AZURE_SEARCH_USE_VECTOR_QUERY") == "true") or True
    )

    rtmt.attach_to_app(app, "/realtime")

    # azurespeech = AzureSpeech(system_message=rtmt.system_message)
    # azurespeech.attach_to_app(app, "/azurespeech")

    current_directory = Path(__file__).parent
    app.add_routes([web.get('/', lambda _: web.FileResponse(current_directory / 'static/index.html'))])
    app.router.add_static('/', path=current_directory / 'static', name='static')
    # app.router.add_static('/images', path=current_directory / 'images', name='images')  # Commented out
    
    return app

if __name__ == "__main__":
    host = os.environ.get("HOST", "localhost")  # Change default host to localhost
    port = int(os.environ.get("PORT", 8000))  # Change default port to 8000
    web.run_app(create_app(), host=host, port=port)
