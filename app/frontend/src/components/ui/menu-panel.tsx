import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Document, Page } from "react-pdf";
import { Button } from "./button";

import { useTranslation } from "react-i18next";

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
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const menuEndRef = useRef<HTMLDivElement>(null);

    // Scroll to the bottom whenever the menu changes
    useEffect(() => {
        if (menuEndRef.current) {
            menuEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedDocument, pageNumber]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: "-100%" }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed inset-y-0 left-0 z-40 w-full overflow-y-auto bg-white shadow-lg sm:w-96"
                >
                    <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-white px-4 py-2">
                        <h2 className="text-xl font-bold">{t("menu.title")}</h2>
                        <Button variant="ghost" size="sm" onClick={onClosed}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="p-4">
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
                            <div className="space-y-4">
                                <Document file={selectedDocument.url} onLoadSuccess={onDocumentLoadSuccess}>
                                    {Array.from(new Array(numPages), (_, index) => (
                                        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                                    ))}
                                </Document>
                                <div ref={menuEndRef} />
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
