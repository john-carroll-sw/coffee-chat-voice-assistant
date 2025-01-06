# Azure Speech with GPT-4o Mini Assistant

import os
from dotenv import load_dotenv
import azure.cognitiveservices.speech as speechsdk
import openai

# Load environment variables from .env file
load_dotenv()

# Azure Speech Service configuration
speech_key = os.getenv("AZURE_SPEECH_KEY")
speech_region = os.getenv("AZURE_SPEECH_REGION")
speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)

# Azure OpenAI Service configuration
openai.api_type = "azure"
openai.api_base = os.getenv("AZURE_OPENAI_EASTUS_ENDPOINT")
openai.api_version = os.getenv("AZURE_OPENAI_API_VERSION")
openai.api_key = os.getenv("AZURE_OPENAI_EASTUS_API_KEY")

# Specify GPT-4o Mini Deployment Name
gpt4o_mini_deployment = os.getenv("AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT")

# Speech-to-Text (STT) Function
def speech_to_text():
    audio_config = speechsdk.AudioConfig(use_default_microphone=True)
    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    print("Listening...")
    result = recognizer.recognize_once()
    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        print(f"Recognized: {result.text}")
        return result.text
    else:
        print("Speech not recognized.")
        return None

# Process Text with GPT-4o Mini
def process_with_gpt4o_mini(prompt):
    response = openai.Completion.create(
        engine=gpt4o_mini_deployment,
        prompt=prompt,
        max_tokens=150
    )
    generated_text = response.choices[0].text.strip()
    print(f"GPT-4o Mini Response: {generated_text}")
    return generated_text

# Text-to-Speech (TTS) Function
def text_to_speech(text):
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)
    result = synthesizer.speak_text_async(text).get()
    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print("Speech synthesized successfully.")
    else:
        print("Speech synthesis failed.")

# Main Function to Orchestrate the Workflow
def main():
    user_input = speech_to_text()
    if user_input:
        response = process_with_gpt4o_mini(user_input)
        text_to_speech(response)

if __name__ == "__main__":
    main()
