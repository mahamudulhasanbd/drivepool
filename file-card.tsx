import React from "react";
import { motion } from "framer-motion";
import type { FileItem } from "@workspace/api-client-react";
import { FileIcon, getFileColor } from "@/components/icons";
import { formatBytes, formatDate, cn } from "@/lib/utils";
import { FileMenu } from "./file-menu";

interface FileCardProps {
  file: FileItem;
  onAction: (file: FileItem, action: 'rename' | 'move' | 'delete') => void;
}

export function FileCard({ file, onAction }: FileCardProps) {
  const colors = getFileColor(file.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex flex-col bg-card rounded-2xl border border-border/50 hover:border-primary/30 shadow-lg shadow-black/20 hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Icon area */}
      <div className={cn("h-32 flex items-center justify-center bg-gradient-to-b from-white/[0.03] to-transparent", colors.split(' ')[1])}>
        <FileIcon type={file.type} className={cn("w-12 h-12", colors.split(' ')[0])} />
      </div>

      {/* Info area */}
      <div className="p-4 flex flex-col flex-1 border-t border-white/5 bg-background/50">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground truncate select-none flex-1" title={file.name}>
            {file.name}
          </h3>
          <div className="-mt-1 -mr-2">
            <FileMenu file={file} onAction={(action) => onAction(file, action)} />
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}
