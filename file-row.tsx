import React from "react";
import { motion } from "framer-motion";
import type { FileItem } from "@workspace/api-client-react";
import { FileIcon, getFileColor } from "@/components/icons";
import { formatBytes, formatDate, cn } from "@/lib/utils";
import { FileMenu } from "./file-menu";

interface FileRowProps {
  file: FileItem;
  onAction: (file: FileItem, action: 'rename' | 'move' | 'delete') => void;
}

export function FileRow({ file, onAction }: FileRowProps) {
  const colors = getFileColor(file.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
    >
      {/* File type icon */}
      <div className={cn("w-10 h-10 shrink-0 rounded-lg flex items-center justify-center", colors.split(' ')[1])}>
        <FileIcon type={file.type} className={cn("w-5 h-5", colors.split(' ')[0])} />
      </div>

      <div className="flex-1 min-w-0 flex items-center justify-between">
        <div className="flex flex-col flex-1 min-w-0 pr-4">
          {/* File name */}
          <h3 className="font-medium text-foreground truncate select-none" title={file.name}>
            {file.name}
          </h3>
          {/* Size + date shown below name on mobile */}
          <span className="text-xs text-muted-foreground sm:hidden">
            {formatBytes(file.size)} • {formatDate(file.createdAt)}
          </span>
        </div>

        {/* Size + date shown inline on desktop */}
        <div className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
          <span className="w-24 text-right">{formatBytes(file.size)}</span>
          <span className="w-32 text-right">{formatDate(file.createdAt)}</span>
        </div>
      </div>

      {/* Context menu */}
      <div className="shrink-0 w-8 flex justify-end">
        <FileMenu file={file} onAction={(action) => onAction(file, action)} />
      </div>
    </motion.div>
  );
}
