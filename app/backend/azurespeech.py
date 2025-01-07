import logging
import os
import base64
from aiohttp import web
from dotenv import load_dotenv
import azure.cognitiveservices.speech as speechsdk
from openai import AzureOpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("azurespeech")

# Load environment variables from .env file
load_dotenv()

# AOAI Variables
aoai_eastus_endpoint = os.getenv("AZURE_OPENAI_EASTUS_ENDPOINT")
aoai_eastus_api_key = os.getenv("AZURE_OPENAI_EASTUS_API_KEY")
aoai_gpt4o_mini_deployment = os.getenv("AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT")
aoai_openai_api_version = os.getenv("AZURE_OPENAI_API_VERSION")

# Initialize the Azure OpenAI client
aoai_client = AzureOpenAI(
    azure_endpoint=aoai_eastus_endpoint,
    api_version=aoai_openai_api_version,
    api_key=aoai_eastus_api_key,
)

# Set up Azure Speech-to-Text and Text-to-Speech credentials
speech_key = os.getenv("AZURE_SPEECH_KEY")
speech_region = os.getenv("AZURE_SPEECH_REGION")
speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
speech_config.speech_synthesis_voice_name = "en-US-AvaMultilingualNeural"
speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)

class AzureSpeech:
    def __init__(self, system_message):
        self.system_message = system_message

    def process_with_gpt4o_mini(self, prompt):
        try:
            response = aoai_client.chat.completions.create(
                model=aoai_gpt4o_mini_deployment,
                messages=[
                    {"role": "system", "content": self.system_message},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logging.error(f"Error generating text: {e}")
            return "Sorry, I couldn't generate a response."

    async def speech_to_text(self, request):
        try:
            data = await request.json()
            base64_audio = data.get("audio", "")
            audio_bytes = base64.b64decode(base64_audio)
            audio_config = speechsdk.audio.AudioConfig(stream=speechsdk.audio.PushAudioInputStream(audio_bytes))
            recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
            
            print("Listening...")
            result = recognizer.recognize_once_async().get()
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                recognized_text = result.text
                processed_text = self.process_with_gpt4o_mini(recognized_text)
                return web.json_response({"recognized_text": recognized_text, "processed_text": processed_text})
            elif result.reason == speechsdk.ResultReason.NoMatch:
                return web.json_response({"error": "No speech could be recognized"})
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation_details = result.cancellation_details
                return web.json_response({"error": f"Speech Recognition canceled: {cancellation_details.reason}"})
        except Exception as e:
            return web.json_response({"error": str(e)})

    async def text_to_speech(self, request):
        try:
            data = await request.json()
            text = data.get("text", "")
            result = speech_synthesizer.speak_text_async(text).get()
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                return web.json_response({"message": "Speech synthesized successfully"})
            else:
                return web.json_response({"error": "Speech synthesis failed"})
        except Exception as e:
            return web.json_response({"error": str(e)})

    def attach_to_app(self, app, path_prefix="/azurespeech"):
        app.router.add_post(f"{path_prefix}/speech-to-text", self.speech_to_text)
        app.router.add_post(f"{path_prefix}/text-to-speech", self.text_to_speech)