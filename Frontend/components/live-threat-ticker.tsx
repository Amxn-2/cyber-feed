'use client';

import React from 'react';
import { useSocket } from '@/contexts/socket-context';
import { AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LiveThreatTicker() {
  const { lastIncident } = useSocket();

  if (!lastIncident) return (
    <div className="h-10 bg-card/50 border-y border-primary/20 flex items-center px-4 overflow-hidden">
      <div className="flex items-center gap-2 text-xs font-mono text-primary/60 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-primary/60" />
        SCANNING NETWORK FOR ANOMALIES...
      </div>
    </div>
  );

  return (
    <div className="h-10 bg-destructive/10 border-y border-destructive/30 flex items-center px-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-2 h-full bg-destructive animate-pulse" />
      <AnimatePresence mode="wait">
        <motion.div 
          key={lastIncident._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex items-center gap-4 text-xs font-mono font-bold text-destructive uppercase tracking-widest"
        >
          <ShieldAlert className="h-4 w-4 animate-bounce" />
          <span>NEW THREAT DETECTED: {lastIncident.title}</span>
          <span className="text-destructive/60">SOURCE: {lastIncident.source}</span>
          <span className="text-destructive/60">SEVERITY: {lastIncident.severity}</span>
        </motion.div>
      </AnimatePresence>
      <div className="scan-line" />
    </div>
  );
}
