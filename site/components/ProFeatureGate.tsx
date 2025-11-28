"use client";

import { useSubscription } from "@/lib/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import Link from "next/link";

interface ProFeatureGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
}

export function ProFeatureGate({ 
  children, 
  fallback,
  title = "Pro Feature",
  description = "Upgrade to Pro to access this feature."
}: ProFeatureGateProps) {
  const { isPro, isLoading } = useSubscription();

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-white/5 rounded-lg" />;
  }

  if (isPro) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-dashed border-yellow-500/50 bg-yellow-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-500">
          <Lock className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
          <Link href="/pricing">Upgrade to Pro</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
