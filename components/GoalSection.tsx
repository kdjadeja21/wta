"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Edit2 } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { updateUserProfile } from "@/lib/firebaseService";
import { calculateGoalProgress } from "@/lib/weightUtils";
import { WeightEntry } from "@/lib/types";
import { toast } from "sonner";

interface GoalSectionProps {
  currentWeight: number | null;
  weights: WeightEntry[];
  onUpdate: () => void;
}

export function GoalSection({ currentWeight, weights, onUpdate }: GoalSectionProps) {
  const { user, userProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [goalWeight, setGoalWeight] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.goalWeight) {
      setGoalWeight(userProfile.goalWeight.toString());
    }
  }, [userProfile]);

  const handleSaveGoal = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    const goalNum = parseFloat(goalWeight);
    
    if (isNaN(goalNum) || goalNum <= 0 || goalNum > 500) {
      toast.error("Please enter a valid goal weight (1-500 kg)");
      return;
    }

    setSaving(true);
    const success = await updateUserProfile(user.uid, { goalWeight: goalNum });
    setSaving(false);
    
    if (success) {
      toast.success("Goal weight saved successfully");
      setShowForm(false);
      onUpdate();
    } else {
      toast.error("Failed to save goal weight");
    }
  };

  const handleCancel = () => {
    setGoalWeight(userProfile?.goalWeight?.toString() || "");
    setShowForm(false);
  };

  const goalNum = userProfile?.goalWeight || parseFloat(goalWeight);
  const progress = currentWeight && goalNum > 0 && weights.length > 0
    ? calculateGoalProgress(currentWeight, goalNum, weights)
    : null;

  if (!showForm) {
    // Display mode - compact view
    return (
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Goal Weight</p>
              {goalNum > 0 ? (
                <div className="mt-1">
                  <p className="text-2xl font-bold">{goalNum} kg</p>
                  {progress && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress.progress}%</span>
                      </div>
                      <Progress value={progress.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {Math.abs(progress.remaining).toFixed(1)} kg remaining
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-base font-medium mt-1">Not set</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="gap-2 whitespace-nowrap"
          >
            <Edit2 className="h-4 w-4" />
            {goalNum > 0 ? "Update" : "Add"}
          </Button>
        </div>
      </div>
    );
  }

  // Edit mode - full form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal Tracking
        </CardTitle>
        <CardDescription>
          Set your target weight goal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goalWeight">Target Weight (kg)</Label>
          <Input
            id="goalWeight"
            type="number"
            step="0.1"
            placeholder="70"
            value={goalWeight}
            onChange={(e) => setGoalWeight(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Enter your target weight in kilograms (1-500 kg)
          </p>
        </div>

        {progress && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-lg font-semibold">
                  {Math.abs(progress.remaining).toFixed(1)} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Tracked</p>
                <p className="text-lg font-semibold">{progress.daysTracked}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveGoal} 
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

