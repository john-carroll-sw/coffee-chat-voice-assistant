import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./button";
import { useTranslation } from "react-i18next";
import Draggable from "react-draggable";

// Types for documents
type MenuDocument = {
    id: string;
    name: string;
    url: string;
};

type Properties = {
    show: boolean;
    documents: MenuDocument[];
    onClosed: () => void;
};

export default function MenuPanel({ show, documents, onClosed }: Properties) {
    const { t } = useTranslation();
    const [selectedDocument, setSelectedDocument] = useState<MenuDocument | null>(documents[0] || null);
    const [panelWidth, setPanelWidth] = useState(window.innerWidth * 0.4); // default width is 70% of window width
    const menuEndRef = useRef<HTMLDivElement>(null);

    // Scroll to the bottom whenever the menu changes
    useEffect(() => {
        if (menuEndRef.current) {
            menuEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedDocument]);

    // Ensure the URL is correct by converting to an absolute path and log it
    const getDocumentUrl = (url: string) => {
        const absoluteUrl = url.startsWith("/") ? `${window.location.origin}${url}` : `${window.location.origin}/${url}`;
        console.log("Generated document URL:", absoluteUrl);
        return absoluteUrl;
    };

    const handleDrag = (_e: any, data: any) => {
        const newWidth = panelWidth + data.deltaX;
        if (newWidth > window.innerWidth * 0.3 && newWidth < window.innerWidth * 0.9) {
            setPanelWidth(newWidth);
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: "-100%" }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed inset-y-0 left-0 z-40 flex h-full flex-col overflow-y-auto bg-white shadow-lg"
                    style={{ width: panelWidth }}
                >
                    <Draggable axis="x" bounds="parent" onDrag={handleDrag}>
                        <div className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-gray-300" />
                    </Draggable>
                    <div className="flex flex-grow flex-col p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => setPanelWidth(panelWidth + 50)}>
                                    +
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setPanelWidth(panelWidth - 50)} disabled={panelWidth <= 200}>
                                    -
                                </Button>
                            </div>
                            <h2 className="text-xl font-bold">{t("menu.title")}</h2>{" "}
                            <Button variant="ghost" size="sm" onClick={onClosed}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="mb-4 flex space-x-4">
                            {documents.map(doc => (
                                <Button
                                    key={doc.id}
                                    onClick={() => setSelectedDocument(doc)}
                                    className={`h-12 w-60 ${selectedDocument?.id === doc.id ? "bg-green-500" : "bg-gray-200"} hover:bg-green-600`}
                                    aria-label={doc.name}
                                >
                                    {doc.name}
                                </Button>
                            ))}
                        </div>
                        {selectedDocument && (
                            <div className="flex flex-grow flex-col space-y-4">
                                <iframe
                                    src={getDocumentUrl(selectedDocument.url)}
                                    width="100%"
                                    className="flex-grow rounded-md border"
                                    title={selectedDocument.name}
                                ></iframe>
                                <div ref={menuEndRef} />
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
