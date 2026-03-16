import React from "react";
import { useGetStorageStats } from "@workspace/api-client-react";
import { formatBytes } from "@/lib/utils";
import { HardDrive, Cloud, FileCode, Film, Music, Image, Archive } from "lucide-react";

export function StorageStatsDashboard() {
  const { data: stats, isLoading } = useGetStorageStats();

  if (isLoading || !stats) return (
    <div className="w-full h-32 rounded-2xl bg-card border border-white/5 animate-pulse" />
  );

  const TOTAL_QUOTA = 10 * 1024 * 1024 * 1024; 
  const percentage = Math.min((stats.totalSize / TOTAL_QUOTA) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

      {/* Main Quota Card */}
      <div className="md:col-span-2 bg-card border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-xl shadow-black/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Cloud className="w-4 h-4" />
              <h2 className="font-medium text-sm uppercase tracking-wider">Storage Quota</h2>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-display font-bold text-white">{formatBytes(stats.totalSize)}</span>
              <span className="text-muted-foreground font-medium">used of 10 GB</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        {/* Coloured progress bar broken down by file type */}
        <div className="mt-6 relative z-10">
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden flex">
            {Object.entries(stats.usedByType || {}).map(([type, size]) => {
              if (!size) return null;
              const width = `${(size / stats.totalSize) * 100}%`;
              let color = "bg-primary";
              if (type === "image")    color = "bg-emerald-400";
              if (type === "video")    color = "bg-purple-400";
              if (type === "audio")    color = "bg-amber-400";
              if (type === "document") color = "bg-blue-400";
              if (type === "archive")  color = "bg-orange-400";
              
              return (
                <div 
                  key={type} 
                  className={`h-full ${color} transition-all duration-1000 ease-out first:rounded-l-full last:rounded-r-full hover:brightness-125`}
                  style={{ width }}
                  title={`${type}: ${formatBytes(size)}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Total Files Card */}
      <div className="bg-card border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/20 flex flex-col justify-center">
        <h3 className="text-muted-foreground font-medium text-sm uppercase tracking-wider mb-4">Total Files</h3>
        <div className="text-5xl font-display font-bold text-white mb-2">
          {stats.totalFiles.toLocaleString()}
        </div>
        <p className="text-sm text-muted-foreground">Stored securely in your Drivepool</p>
      </div>

    </div>
  );
}
