'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, MessageSquare, X } from 'lucide-react';

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isProcessing: boolean;
}

export function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
}: RejectDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-rose-50 dark:bg-rose-950/20 px-6 py-6 border-b border-rose-100 dark:border-rose-900/50">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <DialogTitle className="text-xl font-bold text-rose-900 dark:text-rose-100">
                Reject Application
              </DialogTitle>
            </div>
            <DialogDescription className="text-rose-700/70 dark:text-rose-400/70 font-medium leading-relaxed">
              This action will notify the seller that their request has been declined. Please provide a constructive reason.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-3 w-3" /> Rejection Reason *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Documents provided are not clear, Shop name is invalid, Category mismatch..."
              className="min-h-[120px] resize-none focus-visible:ring-rose-500/30 border-muted-foreground/20 rounded-xl p-4 text-sm leading-relaxed"
              autoFocus
            />
          </div>
          <p className="text-[10px] text-muted-foreground italic bg-muted/30 p-2 rounded-lg border border-dashed text-center">
            The seller will see this message in their dashboard.
          </p>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/20 border-t flex gap-3 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="font-bold text-muted-foreground hover:bg-muted"
          >
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isProcessing}
            className="px-8 font-bold shadow-lg shadow-rose-500/20"
          >
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
