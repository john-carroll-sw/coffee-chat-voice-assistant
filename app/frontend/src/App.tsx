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

import useRealTime from "@/hooks/useRealtime";
import useAzureSpeech from "@/hooks/useAzureSpeech";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import useAudioPlayer from "@/hooks/useAudioPlayer";

import { ExtensionMiddleTierToolResponse } from "./types";

import { ThemeProvider, useTheme } from "./context/theme-context";
import { DummyDataProvider, useDummyDataContext } from "@/context/dummy-data-context";
import { AzureSpeechProvider, useAzureSpeechOnContext } from "@/context/azure-speech-context";

function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { useAzureSpeechOn } = useAzureSpeechOnContext();
    const { useDummyData } = useDummyDataContext();
    const { theme } = useTheme();

    const [transcripts, setTranscripts] = useState<Array<{ text: string; isUser: boolean; timestamp: Date }>>(() => {
        return [];
    });
    const [dummyTranscripts] = useState<Array<{ text: string; isUser: boolean; timestamp: Date }>>(() => {
        const now = new Date();
        return [
            { text: "Hello", isUser: true, timestamp: new Date(now.getTime() - 600000) },
            {
                text: "Hi there! How can I assist you today? Are you looking to order a coffee or perhaps something else from our menu?",
                isUser: false,
                timestamp: new Date(now.getTime() - 590000)
            },
            {
                text: "물론입니다. 저는 몇몇 친구들과 함께 있으며, 당신의 메뉴가 무엇인지 보고 싶습니다.",
                isUser: true,
                timestamp: new Date(now.getTime() - 580000)
            },
            {
                text: "좋습니다! 메뉴를 가져올게요. 우리는 커피, 차 및 스페셜 음료를 포함해 다양한 음료를 제공합니다. 관심 있는 특정 음료가 있으면 말씀해 주시면 더 자세한 정보를 드리겠습니다!",
                isUser: false,
                timestamp: new Date(now.getTime() - 570000)
            },
            { text: "에스프레소 5샷은 어떤가요?", isUser: true, timestamp: new Date(now.getTime() - 560000) },
            {
                text: "주문에 에스프레소 5샷을 추가했습니다. 그 외에 다른 것도 필요하신가요? 친구들을 위한 추가 아이템이나 맛추가를 원하시나요?",
                isUser: false,
                timestamp: new Date(now.getTime() - 550000)
            },
            { text: "I'd like to order a cappuccino please", isUser: true, timestamp: new Date(now.getTime() - 540000) },
            { text: "Would you like that in regular or large size?", isUser: false, timestamp: new Date(now.getTime() - 530000) },
            { text: "Large please", isUser: true, timestamp: new Date(now.getTime() - 520000) },
            { text: "Great! Would you like any extras with that?", isUser: false, timestamp: new Date(now.getTime() - 510000) },
            { text: "No, but I am thinking of adding another drink", isUser: true, timestamp: new Date(now.getTime() - 500000) },
            { text: "Of course! Anything else?", isUser: false, timestamp: new Date(now.getTime() - 490000) },
            { text: "土耳其咖啡是什麼？我在菜單上看到了，它是來自土耳其的嗎？你能多告訴我一些嗎？", isUser: true, timestamp: new Date(now.getTime() - 480000) },
            {
                text: "土耳其咖啡是一種傳統的飲品，用非常細膩的咖啡粉與糖和豆蔻一同煮三次，非常香濃，適合慢慢品嘗。",
                isUser: false,
                timestamp: new Date(now.getTime() - 470000)
            },
            { text: "哦，聽起來很酷。我可以點一份嗎？", isUser: true, timestamp: new Date(now.getTime() - 460000) },
            { text: "當然可以！它是以小壺形式提供的，非常適合多人分享。", isUser: false, timestamp: new Date(now.getTime() - 450000) },
            { text: "哦，太完美了！", isUser: true, timestamp: new Date(now.getTime() - 440000) },
            { text: "好的，我已經將一壺土耳其咖啡加入您的訂單。還需要別的嗎？", isUser: false, timestamp: new Date(now.getTime() - 430000) },
            { text: "¿Puedo también pedir dos lattes de vainilla con extra shots y crema batida?", isUser: true, timestamp: new Date(now.getTime() - 420000) },
            { text: "¿Qué tamaño le gustaría para los lattes de vainilla?", isUser: false, timestamp: new Date(now.getTime() - 410000) },
            { text: "Regular is fine", isUser: true, timestamp: new Date(now.getTime() - 400000) },
            { text: "I've added those to your order. Would you like anything else?", isUser: false, timestamp: new Date(now.getTime() - 390000) },
            { text: "メキシカンホットチョコレートをお願いします。", isUser: true, timestamp: new Date(now.getTime() - 380000) },
            { text: "わかりました。どのサイズになさいますか？", isUser: false, timestamp: new Date(now.getTime() - 370000) },
            { text: "小サイズでホイップクリーム付きにしてください。", isUser: true, timestamp: new Date(now.getTime() - 360000) },
            { text: "了解です。小サイズのメキシカンホットチョコレートとホイップクリームですね。", isUser: false, timestamp: new Date(now.getTime() - 350000) },
            { text: "Vad är de mest populära dryckerna på menyn?", isUser: true, timestamp: new Date(now.getTime() - 340000) },
            {
                text: "Den klassiska latten är mest populär. Vill du lägga till en till i din beställning?",
                isUser: false,
                timestamp: new Date(now.getTime() - 330000)
            },
            { text: "No that's all, thank you!", isUser: true, timestamp: new Date(now.getTime() - 320000) },
            { text: "Your total comes to $39.10. Would you like to complete your order?", isUser: false, timestamp: new Date(now.getTime() - 310000) },
            { text: "Yes please", isUser: true, timestamp: new Date(now.getTime() - 300000) },
            { text: "Great! Your order will be ready in about 10 minutes.", isUser: false, timestamp: new Date(now.getTime() - 290000) }
        ];
    });

    const initialOrder: OrderSummaryProps = {
        items: [],
        total: 0,
        tax: 0,
        finalTotal: 0
    };

    const dummyOrder: OrderSummaryProps = calculateOrderSummary([
        { item: "Espresso", size: "Single", quantity: 5, price: 1, display: "Single Espresso" },
        { item: "Cappuccino", size: "Large", quantity: 1, price: 5.5, display: "Large Cappuccino" },
        { item: "Vanilla Latte", size: "Regular", quantity: 2, price: 5.9, display: "Regular Vanilla Latte" },
        { item: "Mexican Hot Chocolate", size: "Small", quantity: 1, price: 5.9, display: "Small Mexican Hot Chocolate" },
        { item: "Turkish Coffee", size: "Pot", quantity: 1, price: 4.5, display: "Pot of Turkish Coffee" },
        { item: "Whipped Cream", size: "", quantity: 3, price: 0.5, display: "Whipped Cream" },
        { item: "Extra Shot", size: "", quantity: 2, price: 1.0, display: "Extra Shot" }
    ]);

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
