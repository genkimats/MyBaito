import { createContext, useContext } from "react";

export const BaitoContext = createContext();

export const useBaitoContext = () => useContext(BaitoContext);
