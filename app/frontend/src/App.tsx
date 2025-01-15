import { useState, useEffect } from "react";
import { Mic, MicOff, Menu, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import StatusMessage from "@/components/ui/status-message";
import MenuPanel from "@/components/ui/menu-panel";
import OrderSummary, { calculateOrderSummary, OrderSummaryProps } from "@/components/ui/order-summary";
import TranscriptPanel from "@/components/ui/transcript-panel";
import Settings from "@/components/ui/settings";
import ImageDialog from "@/components/ui/ImageDialog";

import useRealTime from "@/hooks/useRealtime";
import useAzureSpeech from "@/hooks/useAzureSpeech";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import useAudioPlayer from "@/hooks/useAudioPlayer";

import { ExtensionMiddleTierToolResponse } from "./types";

import { ThemeProvider, useTheme } from "./context/theme-context";
import { DummyDataProvider, useDummyDataContext } from "@/context/dummy-data-context";
import { AzureSpeechProvider, useAzureSpeechOnContext } from "@/context/azure-speech-context";

import dummyTranscriptsData from "@/data/dummyTranscripts.json";
import dummyOrderData from "@/data/dummyOrder.json";

function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { useAzureSpeechOn } = useAzureSpeechOnContext();
    const { useDummyData } = useDummyDataContext();
    const { theme } = useTheme();
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const handleShowImage = (url: string) => {
        setImageUrl(url);
        setImageDialogOpen(true);
    };

    // Example usage of handleShowImage when a user requests to see an image of a specific drink
    const onUserRequestShowImage = (drinkName: string) => {
        const drink = dummyOrderData.find(item => item.item === drinkName);
        if (drink) {
            const imageUrl = `/images/${drinkName.toLowerCase().replace(/\s+/g, "_")}_image.jpg`;
            handleShowImage(imageUrl);
        }
    };

    const [transcripts, setTranscripts] = useState<Array<{ text: string; isUser: boolean; timestamp: Date }>>(() => {
        return [];
    });
    const [dummyTranscripts] = useState<Array<{ text: string; isUser: boolean; timestamp: Date }>>(() => {
        return dummyTranscriptsData.map(transcript => ({
            ...transcript,
            timestamp: new Date(transcript.timestamp)
        }));
    });

    const initialOrder: OrderSummaryProps = {
        items: [],
        total: 0,
        tax: 0,
        finalTotal: 0
    };

    const dummyOrder: OrderSummaryProps = calculateOrderSummary(dummyOrderData);

    const [order, setOrder] = useState<OrderSummaryProps>(initialOrder);

    const realtime = useRealTime({
        enableInputAudioTranscription: true,
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
        onReceivedExtensionMiddleTierToolResponse: ({ tool_name, tool_result }: ExtensionMiddleTierToolResponse) => {
            if (tool_name === "update_order") {
                const orderSummary: OrderSummaryProps = JSON.parse(tool_result);
                setOrder(orderSummary);

                console.log("Order Total:", orderSummary.total);
                console.log("Tax:", orderSummary.tax);
                console.log("Final Total:", orderSummary.finalTotal);
            }
        },
        onReceivedInputAudioTranscriptionCompleted: message => {
            const newTranscriptItem = {
                text: message.transcript,
                isUser: true,
                timestamp: new Date()
            };
            setTranscripts(prev => [...prev, newTranscriptItem]);
        },
        onReceivedResponseDone: message => {
            const transcript = message.response.output.map(output => output.content?.map(content => content.transcript).join(" ")).join(" ");
            if (!transcript) return;

            const newTranscriptItem = {
                text: transcript,
                isUser: false,
                timestamp: new Date()
            };
            setTranscripts(prev => [...prev, newTranscriptItem]);
        }
    });

    const azureSpeech = useAzureSpeech({
        onReceivedToolResponse: ({ tool_name, tool_result }: ExtensionMiddleTierToolResponse) => {
            if (tool_name === "update_order") {
                const orderSummary: OrderSummaryProps = JSON.parse(tool_result);
                setOrder(orderSummary);

                console.log("Order Total:", orderSummary.total);
                console.log("Tax:", orderSummary.tax);
                console.log("Final Total:", orderSummary.finalTotal);
            }
        },
        onSpeechToTextTranscriptionCompleted: (message: { transcript: any }) => {
            const newTranscriptItem = {
                text: message.transcript,
                isUser: true,
                timestamp: new Date()
            };
            setTranscripts(prev => [...prev, newTranscriptItem]);
        },
        onModelResponseDone: (message: { response: { output: any[] } }) => {
            const transcript = message.response.output
                .map(output => output.content?.map((content: { transcript: any }) => content.transcript).join(" "))
                .join(" ");
            if (!transcript) return;

            const newTranscriptItem = {
                text: transcript,
                isUser: false,
                timestamp: new Date()
            };
            setTranscripts(prev => [...prev, newTranscriptItem]);
        },
        onError: (error: any) => console.error("Error:", error)
    });

    const { reset: resetAudioPlayer, play: playAudio, stop: stopAudioPlayer } = useAudioPlayer();
    const { start: startAudioRecording, stop: stopAudioRecording } = useAudioRecorder({
        onAudioRecorded: useAzureSpeechOn ? azureSpeech.addUserAudio : realtime.addUserAudio
    });

    const onToggleListening = async () => {
        if (!isRecording) {
            if (useAzureSpeechOn) {
                azureSpeech.startSession();
            } else {
                realtime.startSession();
            }
            await startAudioRecording();
            resetAudioPlayer();
            setIsRecording(true);
        } else {
            await stopAudioRecording();
            stopAudioPlayer();
            if (useAzureSpeechOn) {
                azureSpeech.inputAudioBufferClear();
            } else {
                realtime.inputAudioBufferClear();
            }
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

    return (
        <div className={`min-h-screen bg-background p-4 text-foreground md:p-8 ${theme}`}>
            <div className="mx-auto max-w-7xl">
                <div className="relative mb-6 flex flex-col items-center md:mb-4">
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
                                <Menu className="mr-2 h-4 w-4" />
                                View Menu
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Our Menu</SheetTitle>
                            </SheetHeader>
                            <div className="h-[calc(100vh-4rem)] overflow-auto pr-4">
                                <MenuPanel />
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Menu Panel */}
                    <Card className="hidden p-6 md:block">
                        <h2 className="mb-4 text-center font-semibold">Our Menu</h2>
                        <div className="h-[calc(100vh-18rem)] overflow-auto pr-4">
                            <MenuPanel />
                        </div>
                    </Card>

                    {/* Center Panel - Recording Button and Order Summary */}
                    <Card className="p-6 md:h-[calc(100vh-12rem)] md:overflow-auto">
                        <div className="space-y-8">
                            <OrderSummary order={useDummyData ? dummyOrder : order} />
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
                    <Sheet>
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
                            <div className="h-[calc(100vh-4rem)] overflow-auto pr-4">
                                <TranscriptPanel transcripts={useDummyData ? dummyTranscripts : transcripts} />
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Desktop Transcript Panel */}
                    <Card className="hidden p-6 md:block">
                        <h2 className="mb-4 text-center font-semibold">Transcript History</h2>
                        <div className="h-[calc(100vh-18rem)] overflow-auto pr-4">
                            <TranscriptPanel transcripts={useDummyData ? dummyTranscripts : transcripts} />
                        </div>
                    </Card>
                </div>
            </div>
            <Button onClick={() => onUserRequestShowImage("Espresso")}>Show Espresso Image</Button>
            {imageDialogOpen && <ImageDialog imageUrl={imageUrl} onClose={() => setImageDialogOpen(false)} />}
        </div>
    );
}

export default function RootApp() {
    return (
        <ThemeProvider>
            <DummyDataProvider>
                <AzureSpeechProvider>
                    <App />
                </AzureSpeechProvider>
            </DummyDataProvider>
        </ThemeProvider>
    );
}
