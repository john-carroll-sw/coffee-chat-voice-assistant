import os
from dotenv import load_dotenv
import azure.cognitiveservices.speech as speechsdk
import openai

# Load environment variables from .env file
load_dotenv()

# Set up Azure OpenAI API credentials
openai.api_type = "azure"
openai.api_base = os.getenv("AZURE_OPENAI_EASTUS_ENDPOINT")
openai.api_version = "2023-03-15-preview"
openai.api_key = os.getenv("AZURE_OPENAI_EASTUS_API_KEY")
gpt4o_mini_deployment = os.getenv("AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT")

# Set up Azure Speech-to-Text and Text-to-Speech credentials
speech_key = os.getenv("AZURE_SPEECH_KEY")
speech_region = os.getenv("AZURE_SPEECH_REGION")
speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
speech_config.speech_synthesis_language = "en-NZ"

# Set up the voice configuration
speech_config.speech_synthesis_voice_name = "en-NZ-MollyNeural"
speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)

# Define the speech-to-text function
def speech_to_text():
    # Set up the audio configuration
    audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)

    # Create a speech recognizer and start the recognition
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    print("Say something...")

    result = speech_recognizer.recognize_once_async().get()

    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        return result.text
    elif result.reason == speechsdk.ResultReason.NoMatch:
        return "Sorry, I didn't catch that."
    elif result.reason == speechsdk.ResultReason.Canceled:
        return "Recognition canceled."
    
# Define the Azure OpenAI language generation function
def generate_text(prompt):
    response = openai.ChatCompletion.create(
        engine="chenjd-test",
        messages=[
            {"role": "system", "content": "You are an AI assistant that helps people find information."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None
    )
    return response['choices'][0]['message']['content']

# Define the text-to-speech function
def text_to_speech(text):
    try:
        result = speech_synthesizer.speak_text_async(text).get()
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            print("Text-to-speech conversion successful.")
            return True
        else:
            print(f"Error synthesizing audio: {result}")
            return False
    except Exception as ex:
        print(f"Error synthesizing audio: {ex}")
        return False