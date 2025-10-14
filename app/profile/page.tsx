"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { BMISection } from "@/components/BMISection";
import { GoalSection } from "@/components/GoalSection";
import { ProfileSettings } from "@/components/ProfileSettings";
import { WeightDialog } from "@/components/WeightDialog";
import { useAuth } from "@/lib/authContext";
import { subscribeToWeightEntries } from "@/lib/firebaseService";
import { getCurrentWeight } from "@/lib/weightUtils";
import { WeightEntry } from "@/lib/types";

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Subscribe to weight entries real-time updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToWeightEntries(user.uid, (newWeights) => {
      setWeights(newWeights);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentWeight = getCurrentWeight(weights);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar userEmail={userProfile.email} />
      
      <main className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold">Profile Settings</h1>

        {/* Profile Settings - Username and Password */}
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Account Settings</h2>
          <ProfileSettings />
        </div>

        {/* Health Metrics */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">Health Metrics</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <BMISection 
              currentWeight={currentWeight} 
              onUpdate={() => {}}
            />
            
            <GoalSection 
              currentWeight={currentWeight}
              weights={weights}
              onUpdate={() => {}}
            />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav onAddWeight={() => setDialogOpen(true)} />

      {/* Weight Dialog */}
      <WeightDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}

