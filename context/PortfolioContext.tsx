"use client";

import { createContext, useContext } from "react";

type PortfolioContextType = {
  username: string;
};

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  return (
    <PortfolioContext.Provider value={{ username }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside provider");
  return ctx;
}