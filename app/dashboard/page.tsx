"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { StatsCards } from "@/components/StatsCards";
import { DateFilter } from "@/components/DateFilter";
import { WeightChart } from "@/components/WeightChart";
import { WeightTable } from "@/components/WeightTable";
import { WeightDialog } from "@/components/WeightDialog";
import { useAuth } from "@/lib/authContext";
import { subscribeToWeightEntries } from "@/lib/firebaseService";
import { calculateWeightStats, filterWeightsByDays, filterWeightsByDateRange } from "@/lib/weightUtils";
import { WeightEntry, DateRange } from "@/lib/types";

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [filteredWeights, setFilteredWeights] = useState<WeightEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editEntry, setEditEntry] = useState<WeightEntry | undefined>(undefined);
  const [currentFilter, setCurrentFilter] = useState<number | DateRange>(30);
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
      
      // Re-apply current filter
      if (typeof currentFilter === "number") {
        const filtered = filterWeightsByDays(newWeights, currentFilter);
        setFilteredWeights(filtered);
      } else if (currentFilter?.from && currentFilter?.to) {
        const filtered = filterWeightsByDateRange(newWeights, currentFilter.from, currentFilter.to);
        setFilteredWeights(filtered);
      }
    });

    return () => unsubscribe();
  }, [user, currentFilter]);

  const handleFilterChange = (filter: number | DateRange) => {
    setCurrentFilter(filter);
    
    if (typeof filter === "number") {
      const filtered = filterWeightsByDays(weights, filter);
      setFilteredWeights(filtered);
    } else if (filter?.from && filter?.to) {
      const filtered = filterWeightsByDateRange(weights, filter.from, filter.to);
      setFilteredWeights(filtered);
    }
  };

  const handleAddWeight = () => {
    setDialogMode("add");
    setEditEntry(undefined);
    setDialogOpen(true);
  };

  const handleEditWeight = (entry: WeightEntry) => {
    setDialogMode("edit");
    setEditEntry(entry);
    setDialogOpen(true);
  };

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = calculateWeightStats(weights);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar userEmail={userProfile.email} />
      
      <main className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Header - Desktop Only */}
        <div className="hidden md:flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Progress</h1>
          <Button 
            onClick={handleAddWeight}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Weight
          </Button>
        </div>

        {/* Mobile Header with Add Button */}
        <div className="md:hidden">
          <Button 
            onClick={handleAddWeight}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Weight
          </Button>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Progress Overview */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">Progress Overview</h2>

          <DateFilter onFilterChange={handleFilterChange} defaultFilter="30" />

          {/* Chart */}
          <div className="bg-card rounded-lg border p-3 md:p-4">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Weight Progress</h3>
            <WeightChart weights={filteredWeights} />
          </div>
        </div>

        {/* Weight History */}
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">Weight History</h2>
          <WeightTable 
            weights={filteredWeights} 
            onEdit={handleEditWeight}
            onDelete={() => {}}
          />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav onAddWeight={handleAddWeight} />

      {/* Weight Dialog */}
      <WeightDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {}}
        mode={dialogMode}
        editEntry={editEntry}
      />
    </div>
  );
}

