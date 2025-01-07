import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AzureSpeechContextProps {
    useAzureSpeechOn: boolean;
    setUseAzureSpeechOn: (value: boolean) => void;
}

const AzureSpeechContext = createContext<AzureSpeechContextProps | undefined>(undefined);

export const AzureSpeechProvider = ({ children }: { children: ReactNode }) => {
    const [useAzureSpeechOn, setUseAzureSpeechOn] = useState(() => {
        return localStorage.getItem("useAzureSpeechOn") === "true";
    });

    useEffect(() => {
        localStorage.setItem("useAzureSpeechOn", useAzureSpeechOn.toString());
    }, [useAzureSpeechOn]);

    return <AzureSpeechContext.Provider value={{ useAzureSpeechOn, setUseAzureSpeechOn }}>{children}</AzureSpeechContext.Provider>;
};

export const useAzureSpeechOnContext = () => {
    const context = useContext(AzureSpeechContext);
    if (!context) {
        throw new Error("useAzureSpeechOnContext must be used within an AzureSpeechProvider");
    }
    return context;
};
