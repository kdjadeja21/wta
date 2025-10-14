"use client";

import { useState, useMemo } from "react";
import { WeightEntry } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowUpDown, TrendingUp, TrendingDown, Minus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";
import { deleteWeightEntry } from "@/lib/firebaseService";
import { toast } from "sonner";

interface WeightTableProps {
  weights: WeightEntry[];
  onEdit?: (entry: WeightEntry) => void;
  onDelete?: () => void;
}

type SortDirection = "asc" | "desc" | null;
type SortColumn = "date" | "weight";

export function WeightTable({ weights, onEdit, onDelete }: WeightTableProps) {
  const { user } = useAuth();
  const [sortColumn, setSortColumn] = useState<SortColumn>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<WeightEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  // Calculate changes
  const weightsWithChanges = useMemo(() => {
    const sorted = [...weights].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sorted.map((entry, index) => {
      if (index === sorted.length - 1) {
        return { ...entry, change: null };
      }
      const previousWeight = sorted[index + 1].weight;
      const change = entry.weight - previousWeight;
      return { ...entry, change };
    });
  }, [weights]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortDirection) return weightsWithChanges;

    return [...weightsWithChanges].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      if (sortColumn === "date") {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else {
        aValue = a.weight;
        bValue = b.weight;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [weightsWithChanges, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getTrendIcon = (change: number | null) => {
    if (change === null) return <Minus className="h-4 w-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getChangeColor = (change: number | null) => {
    if (change === null) return "text-gray-500";
    if (change > 0) return "text-red-600";
    if (change < 0) return "text-green-600";
    return "text-gray-500";
  };

  const handleDeleteClick = (entry: WeightEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !entryToDelete?.id) return;

    setDeleting(true);
    const success = await deleteWeightEntry(user.uid, entryToDelete.id);
    setDeleting(false);

    if (success) {
      toast.success("Weight entry deleted successfully");
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      onDelete?.();
    } else {
      toast.error("Failed to delete weight entry");
    }
  };

  const handleEditClick = (entry: WeightEntry) => {
    onEdit?.(entry);
  };

  if (weights.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No weight entries found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start tracking by adding your first weight entry
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] md:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("date")}
                  className="h-8 px-1 md:px-2 text-xs md:text-sm"
                >
                  Date
                  <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px] md:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("weight")}
                  className="h-8 px-1 md:px-2 text-xs md:text-sm"
                >
                  Weight (kg)
                  <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-xs md:text-sm">Change</TableHead>
              <TableHead className="text-xs md:text-sm">Trend</TableHead>
              <TableHead className="text-xs md:text-sm text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((entry) => (
              <TableRow key={entry.date}>
                <TableCell className="font-medium text-xs md:text-sm">
                  {format(new Date(entry.date), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-xs md:text-sm">{entry.weight}</TableCell>
                <TableCell className={cn("font-medium text-xs md:text-sm", getChangeColor(entry.change))}>
                  {entry.change !== null ? 
                    `${entry.change > 0 ? '+' : ''}${entry.change.toFixed(1)}` : 
                    '-'}
                </TableCell>
                <TableCell>{getTrendIcon(entry.change)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(entry)}
                      className="h-7 w-7 p-0 md:h-8 md:w-8"
                    >
                      <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(entry)}
                      className="h-7 w-7 p-0 md:h-8 md:w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
            {sortedData.length} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-xs md:text-sm"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-xs md:text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-xs md:text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Weight Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the weight entry for{" "}
              {entryToDelete && format(new Date(entryToDelete.date), "MMMM dd, yyyy")} 
              {" "}({entryToDelete?.weight} kg)?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

