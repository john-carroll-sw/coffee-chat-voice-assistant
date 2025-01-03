"use client"

import { useState, useEffect } from "react"
import { Mic, Menu, MessageSquare } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { TranscriptPanel } from "./transcript-panel"
import { MenuPanel } from "./menu-panel"
import { OrderSummary } from "./order-summary"
import { Settings } from "./settings"

export default function CoffeeChat() {
  const [isRecording, setIsRecording] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const [transcripts] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: "Hello! How can I help you today?", isUser: false },
    { text: "I'd like to order a cappuccino please", isUser: true },
    { text: "Would you like that in regular or large size?", isUser: false },
    { text: "Large please", isUser: true },
    { text: "Great! Would you like any extras with that?", isUser: false },
    { text: "Yes, can I add an extra shot of espresso?", isUser: true },
    { text: "Of course! Anything else?", isUser: false },
    { text: "Can I also get a vanilla latte?", isUser: true },
    { text: "What size would you like the vanilla latte?", isUser: false },
    { text: "Regular is fine", isUser: true },
    { text: "I've added those to your order. Would you like anything else?", isUser: false },
    { text: "No that's all, thank you!", isUser: true },
    { text: "Your total comes to $12.40. Would you like to complete your order?", isUser: false },
    { text: "Yes please", isUser: true },
    { text: "Great! Your order will be ready in about 10 minutes.", isUser: false },
  ])

  const [order] = useState([
    { item: "Large Cappuccino", price: 5.50 },
    { item: "Extra Shot", price: 1.00 },
    { item: "Regular Vanilla Latte", price: 5.90 },
  ])

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  return (
    <div className={`min-h-screen bg-background text-foreground p-4 md:p-8 ${isDarkMode ? 'dark' : ''}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center mb-6 md:mb-12 relative">
          <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl md:text-6xl font-bold text-transparent text-center">
            Coffee Chat
          </h1>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <Settings isMobile={isMobile} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full md:hidden mb-4 flex items-center justify-center">
                <Menu className="mr-2 h-4 w-4" />
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
          <Card className="p-6 h-[calc(100vh-12rem)] overflow-auto hidden md:block">
            <h2 className="font-semibold mb-4">Menu</h2>
            <MenuPanel />
          </Card>

          {/* Center Panel - Recording Button and Order Summary */}
          <Card className="p-6 md:h-[calc(100vh-12rem)] md:overflow-auto">
            <div className="space-y-8">
              <OrderSummary order={order} />

              <div className="text-center">
                <p className="mb-6">Let's order some coffee!</p>
                <Button
                  size="lg"
                  className={`h-16 w-16 rounded-full ${
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-purple-500 hover:bg-purple-600"
                  }`}
                  onClick={toggleRecording}
                >
                  <Mic className={`h-8 w-8 ${isRecording ? "animate-pulse" : ""}`} />
                  <span className="sr-only">{isRecording ? "Stop Recording" : "Start Recording"}</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Mobile Transcript Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full md:hidden mt-4 flex items-center justify-center">
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
          </Sheet>

          {/* Desktop Transcript Panel */}
          <Card className="p-6 h-[calc(100vh-12rem)] overflow-auto hidden md:block">
            <TranscriptPanel transcripts={transcripts} />
          </Card>
        </div>
      </div>
    </div>
  )
}

