import logging
import os
from pathlib import Path

from aiohttp import web
from azure.core.credentials import AzureKeyCredential
from azure.identity import AzureDeveloperCliCredential, DefaultAzureCredential
from dotenv import load_dotenv

from ragtools import attach_rag_tools
from rtmt import RTMiddleTier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voicerag")

async def create_app():
    if not os.environ.get("RUNNING_IN_PRODUCTION"):
        logger.info("Running in development mode, loading from .env file")
        load_dotenv()
    llm_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
    llm_deployment = os.environ.get("AZURE_OPENAI_REALTIME_DEPLOYMENT")
    llm_key = os.environ.get("AZURE_OPENAI_API_KEY")
    search_endpoint = os.environ.get("AZURE_SEARCH_ENDPOINT")
    search_index = os.environ.get("AZURE_SEARCH_INDEX")
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

    rtmt = RTMiddleTier(llm_endpoint, llm_deployment, llm_credential)
    # rtmt.system_message = "You are a helpful assistant. Only answer questions based on information you searched in the knowledge base, accessible with the 'search' tool. " + \
    #                       "The user is listening to answers with audio, so it's *super* important that answers are as short as possible, a single sentence if at all possible. " + \
    #                       "Never read file names or source names or keys out loud. " + \
    #                       "Always use the following step-by-step instructions to respond: \n" + \
    #                       "1. Always use the 'search' tool to check the knowledge base before answering a question. \n" + \
    #                       "2. Always use the 'report_grounding' tool to report the source of information from the knowledge base. \n" + \
    #                       "3. Produce an answer that's as short as possible. If the answer isn't in the knowledge base, say you don't know."

    rtmt.system_message = (
        "You are a helpful barista for Starbucks. "
        "You designed to answer questions and take orders for beverages and food. "
        "For taking orders, you will roleplay and ask for the user's name, the items they want to order, and the size of the items. "
        "You help answer questions about Starbucks' beverages, food, nutrition, and prices. "
        "Your responses are always grounded in the information contained in our knowledge base, specifically referencing data from Starbucks' documents. "
        "Please ensure that your answers are accurate and relevant, always based on these documents.\n\n"

        "Always use the following step-by-step instructions to respond:\n\n"
        "1. Search First: Always use the 'search' tool to check the knowledge base before answering a question.\n"
        "2. Cite Sources: Always use the 'report_grounding' tool to report the source of information found in the knowledge base.\n"
        "3. Keep It Simple: Produce an answer that is short, concise, and helpful. If the answer isn't available in the knowledge base, simply state that the information is unavailable.\n"
        "4. Tailor for Audio: Answers should be optimized for listening, ideally a single sentence or a few succinct phrases. Avoid reading file names, source names, or any irrelevant data out loud.\n"
        "5. Specific Topics: The user may ask about beverages, food items, nutritional content, or pricing. \n"
        "6. Finish Order: Tally the order and ask if the user would like to add anything else, i.e, if it's a coffee beverage see if the customer wants any added espresso shots or syrup. \m"
        "Prioritize responses from the documents provided and ensure clarity and friendliness, matching Starbucks' welcoming tone.\n\n"
        "Your goal is to be accurate, grounded in the documents, and as engaging as possible while keeping answers succinct."
    )
    attach_rag_tools(rtmt, search_endpoint, search_index, search_credential)

    rtmt.attach_to_app(app, "/realtime")

    current_directory = Path(__file__).parent
    app.add_routes([web.get('/', lambda _: web.FileResponse(current_directory / 'static/index.html'))])
    app.router.add_static('/', path=current_directory / 'static', name='static')
    
    return app

if __name__ == "__main__":
    host = "localhost"
    port = 8765
    web.run_app(create_app(), host=host, port=port)
