import axios from "axios";

interface Parameters {
    onReceivedToolResponse?: (response: any) => void;
    onSpeechToTextTranscriptionCompleted?: (message: any) => void;
    onModelResponseDone?: (message: any) => void;
    onError?: (error: any) => void;
}

const useAzureSpeech = ({ onSpeechToTextTranscriptionCompleted, onModelResponseDone, onError }: Parameters) => {
    const startSession = () => {
        // Implement any session start logic if needed
    };

    const addUserAudio = async (base64Audio: string) => {
        try {
            const response = await axios.post(
                "/azurespeech/speech-to-text",
                { audio: base64Audio },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = response.data as { recognized_text: string; processed_text: string };
            const recognizedText = data.recognized_text;
            const processedText = data.processed_text;

            onSpeechToTextTranscriptionCompleted?.({ transcript: recognizedText });
            onModelResponseDone?.({ response: { output: [{ content: [{ transcript: processedText }] }] } });
        } catch (error) {
            onError?.(error);
        }
    };

    const inputAudioBufferClear = () => {
        // Implement any logic to clear the audio buffer if needed
    };

    return {
        startSession,
        addUserAudio,
        inputAudioBufferClear
    };
};

export default useAzureSpeech;
