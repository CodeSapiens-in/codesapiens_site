import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext({
    isAppLoading: false,
    setIsAppLoading: () => { },
});

export const useAppLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
    const [isAppLoading, setIsAppLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isAppLoading, setIsAppLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};
