"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAppContext } from "./appContext";

interface SubscriptionContextType {
  isPro: boolean;
  isLoading: boolean;
  isDebugMode: boolean;
  toggleDebugPro: () => void;
  resetDebug: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({
  children,
  initialIsPro,
  initialUserId,
}: {
  children: React.ReactNode;
  initialIsPro: boolean;
  initialUserId: string | null;
}) {
  const { isPro: appIsPro, isLoadingSubscription, user } = useAppContext();
  const [debugOverride, setDebugOverride] = useState<boolean | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [hasClientSideUpdated, setHasClientSideUpdated] = useState(false);

  // Check if we are in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setIsDebugMode(true);
      
      // Check local storage for debug override
      const debugPro = localStorage.getItem("debug_is_pro");
      if (debugPro !== null) {
        setDebugOverride(debugPro === "true");
      }
    }
  }, []);

  // Track if client-side data has been fetched at least once
  useEffect(() => {
    if (!isLoadingSubscription) {
      setHasClientSideUpdated(true);
    }
  }, [isLoadingSubscription]);

  const toggleDebugPro = () => {
    if (!isDebugMode) return;
    
    // If we are currently using the real value, we want to toggle AWAY from it.
    // If we are already overriding, we toggle the override.
    const currentVal = debugOverride !== null 
      ? debugOverride 
      : (user ? (isLoadingSubscription && !hasClientSideUpdated ? initialIsPro : appIsPro) : false);
      
    const newStatus = !currentVal;
    
    setDebugOverride(newStatus);
    localStorage.setItem("debug_is_pro", String(newStatus));
    
    console.log(`[Debug] Pro status toggled to: ${newStatus}`);
  };

  const resetDebug = () => {
    setDebugOverride(null);
    localStorage.removeItem("debug_is_pro");
    console.log(`[Debug] Pro status reset to real value`);
  };

  // Calculate effective status
  // 1. If debug override is set, use it.
  // 2. If user is not logged in, they are not Pro (unless debug override).
  // 3. If app context is loading AND we haven't fetched client data yet...
  //    AND the current user matches the initial user (SSR user), use the initial server-side value.
  // 4. Otherwise, use the real-time app context value.
  
  const isInitialUser = user?.id === initialUserId;
  const shouldUseInitialValue = isLoadingSubscription && !hasClientSideUpdated && isInitialUser;

  const isPro = debugOverride !== null 
    ? debugOverride 
    : (user ? (shouldUseInitialValue ? initialIsPro : appIsPro) : false);

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        isLoading: isLoadingSubscription,
        isDebugMode,
        toggleDebugPro,
        resetDebug,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}
