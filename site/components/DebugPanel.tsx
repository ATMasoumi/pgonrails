"use client";

import React, { useState, useEffect } from "react";
import { useSubscription } from "@/lib/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, X, ChevronDown, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

export function DebugPanel() {
  const { isPro, isDebugMode, toggleDebugPro, resetDebug } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isDebugMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <Card className="w-80 shadow-2xl border-2 border-yellow-400/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bug className="h-4 w-4 text-yellow-500" />
              Dev Tools
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Status</span>
                <Badge variant={isPro ? "default" : "secondary"}>
                  {isPro ? "PRO" : "FREE"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Toggle subscription status to test UI adaptation. This only affects the current session.
                </p>
                <Button 
                  onClick={toggleDebugPro} 
                  variant="outline" 
                  className="w-full"
                >
                  Switch to {isPro ? "Free" : "Pro"} Plan
                </Button>
                <Button 
                  onClick={resetDebug} 
                  variant="ghost" 
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset to Real Value
                </Button>
              </div>

              <div className="pt-2 border-t text-[10px] text-muted-foreground font-mono">
                Environment: {process.env.NODE_ENV}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "rounded-full shadow-lg transition-all hover:scale-110",
          isOpen ? "bg-yellow-500 hover:bg-yellow-600" : "bg-primary"
        )}
      >
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
      </Button>
    </div>
  );
}
