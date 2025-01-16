# Coffee Chat Voice Assistant

Coffee Chat Voice Assistant is an advanced, voice-driven ordering system leveraging Azure OpenAI GPT-4o Realtime API to recreate the authentic experience of ordering coffee from a friendly café barista. This system provides natural conversations to deliver engaging and intuitive responses, ensuring a seamless and enjoyable user experience. With real-time transcription, every spoken word is captured and displayed, ensuring clarity and accessibility.

As users place their orders, live updates are dynamically reflected on the screen, allowing them to see their selections build in real time. By simulating a true-to-life customer interaction, Coffee Chat Voice Assistant highlights the transformative potential of AI to enhance convenience and personalize the customer experience, creating a uniquely interactive and intuitive journey, adaptable for various industries and scenarios.

Beyond coffee enthusiasts, this technology can enhance accessibility and inclusivity, providing a hands-free, voice-driven experience for retail, hospitality, transportation, and more. Whether ordering on-the-go in a car, placing a contactless order from home, or supporting users with mobility challenges, this assistant demonstrates the limitless potential of AI-driven solutions for seamless user interactions.

## Table of Contents

- [Coffee Chat Voice Assistant](#coffee-chat-voice-assistant)
  - [Table of Contents](#table-of-contents)
  - [Acknowledgment](#acknowledgment)
  - [Visual Demonstrations](#visual-demonstrations)
    - [Desktop 4 Minute Interaction Big Order Demo](#desktop-4-minute-interaction-big-order-demo)
    - [Mobile Multilingual Ordering Demo](#mobile-multilingual-ordering-demo)
    - [UI Elements Walkthrough](#ui-elements-walkthrough)
  - [Features](#features)
    - [Architecture Diagram](#architecture-diagram)
  - [Getting Started](#getting-started)
    - [GitHub Codespaces](#github-codespaces)
    - [VS Code Dev Containers](#vs-code-dev-containers)
    - [Local environment](#local-environment)
  - [Ingesting Menu Items into Azure AI Search](#ingesting-menu-items-into-azure-ai-search)
    - [From JSON](#from-json)
      - [Steps:](#steps)
    - [From PDF](#from-pdf)
      - [Steps:](#steps-1)
  - [Deploying the app](#deploying-the-app)
  - [Development server](#development-server)
  - [Contributing](#contributing)
  - [Resources](#resources)

## Acknowledgment

This project builds upon the [VoiceRAG Repository](https://github.com/Azure-Samples/aisearch-openai-rag-audio): an example of how to implement RAG support in applications that use voice as their user interface, powered by the GPT-4o realtime API for audio. The pattern is described in more detail in this [blog post](https://aka.ms/voicerag), and you can see this sample app in action in this [short video](https://youtu.be/vXJka8xZ9Ko). For the Voice RAG README, see [voice_rag_README.md](voice_rag_README.md)."

## Visual Demonstrations

![app screenshot](docs/Demo/DesktopViewPreloadedData.png)

### Desktop 4 Minute Interaction Big Order Demo  

This video showcases a 4-minute interaction where a user places a large order using the Coffee Chat Voice Assistant.  

![Desktop 4 Minute Interaction Big Order Demo](docs/Demo/Desktop4MinuteInteractionBigOrder_preview.gif)

[Watch the full video with audio](https://raw.githubusercontent.com/john-carroll-sw/coffee-chat-voice-assistant/main/docs/Demo/Desktop4MinuteInteractionBigOrder_smaller.mp4)  

---  

### Mobile Multilingual Ordering Demo  

This video demonstrates the multilingual ordering capabilities of the Coffee Chat Voice Assistant.  

![Mobile Multilingual Ordering Demo](docs/Demo/MultilingualOrdering_preview.gif)

[Watch the full video with audio](https://raw.githubusercontent.com/john-carroll-sw/coffee-chat-voice-assistant/main/docs/Demo/MultilingualOrdering_smaller.mp4)  

---  

### UI Elements Walkthrough  

This video provides a walkthrough of the various UI elements in the Coffee Chat Voice Assistant.  

![UI Elements Walkthrough](docs/Demo/UIElementsWalkThrough_preview.gif)

[Watch the full video with audio](https://raw.githubusercontent.com/john-carroll-sw/coffee-chat-voice-assistant/main/docs/Demo/UIElementsWalkThrough_smaller.mp4)


## Features

- **Voice Interface**: Speak naturally to the app, and it processes your voice input in real-time using a flexible backend that supports various voice-to-text and processing services.
- **Retrieval-Augmented Generation (RAG)**: Leverages knowledge bases to ground responses in relevant and contextual information, such as menu-based ordering.
- **Real-Time Transcription**: Captures spoken input and provides clear, on-screen text transcriptions for transparency and accessibility.
- **Live Order Updates**: Dynamically displays order changes during the conversation by integrating advanced function-calling capabilities.
- **Audio Output**: Converts generated responses into human-like speech, with the app playing audio output through the browser's audio capabilities for seamless hands-free interactions.

### Architecture Diagram

The `RTClient` in the frontend receives the audio input, sends that to the Python backend which uses an `RTMiddleTier` object to interface with the Azure OpenAI real-time API, and includes a tool for searching Azure AI Search.

![Diagram of real-time RAG pattern](docs/RTMTPattern.png)

This repository includes infrastructure as code and a `Dockerfile` to deploy the app to Azure Container Apps, but it can also be run locally as long as Azure AI Search and Azure OpenAI services are configured.

## Getting Started

You have a few options for getting started with this template. The quickest way to get started is [GitHub Codespaces](#github-codespaces), since it will setup all the tools for you, but you can also [set it up locally](#local-environment). You can also use a [VS Code dev container](#vs-code-dev-containers)

### GitHub Codespaces

You can run this repo virtually by using GitHub Codespaces, which will open a web-based VS Code in your browser:

[![Open in GitHub Codespaces](https://img.shields.io/static/v1?style=for-the-badge&label=GitHub+Codespaces&message=Open&color=brightgreen&logo=github)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&skip_quickstart=true&machine=basicLinux32gb&repo=860141324&devcontainer_path=.devcontainer%2Fdevcontainer.json&geo=WestUs2)

Once the codespace opens (this may take several minutes), open a new terminal and proceed to [deploy the app](#deploying-the-app).

### VS Code Dev Containers

You can run the project in your local VS Code Dev Container using the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers):

1. Start Docker Desktop (install it if not already installed)
2. Open the project:

    [![Open in Dev Containers](https://img.shields.io/static/v1?style=for-the-badge&label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/john-carroll-sw/coffee-chat-voice-assistant)
3. In the VS Code window that opens, once the project files show up (this may take several minutes), open a new terminal, and proceed to [deploying the app](#deploying-the-app).

### Local environment

1. Install the required tools:
   * [Azure Developer CLI](https://aka.ms/azure-dev/install)
   * [Node.js](https://nodejs.org/)
   * [Python >=3.11](https://www.python.org/downloads/)
      * **Important**: Python and the pip package manager must be in the path in Windows for the setup scripts to work.
      * **Important**: Ensure you can run `python --version` from console. On Ubuntu, you might need to run `sudo apt install python-is-python3` to link `python` to `python3`.
   * [Git](https://git-scm.com/downloads)
   * [Powershell](https://learn.microsoft.com/powershell/scripting/install/installing-powershell) - For Windows users only.

2. Clone the repo (`git clone https://github.com/john-carroll-sw/coffee-chat-voice-assistant`)
3. Proceed to the next section to [deploy the app](#deploying-the-app).

## Ingesting Menu Items into Azure AI Search

### From JSON

If you have a JSON file containing the menu items for your café, you can use the provided Jupyter notebook to ingest the data into Azure AI Search.

#### Steps:

1. Open the `menu_ingestion_search_json.ipynb` notebook.
2. Follow the instructions to configure Azure OpenAI and Azure AI Search services.
3. Prepare the JSON data for ingestion.
4. Upload the prepared data to Azure AI Search.

This notebook demonstrates how to configure Azure OpenAI and Azure AI Search services, prepare the JSON data for ingestion, and upload the data to Azure AI Search for hybrid semantic search capabilities.

[Link to JSON Ingestion Notebook](scripts/menu_ingestion_search_json.ipynb)

### From PDF

If you have a PDF file of a café's menu that you would like to use, you can use the provided Jupyter notebook to extract text from the PDF, parse it into structured JSON format, and ingest the data into Azure AI Search.

#### Steps:

1. Open the `menu_ingestion_search_pdf.ipynb` notebook.
2. Follow the instructions to extract text from the PDF using OCR.
3. Parse the extracted text using GPT-4o into structured JSON format.
4. Configure Azure OpenAI and Azure AI Search services.
5. Prepare the parsed data for ingestion.
6. Upload the prepared data to Azure AI Search.

This notebook demonstrates how to extract text from a menu PDF using OCR, parse the extracted text into structured JSON format, configure Azure OpenAI and Azure AI Search services, prepare the parsed data for ingestion, and upload the data to Azure AI Search for hybrid semantic search capabilities.

[Link to PDF Ingestion Notebook](scripts/menu_ingestion_search_pdf.ipynb)

## Deploying the app

The steps below will provision Azure resources and deploy the application code to Azure Container Apps.

1. Login to your Azure account:

    ```shell
    azd auth login
    ```

    For GitHub Codespaces users, if the previous command fails, try:

   ```shell
    azd auth login --use-device-code
    ```

1. Create a new azd environment:

    ```shell
    azd env new
    ```

    Enter a name that will be used for the resource group.
    This will create a new folder in the `.azure` folder, and set it as the active environment for any calls to `azd` going forward.

1. (Optional) This is the point where you can customize the deployment by setting azd environment variables, in order to [use existing services](docs/existing_services.md) or [customize the voice choice](docs/customizing_deploy.md).

1. Run this single command to provision the resources, deploy the code, and setup integrated vectorization for the sample data:

   ```shell
   azd up
   ````

   * **Important**: Beware that the resources created by this command will incur immediate costs, primarily from the AI Search resource. These resources may accrue costs even if you interrupt the command before it is fully executed. You can run `azd down` or delete the resources manually to avoid unnecessary spending.
   * You will be prompted to select two locations, one for the majority of resources and one for the OpenAI resource, which is currently a short list. That location list is based on the [OpenAI model availability table](https://learn.microsoft.com/azure/ai-services/openai/concepts/models#global-standard-model-availability) and may become outdated as availability changes.

1. After the application has been successfully deployed you will see a URL printed to the console.  Navigate to that URL to interact with the app in your browser. To try out the app, click the "Start conversation button", say "Hello", and then ask a question about your data like "Could I get a small latte?" You can also now run the app locally by following the instructions in [the next section](#development-server).

## Development server

You can run this app locally using either the Azure services you provisioned by following the [deployment instructions](#deploying-the-app), or by pointing the local app at already [existing services](docs/existing_services.md).

1. If you deployed with `azd up`, you should see a `app/backend/.env` file with the necessary environment variables.

2. If did *not* use `azd up`, you will need to create `app/backend/.env` file with the necessary environment variables. You can use the provided sample file as a template:

   ```shell
   cp app/backend/.env-sample.ini app/backend/.env
   ```

   Then, fill in the required values in the `app/backend/.env` file. You can find the sample file [here](app/backend/.env-sample.ini).

3. Run this command to start the app:

   Windows:

   ```pwsh
   pwsh .\scripts\start.ps1
   ```

   Linux/Mac:

   ```bash
   ./scripts/start.sh
   ```

4. The app is available on [http://localhost:8765](http://localhost:8765).

   Once the app is running, when you navigate to the URL above you should see the start screen of the app shown in the [Visual Demonstrations](#visual-demonstrations) section.

   To try out the app, click the "Start conversation button", say "Hello", and then ask a question about your data like "Could I get a small latte?"

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Resources

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure AI Services Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/)
- [Azure AI Search Documentation](https://learn.microsoft.com/en-us/azure/search/)
- [Azure AI Services Tutorials](https://learn.microsoft.com/en-us/training/paths/azure-ai-fundamentals/)
- [Azure AI Community Support](https://techcommunity.microsoft.com/t5/azure-ai/ct-p/AzureAI)
- [Azure AI GitHub Samples](https://github.com/Azure-Samples)
- [Azure AI Services API Reference](https://learn.microsoft.com/en-us/rest/api/cognitiveservices/)
- [Azure AI Services Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/)
- [Azure Developer CLI Documentation](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/)
- [Azure Developer CLI GitHub Repository](https://github.com/Azure/azure-dev)
