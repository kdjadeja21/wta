"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Ruler, Edit2 } from "lucide-react";
import { calculateBMI, getBMICategory } from "@/lib/weightUtils";
import { useAuth } from "@/lib/authContext";
import { updateUserProfile } from "@/lib/firebaseService";
import { toast } from "sonner";

interface BMISectionProps {
  currentWeight: number | null;
  onUpdate: () => void;
}

export function BMISection({ currentWeight, onUpdate }: BMISectionProps) {
  const { user, userProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [height, setHeight] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.height) {
      setHeight(userProfile.height.toString());
    }
  }, [userProfile]);

  const handleSaveHeight = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    const heightNum = parseFloat(height);
    
    if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
      toast.error("Please enter a valid height (1-300 cm)");
      return;
    }

    setSaving(true);
    const success = await updateUserProfile(user.uid, { height: heightNum });
    setSaving(false);
    
    if (success) {
      toast.success("Height saved successfully");
      setShowForm(false);
      onUpdate();
    } else {
      toast.error("Failed to save height");
    }
  };

  const handleCancel = () => {
    setHeight(userProfile?.height?.toString() || "");
    setShowForm(false);
  };

  const heightNum = userProfile?.height || parseFloat(height);
  const bmi = currentWeight && heightNum > 0 ? calculateBMI(heightNum, currentWeight) : 0;
  const bmiResult = getBMICategory(bmi);

  if (!showForm) {
    // Display mode - compact view
    return (
      <div className="p-4 rounded-lg border bg-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">BMI</p>
              {bmi > 0 ? (
                <div className="mt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{bmiResult.bmi}</span>
                    <span className="text-sm text-muted-foreground">BMI</span>
                  </div>
                  <div className={`text-sm font-medium ${bmiResult.color} mt-1`}>
                    {bmiResult.category}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Height: {heightNum} cm
                  </p>
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
            {bmi > 0 ? "Update" : "Add"}
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
          <Ruler className="h-5 w-5" />
          BMI Calculator
        </CardTitle>
        <CardDescription>
          Enter your height to calculate your BMI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="175"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Enter your height in centimeters (1-300 cm)
          </p>
        </div>

        {bmi > 0 && (
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{bmiResult.bmi}</span>
              <span className="text-muted-foreground">BMI</span>
            </div>
            <div className={`font-medium ${bmiResult.color}`}>
              {bmiResult.category}
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
            onClick={handleSaveHeight} 
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

