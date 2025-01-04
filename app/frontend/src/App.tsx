import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// import GroundingFileView from "@/components/ui/grounding-file-view";
import StatusMessage from "@/components/ui/status-message";
// import HistoryPanel from "@/components/ui/history-panel";
import MenuPanel from "@/components/ui/menu-panel";
import OrderSummary from "@/components/ui/order-summary";
import Settings from "@/components/ui/settings";

import useRealTime from "@/hooks/useRealtime";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import useAudioPlayer from "@/hooks/useAudioPlayer";

import { HistoryItem, ToolResult } from "./types";

import { ThemeProvider, useTheme } from "./context/theme-context";

function App() {
    const [isRecording, setIsRecording] = useState(false);
    // const [selectedFile, setSelectedFile] = useState<GroundingFile | null>(null);
    // const [groundingFiles, setGroundingFiles] = useState<GroundingFile[]>([]);
    // const [showTranscript, setShowTranscript] = useState(false);
    // const [history, setHistory] = useState<HistoryItem[]>([]);
    const { theme } = useTheme();
    const [isMobile, setIsMobile] = useState(false);

    const { startSession, addUserAudio, inputAudioBufferClear } = useRealTime({
        enableInputAudioTranscription: true, // Enable input audio transcription from the user to show in the history
        onWebSocketOpen: () => console.log("WebSocket connection opened"),
        onWebSocketClose: () => console.log("WebSocket connection closed"),
        onWebSocketError: event => console.error("WebSocket error:", event),
        onReceivedError: message => console.error("error", message),
        onReceivedResponseAudioDelta: message => {
            isRecording && playAudio(message.delta);
        },
        onReceivedInputAudioBufferSpeechStarted: () => {
            stopAudioPlayer();
        },
        onReceivedExtensionMiddleTierToolResponse: message => {
            const result: ToolResult = JSON.parse(message.tool_result);
            // const files: GroundingFile[] = result.sources.map(x => {
            //     return { id: x.chunk_id, name: x.title, content: x.chunk };
            // });

            // setGroundingFiles(files); // Store the grounding files for the assistant
            console.log("Tool result received:", result);
        },
        onReceivedInputAudioTranscriptionCompleted: message => {
            // Update history with input audio transcription when completed
            const newHistoryItem: HistoryItem = {
                id: message.event_id,
                transcript: message.transcript,
                // groundingFiles: [],
                sender: "user",
                timestamp: new Date() // Add timestamp
            };
            // setHistory(prev => [...prev, newHistoryItem]);

            console.log(newHistoryItem);
        },
        onReceivedResponseDone: message => {
            const transcript = message.response.output.map(output => output.content?.map(content => content.transcript).join(" ")).join(" ");
            if (!transcript) {
                return;
            }

            // Update history with response done
            const newHistoryItem: HistoryItem = {
                id: message.event_id,
                transcript: transcript,
                // groundingFiles: groundingFiles,
                sender: "assistant",
                timestamp: new Date() // Add timestamp
            };
            // setHistory(prev => [...prev, newHistoryItem]);
            // setGroundingFiles([]); // Clear the assistant grounding files after use

            console.log(newHistoryItem);
        }
    });

    const { reset: resetAudioPlayer, play: playAudio, stop: stopAudioPlayer } = useAudioPlayer();
    const { start: startAudioRecording, stop: stopAudioRecording } = useAudioRecorder({ onAudioRecorded: addUserAudio });

    const onToggleListening = async () => {
        if (!isRecording) {
            startSession();
            await startAudioRecording();
            resetAudioPlayer();

            setIsRecording(true);
        } else {
            await stopAudioRecording();
            stopAudioPlayer();
            inputAudioBufferClear();

            setIsRecording(false);
        }
    };

    const { t } = useTranslation();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // const [transcripts] = useState<Array<{ text: string; isUser: boolean }>>([
    //     { text: "Hello! How can I help you today?", isUser: false },
    //     { text: "I'd like to order a cappuccino please", isUser: true },
    //     { text: "Would you like that in regular or large size?", isUser: false },
    //     { text: "Large please", isUser: true },
    //     { text: "Great! Would you like any extras with that?", isUser: false },
    //     { text: "Yes, can I add an extra shot of espresso?", isUser: true },
    //     { text: "Of course! Anything else?", isUser: false },
    //     { text: "Can I also get a vanilla latte?", isUser: true },
    //     { text: "What size would you like the vanilla latte?", isUser: false },
    //     { text: "Regular is fine", isUser: true },
    //     { text: "I've added those to your order. Would you like anything else?", isUser: false },
    //     { text: "No that's all, thank you!", isUser: true },
    //     { text: "Your total comes to $12.40. Would you like to complete your order?", isUser: false },
    //     { text: "Yes please", isUser: true },
    //     { text: "Great! Your order will be ready in about 10 minutes.", isUser: false }
    // ]);

    const [order] = useState([
        { item: "Large Cappuccino", price: 5.5 },
        { item: "Extra Shot", price: 1.0 },
        { item: "Regular Vanilla Latte", price: 5.9 }
    ]);

    return (
        <div className={`min-h-screen bg-background p-4 text-foreground md:p-8 ${theme}`}>
            <div className="mx-auto max-w-7xl">
                <div className="relative mb-6 flex flex-col items-center md:mb-12">
                    <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-center text-4xl font-bold text-transparent md:text-6xl">
                        Coffee Chat
                    </h1>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 transform">
                        <Settings isMobile={isMobile} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
                    {/* Mobile Menu Button */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="mb-4 flex w-full items-center justify-center md:hidden">
                                {/* <Menu className="mr-2 h-4 w-4" /> */}
                                View Menu
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Our Menu</SheetTitle>
                            </SheetHeader>
                            <MenuPanel />
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Menu Panel */}
                    <Card className="hidden h-[calc(100vh-12rem)] overflow-auto p-6 md:block">
                        <h2 className="mb-4 font-semibold">Our Menu</h2>
                        <MenuPanel />
                    </Card>

                    {/* Center Panel - Recording Button and Order Summary */}
                    <Card className="p-6 md:h-[calc(100vh-12rem)] md:overflow-auto">
                        <div className="space-y-8">
                            <OrderSummary order={order} />
                            <div className="mb-4 flex flex-col items-center justify-center">
                                <Button
                                    onClick={onToggleListening}
                                    className={`h-12 w-60 ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-purple-500 hover:bg-purple-600"}`}
                                    aria-label={isRecording ? t("app.stopRecording") : t("app.startRecording")}
                                >
                                    {isRecording ? (
                                        <>
                                            <MicOff className="mr-2 h-4 w-4" />
                                            {t("app.stopConversation")}
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="mr-2 h-6 w-6" />
                                        </>
                                    )}
                                </Button>
                                <StatusMessage isRecording={isRecording} />
                            </div>
                        </div>
                    </Card>

                    {/* Mobile Transcript Button */}
                    {/* <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="mt-4 flex w-full items-center justify-center md:hidden">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                View Transcript
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Transcript History</SheetTitle>
                            </SheetHeader>
                            <TranscriptPanel transcripts={transcripts} />
                        </SheetContent>
                    </Sheet> */}

                    {/* Desktop Transcript Panel */}
                    <Card className="hidden h-[calc(100vh-12rem)] overflow-auto p-6 md:block">{/* <TranscriptPanel transcripts={transcripts} /> */}</Card>
                </div>
            </div>
        </div>
    );
}

export default function RootApp() {
    return (
        <ThemeProvider>
            <App />
        </ThemeProvider>
    );
}
