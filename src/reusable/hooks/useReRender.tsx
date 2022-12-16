import React, { createContext, useContext, useState } from "react";

interface ReRenderProps {
    counter: number
    ReRender: () => void
}

const reRenderContext = createContext<ReRenderProps>({
    counter: 0,
    ReRender: () => {
        throw new Error("Why is it entering the first")
    }
});

const useProvideReRender = () => {
    const RefreshCounter = useState(0)
    const ReRender = () => RefreshCounter[1](RefreshCounter[0]+1)

    return {
        counter: RefreshCounter[0],
        ReRender,
    }
}

export const ProvideReRender = ({ children } : { children: React.ReactNode }) => {
    const props = useProvideReRender();
    return <reRenderContext.Provider value={props}>{children}</reRenderContext.Provider>;
}

const useReRender = () => {
    const { counter, ReRender } = useContext(reRenderContext);
    return {
        counter,
        ReRender
    }
}

export default useReRender