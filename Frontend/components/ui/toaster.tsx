'use client';

import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={cn(
              "pointer-events-auto relative overflow-hidden group p-4 rounded-none border cyber-border bg-background/80 backdrop-blur-md shadow-[0_0_30px_rgba(0,212,255,0.15)]",
              toast.variant === 'destructive' && "border-destructive/50 bg-destructive/5 shadow-destructive/10",
              toast.variant === 'success' && "border-emerald-500/50 bg-emerald-500/5 shadow-emerald-500/10"
            )}
          >
            <div className="scan-line" />
            <div className="flex gap-3">
              <div className="pt-0.5">
                {toast.variant === 'destructive' ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : toast.variant === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Info className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h3 className={cn(
                  "text-xs font-black italic tracking-tighter uppercase",
                  toast.variant === 'destructive' ? "text-destructive" : "text-primary"
                )}>
                  {toast.title}
                </h3>
                {toast.description && (
                  <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-80 line-clamp-2">
                    {toast.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
