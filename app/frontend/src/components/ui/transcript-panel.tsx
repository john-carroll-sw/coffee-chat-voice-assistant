import { useEffect, useRef, useState } from "react";

interface TranscriptPanelProps {
    transcripts: Array<{ text: string; isUser: boolean; timestamp: Date }>;
}

export default function TranscriptPanel({ transcripts }: TranscriptPanelProps) {
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Scroll to the bottom whenever the transcripts change
    useEffect(() => {
        if (transcriptEndRef.current) {
            transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [transcripts]);

    // Scroll to the bottom on window resize
    useEffect(() => {
        const handleResize = () => {
            if (transcriptEndRef.current) {
                transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTimestamp = (timestamp: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            hour: "numeric",
            minute: "numeric",
            hour12: true
        };
        return new Intl.DateTimeFormat(navigator.language, options).format(timestamp);
    };

    const shouldShowTimestamp = (current: Date, next?: Date) => {
        const nextTime = next ? next.getTime() : currentTime.getTime();
        const diff = (nextTime - current.getTime()) / 1000; // Difference in seconds

        return diff > 60; // Show timestamp if more than 60 seconds have passed
    };

    return (
        <div>
            <div className="space-y-4">
                {transcripts.map((transcript, index) => (
                    <div key={index}>
                        <div
                            className={`rounded-lg p-3 ${
                                transcript.isUser
                                    ? "ml-auto max-w-[85%] bg-purple-100 dark:bg-purple-900 dark:text-white"
                                    : "max-w-[85%] bg-gray-100 dark:bg-gray-800 dark:text-gray-100"
                            }`}
                        >
                            <p className="text-sm">{transcript.text}</p>
                        </div>
                        {shouldShowTimestamp(transcript.timestamp, transcripts[index + 1]?.timestamp) && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(transcript.timestamp)}</div>
                        )}
                    </div>
                ))}
                <div ref={transcriptEndRef} />
            </div>
        </div>
    );
}
