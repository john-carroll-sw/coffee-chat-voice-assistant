# Coffee Chat Voice Assistant

Coffee Chat Voice Assistant is an advanced, voice-driven ordering system leveraging Azure OpenAI GPT-4o Realtime API and Azure AI Speech to recreate the authentic experience of ordering coffee from a friendly café barista. This system provides natural conversations to deliver engaging and intuitive responses, ensuring a seamless and enjoyable user experience. With real-time transcription, every spoken word is captured and displayed, ensuring clarity and accessibility.&#x20;

As users place their orders, live updates are dynamically reflected on the screen, allowing them to see their selections build in real time. By simulating a true-to-life customer interaction, Coffee Chat Voice Assistant highlights the transformative potential of AI to enhance convenience and personalize the customer experience, creating a uniquely interactive and intuitive journey, adaptable for various industries and scenarios.

Beyond coffee enthusiasts, this technology can enhance accessibility and inclusivity, providing a hands-free, voice-driven experience for retail, hospitality, transportation, and more. Whether ordering on-the-go in a car, placing a contactless order from home, or supporting users with mobility challenges, this assistant demonstrates the limitless potential of AI-driven solutions for seamless user interactions.



\*\*Acknowledgment\*\*&#x20;

This project builds upon the [VoiceRAG Repository](https://github.com/Azure-Samples/aisearch-openai-rag-audio): an example of how to implement RAG support in applications that use voice as their user interface, powered by the GPT-4o realtime API for audio. The pattern is described in more detail in this [blog post](https://aka.ms/voicerag), and you can see this sample app in action in this [short video](https://youtu.be/vXJka8xZ9Ko).



## Features

- **Voice Interface**: Speak naturally to the app, and it processes your voice input in real-time using a flexible backend that supports various voice-to-text and processing services.
- **Retrieval-Augmented Generation (RAG)**: Leverages knowledge bases to ground responses in relevant and contextual information, such as menu-based ordering.
- **Real-Time Transcription**: Captures spoken input and provides clear, on-screen text transcriptions for transparency and accessibility.
- **Live Order Updates**: Dynamically displays order changes during the conversation by integrating advanced function-calling capabilities.
- **Audio Output**: Converts generated responses into human-like speech, with the app playing audio output through the browser's audio capabilities for seamless hands-free interactions.

## Architecture Diagram

The Coffee Chat Voice Assistant integrates multiple Azure services to deliver a seamless experience. The system includes two distinct backend options, which can be switched dynamically in the user interface to suit different use cases and compare user experiences. Both options share a common **Frontend (RTClient)** but utilize different backend paths for processing.

### Integration Layer

[Insert diagram for Integration Layer here]

1. **Frontend (RTClient)**: Captures audio input and sends it to the integration layer for processing. The UI includes a switch allowing users to dynamically select between two backends for processing: the Realtime Middleware or the Azure Speech-Based Backend.
2. **Backends in the Integration Layer**:
   - **Realtime Middleware (WebSocket-Based)**: This backend leverages:
     - **GPT-4o Realtime API**: Handles natural language understanding and real-time response generation via web sockets.
     - **Azure AI Search**: Provides retrieval-augmented generation (RAG) by grounding responses in external knowledge bases.
   - **Azure Speech-Based Backend**: This backend operates as follows:
     - **Azure Speech-to-Text**: Converts spoken audio into text for further processing.
     - **Azure OpenAI GPT-4o Mini**: Processes natural language understanding and generates conversational responses.
     - **Azure Neural Text-to-Speech**: Converts generated text responses into human-like audio for playback.
     - **Azure AI Search**: Provides retrieval-augmented generation (RAG), ensuring contextually relevant responses.
3. **Azure Services**:
   - **Azure OpenAI**:
     - **GPT-4o Realtime API**: Provides real-time natural language understanding and conversational response generation using web sockets, enabling dynamic, low-latency interactions.
     - **GPT-4o Mini**: Processes natural language understanding and generates conversational responses for workflows requiring sequential processing.
   - **Azure AI Search**:
     - Powers retrieval-augmented generation (RAG) by providing grounded responses from external knowledge bases. It is leveraged by both backends.
   - **Azure Speech Services**:
     - **Speech-to-Text**: Converts spoken audio into text, forming the basis of transcription in the Azure Speech-Based Backend.
     - **Neural Text-to-Speech (Neural Voice)**: Synthesizes human-like speech from text responses, creating engaging and accessible audio playback experiences.



## Getting Started

### Requirements

- Azure account with OpenAI and Speech resources configured.
- Docker (for local development).
- Node.js and Python >=3.11.
- Git.

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/john-carroll-sw/coffee-chat-voice-assistant.git
   ```

2. Navigate to the project directory:

   ```bash
   cd coffee-chat-voice-assistant
   ```

3. Install dependencies:

   ```bash
   npm install
   python -m pip install -r requirements.txt
   ```

4. Configure environment variables in `.env`:

   ```env
   AZURE_OPENAI_ENDPOINT=wss://<your-instance>.openai.azure.com
   AZURE_OPENAI_API_KEY=<your-api-key>
   AZURE_SPEECH_KEY=<your-speech-key>
   AZURE_SPEECH_REGION=<your-region>
   ```

5. Start the application:

   ```bash
   npm start
   ```

6. Access the app at [http://localhost:3000](http://localhost:3000).

## Deploying to Azure

1. Authenticate to Azure:

   ```bash
   az login
   ```

2. Deploy the app:

   ```bash
   azd up
   ```

3. Retrieve the application URL from the deployment logs and access it in your browser.

## Contributing

Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md).

## Resources

- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure Speech Service](https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/)
- [VoiceRAG Repository](https://github.com/Azure-Samples/aisearch-openai-rag-audio): This repo contains an example of how to implement RAG support in applications that use voice as their user interface, powered by the GPT-4o realtime API for audio. We describe the pattern in more detail in this [blog post](https://aka.ms/voicerag), and you can see this sample app in action in this [short video](https://youtu.be/vXJka8xZ9Ko).
- [Demo Video](https://youtu.be/your-demo-video)

