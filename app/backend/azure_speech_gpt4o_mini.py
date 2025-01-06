import os
from dotenv import load_dotenv
import azure.cognitiveservices.speech as speechsdk
from openai import AzureOpenAI
import logging
import threading

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

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
# speech_config.speech_synthesis_language = "en-NZ"
speech_config.speech_synthesis_voice_name = "en-US-AvaMultilingualNeural"
# "en-US-AlloyMultilingualNeural"
# "en-US-Andrew:DragonHDLatestNeural" 
# "en-NZ-MollyNeural"

speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)

# Global flags
exit_program = False

# Define the speech-to-text function with continuous listening
def continuous_speech_to_text():
    audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    def recognized_handler(evt):
        recognized_text = evt.result.text.strip().lower()
        logging.info(f"Recognized: {recognized_text}")
        if recognized_text in ["q", "quit"]:
            logging.info("User chose to quit. Exiting...")
            global exit_program
            exit_program = True
        else:
            threading.Thread(target=process_speech_to_text_result, args=(recognized_text, speech_recognizer)).start()

    def canceled_handler(evt):
        logging.error(f"Recognition canceled: {evt.result.reason}")
        if evt.result.reason == speechsdk.CancellationReason.Error:
            logging.error(f"Error details: {evt.result.error_details}")

    # Assign event handlers
    speech_recognizer.recognized.connect(recognized_handler)
    speech_recognizer.canceled.connect(canceled_handler)

    logging.info("Listening continuously... (say 'quit' or 'q' to exit)")
    speech_recognizer.start_continuous_recognition()

    try:
        while not exit_program:
            pass  # Keep the program running while listening
    except KeyboardInterrupt:
        logging.info("Program interrupted by user.")
    finally:
        speech_recognizer.stop_continuous_recognition()

# Process recognized speech and generate AI response
def process_speech_to_text_result(user_input, speech_recognizer):
    # Stop the recognizer while responding
    logging.info("Pausing recognizer for AI response...")
    speech_recognizer.stop_continuous_recognition()

    logging.info(f"User Input: {user_input}")
    response_text = generate_text(user_input)
    logging.info(f"AI Response: {response_text}")
    text_to_speech(response_text)

    # Resume the recognizer after responding
    logging.info("Resuming recognizer...")
    speech_recognizer.start_continuous_recognition()

# Define the Azure OpenAI language generation function
def generate_text(prompt):
    try:
        response = aoai_client.chat.completions.create(
            model=aoai_gpt4o_mini_deployment,
            messages=[
                {"role": "system", "content": "You are a friendly barista helping customers place coffee orders."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"Error generating text: {e}")
        return "Sorry, I couldn't generate a response."

# Define the text-to-speech function
def text_to_speech(text):
    try:
        logging.info("Speaking response...")
        result = speech_synthesizer.speak_text_async(text).get()
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            logging.info("Text-to-speech conversion successful.")
        else:
            logging.error(f"Error synthesizing audio: {result}")
    except Exception as e:
        logging.error(f"Error synthesizing audio: {e}")

# Main function to run continuous listening
if __name__ == "__main__":
    continuous_speech_to_text()
    logging.info("Program terminated. Goodbye!")
