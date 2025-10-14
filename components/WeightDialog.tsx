"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";
import { addOrUpdateWeightEntry, updateWeightEntry } from "@/lib/firebaseService";
import { validateWeight } from "@/lib/auth";
import { toast } from "sonner";
import { WeightEntry } from "@/lib/types";

interface WeightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode?: "add" | "edit";
  editEntry?: WeightEntry;
}

export function WeightDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  mode = "add",
  editEntry 
}: WeightDialogProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && editEntry) {
      setDate(new Date(editEntry.date));
      setWeight(editEntry.weight.toString());
    } else {
      setDate(new Date());
      setWeight("");
    }
  }, [mode, editEntry, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to save weight entries");
      return;
    }

    setError("");
    setSubmitting(true);

    const weightNum = parseFloat(weight);
    const validation = validateWeight(weightNum);

    if (!validation.valid) {
      setError(validation.message || "Invalid weight");
      setSubmitting(false);
      return;
    }

    const dateStr = format(date, "yyyy-MM-dd");
    
    // Optimistic UI update - close dialog immediately
    const toastId = toast.loading(mode === "edit" ? "Updating weight entry..." : "Saving weight entry...");
    setWeight("");
    setDate(new Date());
    onOpenChange(false);
    onSuccess();

    let success = false;

    if (mode === "edit" && editEntry?.id) {
      // Update existing entry
      success = await updateWeightEntry(user.uid, editEntry.id, dateStr, weightNum);
    } else {
      // Create new entry or update if date exists
      const result = await addOrUpdateWeightEntry(user.uid, dateStr, weightNum);
      success = result.success;
    }

    setSubmitting(false);

    if (success) {
      toast.success(
        mode === "edit" ? "Weight entry updated successfully" : "Weight entry saved successfully",
        { id: toastId }
      );
    } else {
      toast.error("Failed to save weight entry. Please try again.", { id: toastId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Weight Entry" : "Add Weight Entry"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" 
              ? "Update your weight entry for this date."
              : "Record your weight for a specific date. If an entry already exists for that date, it will be updated."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="75.5"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setError("");
              }}
              required
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={submitting}
            >
              {submitting ? "Saving..." : mode === "edit" ? "Update Entry" : "Save Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

