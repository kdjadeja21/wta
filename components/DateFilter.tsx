"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DateRange } from "@/lib/types";
import { format } from "date-fns";

type FilterOption = "7" | "15" | "30" | "custom";

interface DateFilterProps {
  onFilterChange: (days: number | DateRange) => void;
  defaultFilter?: FilterOption;
}

export function DateFilter({ onFilterChange, defaultFilter = "30" }: DateFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>(defaultFilter);
  const [dateRange, setDateRange] = useState<DateRange>(undefined);
  const [open, setOpen] = useState(false);

  const handleFilterClick = (filter: FilterOption, days?: number) => {
    setActiveFilter(filter);
    if (days) {
      onFilterChange(days);
    }
  };

  const handleCustomDateApply = () => {
    if (dateRange) {
      onFilterChange(dateRange);
      setActiveFilter("custom");
      setOpen(false);
    }
  };

  const getCustomButtonText = () => {
    if (activeFilter === "custom" && dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`;
    }
    return "Custom";
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={activeFilter === "7" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("7", 7)}
          className={cn(
            "whitespace-nowrap text-xs md:text-sm h-8 md:h-9 px-3 md:px-4",
            activeFilter === "7" && "bg-purple-600 hover:bg-purple-700"
          )}
        >
          7 Days
        </Button>

        <Button
          variant={activeFilter === "15" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("15", 15)}
          className={cn(
            "whitespace-nowrap text-xs md:text-sm h-8 md:h-9 px-3 md:px-4",
            activeFilter === "15" && "bg-purple-600 hover:bg-purple-700"
          )}
        >
          15 Days
        </Button>

        <Button
          variant={activeFilter === "30" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterClick("30", 30)}
          className={cn(
            "whitespace-nowrap text-xs md:text-sm h-8 md:h-9 px-3 md:px-4",
            activeFilter === "30" && "bg-purple-600 hover:bg-purple-700"
          )}
        >
          30 Days
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant={activeFilter === "custom" ? "default" : "outline"}
              size="sm"
              className={cn(
                "whitespace-nowrap text-xs md:text-sm h-8 md:h-9 px-3 md:px-4",
                activeFilter === "custom" && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              {getCustomButtonText()}
            </Button>
          </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Custom Date Range</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground">
              Select a start and end date to view your progress for that period.
            </div>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => setDateRange(range as DateRange)}
              numberOfMonths={1}
              className="rounded-md border mx-auto"
            />
            {dateRange?.from && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <div className="font-medium mb-1">Selected Range:</div>
                <div className="text-muted-foreground">
                  {dateRange.to ? (
                    <>
                      {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
                    </>
                  ) : (
                    <>
                      {format(dateRange.from, "PPP")} (Select end date)
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDateRange(undefined);
                  setOpen(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCustomDateApply}
                disabled={!dateRange?.from || !dateRange?.to}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Apply Range
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
      
      {/* Active Filter Indicator */}
      {activeFilter === "custom" && dateRange?.from && dateRange?.to && (
        <div className="text-xs md:text-sm text-muted-foreground">
          Showing data from {format(dateRange.from, "MMM d, yyyy")} to {format(dateRange.to, "MMM d, yyyy")}
        </div>
      )}
    </div>
  );
}

