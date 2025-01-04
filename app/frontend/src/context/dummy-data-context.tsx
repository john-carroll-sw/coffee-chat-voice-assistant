import React, { createContext, useContext, useState, useEffect } from "react";

interface DummyDataContextProps {
    useDummyData: boolean;
    setUseDummyData: (value: boolean) => void;
}

const DummyDataContext = createContext<DummyDataContextProps | undefined>(undefined);

interface DummyDataProviderProps {
    children: React.ReactNode;
}

export const DummyDataProvider: React.FC<DummyDataProviderProps> = ({ children }) => {
    const [useDummyData, setUseDummyData] = useState(() => {
        return localStorage.getItem("useDummyData") === "true";
    });

    useEffect(() => {
        localStorage.setItem("useDummyData", useDummyData.toString());
    }, [useDummyData]);

    return <DummyDataContext.Provider value={{ useDummyData, setUseDummyData }}>{children}</DummyDataContext.Provider>;
};

export const useDummyDataContext = () => {
    const context = useContext(DummyDataContext);
    if (!context) {
        throw new Error("useDummyDataContext must be used within a DummyDataProvider");
    }
    return context;
};
