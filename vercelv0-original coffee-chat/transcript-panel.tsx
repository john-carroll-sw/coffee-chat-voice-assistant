interface TranscriptPanelProps {
  transcripts: Array<{ text: string; isUser: boolean }>
}

export function TranscriptPanel({ transcripts }: TranscriptPanelProps) {
  return (
    <div>
      <h2 className="font-semibold mb-4">Transcript History</h2>
      <div className="space-y-4">
        {transcripts.map((transcript, index) => (
          <div
            key={index}
            className={`rounded-lg p-3 ${
              transcript.isUser 
                ? "bg-blue-100 ml-auto max-w-[85%]" 
                : "bg-gray-100 max-w-[85%]"
            }`}
          >
            <p className="text-sm">{transcript.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

