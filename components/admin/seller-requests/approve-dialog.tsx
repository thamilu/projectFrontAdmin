'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApproveSellerRequestSchema, ApproveSellerRequestValues } from '@/lib/validation/schemas/seller-request';

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function ApproveDialog({
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
}: ApproveDialogProps) {
  const { handleSubmit, reset } = useForm<ApproveSellerRequestValues>({
    resolver: zodResolver(ApproveSellerRequestSchema),
    defaultValues: {
      reason: '',
    },
  });

  const onSubmit = () => {
    onConfirm();
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 px-6 py-6 border-b border-emerald-100 dark:border-emerald-900/50">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <DialogTitle className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                  Approve Application
                </DialogTitle>
              </div>
              <DialogDescription className="text-emerald-700/70 dark:text-emerald-400/70 font-medium leading-relaxed">
                This action will grant the user active seller privileges and allow them to start listing products on the storefront immediately.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-6 space-y-4">
            <div className="bg-muted/30 p-4 rounded-xl border border-dashed flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-sm font-medium text-muted-foreground leading-relaxed">
                By confirming, you verify that all provided KYC details, business documents, and contact information adhere to platform guidelines.
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/20 border-t flex gap-3 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="font-bold text-muted-foreground hover:bg-muted"
            >
              Go Back
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="px-8 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
            >
              {isProcessing ? 'Processing...' : 'Confirm Approval'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
