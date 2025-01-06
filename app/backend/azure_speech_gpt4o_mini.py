import os
from dotenv import load_dotenv
import azure.cognitiveservices.speech as speechsdk
from openai import AzureOpenAI

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
    try:
        response = aoai_client.chat.completions.create(
            model=aoai_gpt4o_mini_deployment,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            # max_tokens=1500,
            temperature=0.6,
        )

        parsed_output = response.choices[0].message.content
        return parsed_output
    except Exception as e:
        print(f"Error generating text: {e}")
        return "Sorry, I couldn't generate a response."

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
    
    
# Main function to orchestrate the workflow
def main():
    # Step 1: Perform speech-to-text
    user_input = speech_to_text()
    if not user_input or "Sorry" in user_input or "canceled" in user_input:
        print(f"Speech Recognition Result: {user_input}")
        return  # Exit if no valid input is detected

    print(f"User Input: {user_input}")

    # Step 2: Generate a response using Azure OpenAI
    response_text = generate_text(user_input)
    print(f"AI Response: {response_text}")

    # Step 3: Perform text-to-speech
    success = text_to_speech(response_text)
    if success:
        print("Response successfully read out.")
    else:
        print("Failed to synthesize speech.")

if __name__ == "__main__":
    main()
