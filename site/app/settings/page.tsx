import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import Stripe from "stripe";
import UploadAvatar from "@/components/settings/UploadAvatar";
import UpdateDisplayName from "@/components/settings/UpdateDisplayName";
import UpdateEmail from "@/components/settings/UpdateEmail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteAccount } from "../auth/actions";
import UpdatePassword from "@/components/settings/UpdatePassword";
import LiveDisplayName from "./LiveDisplayName";
import Link from "next/link";
import ManageSubscriptionButton from "@/components/settings/ManageSubscriptionButton";
import TokenUsage from "@/components/settings/TokenUsage";
import { getTokenUsageWithDetails } from "@/lib/token-usage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CreditCard, Lock, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function Settings() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .in('status', ['trialing', 'active'])
    .maybeSingle()

  let planName = subscription ? 'Pro Plan' : 'Free Plan';
  
  if (subscription && subscription.price_id) {
    try {
      const price = await stripe.prices.retrieve(subscription.price_id, {
        expand: ['product']
      });
      
      if (price.nickname) {
        planName = price.nickname;
      } else if (price.product && (price.product as Stripe.Product).name) {
        planName = (price.product as Stripe.Product).name;
      }
    } catch (error) {
      console.error('Error fetching stripe price:', error);
    }
  }

  const usageDetails = data?.user ? await getTokenUsageWithDetails(data.user.id) : null

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-500 opacity-20 blur-[100px]"></div>
      </div>
      <div className="relative z-10">
      <Navbar />
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">
                Settings
            </h1>
            <p className="text-gray-400">
                Manage your account settings and preferences.
            </p>
        </div>

        <div className="space-y-6">
            {/* Profile Section */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white backdrop-blur-lg shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Profile
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Manage your public profile and personal details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start p-2">
                        <div className="relative">
                            <UploadAvatar />
                        </div>
                        <div className="flex-1 space-y-6 w-full max-w-xl">
                            <div className="space-y-2">
                                <Label className="text-gray-200 text-sm font-medium ml-1">Display Name</Label>
                                <UpdateDisplayName initialValue={data?.user?.user_metadata?.full_name} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-200 text-sm font-medium ml-1">Email Address</Label>
                                <UpdateEmail initialValue={data?.user?.email} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Billing Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white backdrop-blur-lg shadow-xl group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-100">
                            <CreditCard className="h-5 w-5 text-purple-400" />
                            Subscription
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Manage your plan and billing details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {subscription ? (
                            <div className="relative p-6 rounded-xl border overflow-hidden transition-all duration-500 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/20">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/30 blur-2xl rounded-full pointer-events-none" />
                                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-blue-500/30 blur-2xl rounded-full pointer-events-none" />
                                
                                <div className="relative flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400 mb-1">Current Plan</p>
                                        <h3 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                            {planName}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full backdrop-blur-md shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                                        <span className="text-xs font-semibold text-purple-200">Active</span>
                                    </div>
                                </div>
                                
                                <div className="mt-6 flex items-center gap-3 text-sm text-gray-300">
                                    <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/20">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">Pro Features Unlocked</span>
                                        <span className="text-xs text-gray-400">You have access to all premium tools</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link href="/pricing" className="block group/plan">
                                <div className="relative p-6 rounded-xl border overflow-hidden transition-all duration-500 bg-white/5 border-white/10 group-hover/plan:bg-white/10 group-hover/plan:border-white/20 cursor-pointer">
                                    <div className="relative flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-400 mb-1">Current Plan</p>
                                            <h3 className="text-3xl font-bold tracking-tight text-white">
                                                {planName}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                                            <span className="text-xs font-semibold text-gray-400">Basic</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex items-center gap-3 text-sm text-gray-400">
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                            <Lock className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-300">Limited Access</span>
                                            <span className="text-xs text-gray-500">Upgrade to unlock premium features</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {subscription ? (
                            <ManageSubscriptionButton className="w-full" />
                        ) : (
                            <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]">
                                <Link href="/pricing">
                                    Upgrade to Pro
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {usageDetails && (
                    <TokenUsage 
                        used={usageDetails.used} 
                        limit={usageDetails.limit} 
                        resetDate={usageDetails.resetDate} 
                    />
                )}
            </div>

            {/* Security Section */}
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white backdrop-blur-lg shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-orange-500" />
                        Security
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Update your password and secure your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdatePassword />
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 text-white backdrop-blur-lg shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-500">
                        <Trash2 className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-500/70">
                        Irreversible actions for your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                        <div className="space-y-1">
                            <p className="font-medium text-red-200">Delete Account</p>
                            <p className="text-sm text-red-200/60">
                                Permanently delete your account and all data
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white border-0">
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#0A0A0A] border-white/10 text-gray-200">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                        This action cannot be undone. This will permanently delete your
                                        account and remove your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-500 text-white hover:bg-red-400" onClick={deleteAccount}>
                                        Delete Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      </div>
    </div>
  )
}
