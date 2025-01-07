import os
import logging
from aiohttp import web
from azure.cognitiveservices.speech import SpeechConfig, SpeechRecognizer, SpeechSynthesizer, AudioConfig, SpeechConfig, ResultReason
from azure.cognitiveservices.speech.audio import AudioConfig
from openai import AzureOpenAI
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load environment variables
load_dotenv()

class AzureSpeech:
    def __init__(self, system_message):
        self.system_message = system_message
        
        # Azure OpenAI Variables
        self.aoai_eastus_endpoint = os.getenv("AZURE_OPENAI_EASTUS_ENDPOINT")
        self.aoai_eastus_api_key = os.getenv("AZURE_OPENAI_EASTUS_API_KEY")
        self.aoai_gpt4o_mini_deployment = os.getenv("AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT")
        self.aoai_openai_api_version = os.getenv("AZURE_OPENAI_API_VERSION")

        # Azure Speech Service Variables
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.speech_region = os.getenv("AZURE_SPEECH_REGION")
        self.speech_config = SpeechConfig(subscription=self.speech_key, region=self.speech_region)
        self.speech_config.speech_synthesis_voice_name = "en-US-AvaMultilingualNeural"

        # Azure OpenAI Client
        self.aoai_client = AzureOpenAI(
            azure_endpoint=self.aoai_eastus_endpoint,
            api_version=self.aoai_openai_api_version,
            api_key=self.aoai_eastus_api_key,
        )

    async def speech_to_text(self, request):
        """Convert audio to text using Azure Speech-to-Text."""
        try:
            logging.info("Received speech-to-text request.")
            reader = await request.multipart()
            audio_part = await reader.next()
            audio_file_path = "./uploaded_audio.wav"

            # Save uploaded audio
            with open(audio_file_path, "wb") as audio_file:
                while True:
                    chunk = await audio_part.read_chunk()
                    if not chunk:
                        break
                    audio_file.write(chunk)

            # Log file details
            if not os.path.exists(audio_file_path):
                logging.error("Uploaded audio file is missing.")
            else:
                file_size = os.path.getsize(audio_file_path)
                logging.info(f"Uploaded audio file size: {file_size} bytes")

            # Validate file size
            if file_size == 0:
                logging.error("Uploaded audio file is empty.")
                raise web.HTTPBadRequest(reason="Empty audio file.")


            # Verify file existence and size
            if not os.path.exists(audio_file_path) or os.path.getsize(audio_file_path) == 0:
                logging.error("Uploaded audio file is empty or missing.")
                raise web.HTTPBadRequest(reason="Invalid audio file.")

            # Speech-to-text conversion
            logging.info("Starting speech recognition.")
            audio_config = AudioConfig(filename=audio_file_path)
            speech_recognizer = SpeechRecognizer(speech_config=self.speech_config, audio_config=audio_config)
            result = speech_recognizer.recognize_once()

            if result.reason == ResultReason.RecognizedSpeech:
                logging.info(f"Speech recognized: {result.text}")
                return web.json_response({"transcription": result.text})
            elif result.reason == ResultReason.NoMatch:
                logging.warning("No speech could be recognized.")
                return web.json_response({"error": "No speech could be recognized."})
            else:
                logging.error(f"Speech recognition canceled: {result.cancellation_details.error_details}")
                raise web.HTTPInternalServerError(reason="Speech recognition canceled.")
        except Exception as e:
            logging.error(f"Speech-to-text processing failed: {e}")
            raise web.HTTPInternalServerError(reason="Internal server error.")


    async def generate_response(self, request):
        """Generate AI response using Azure OpenAI GPT."""
        try:
            data = await request.json()
            prompt = data.get("content", "")

            response = self.aoai_client.chat.completions.create(
                model=self.aoai_gpt4o_mini_deployment,
                messages=[
                    {"role": "system", "content": self.system_message},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.6,
            )
            return web.json_response({"response": response.choices[0].message.content})
        except Exception as e:
            logging.error(f"Error generating AI response: {e}")
            return web.json_response({"error": "Internal server error."}, status=500)

    async def text_to_speech(self, request):
        """Convert text to speech using Azure TTS."""
        try:
            data = await request.json()
            text = data.get("content", "")

            synthesizer = SpeechSynthesizer(speech_config=self.speech_config, audio_config=None)
            result = synthesizer.speak_text_async(text).get()

            audio_file_path = "./response_audio.wav"
            with open(audio_file_path, "wb") as audio_file:
                audio_file.write(result.audio_data)
            return web.json_response({"audio_url": "/static/response_audio.wav"})
        except Exception as e:
            logging.error(f"Text-to-speech failed: {e}")
            return web.json_response({"error": "Internal server error."}, status=500)

    def attach_to_app(self, app, path_prefix="/azurespeech"):
        """Attach routes to aiohttp app."""
        app.router.add_post(f"{path_prefix}/speech-to-text", self.speech_to_text)
        app.router.add_post(f"{path_prefix}/text-to-speech", self.text_to_speech)
        app.router.add_post(f"{path_prefix}/generate-response", self.generate_response)
