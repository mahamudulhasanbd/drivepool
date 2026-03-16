import React, { useState } from "react";
import { useRoute } from "wouter";
import { useAppStore } from "@/store/use-app-store";
import { useListFiles, type FileItem } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { StorageStatsDashboard } from "@/components/dashboard/storage-stats";
import { FileCard } from "@/components/files/file-card";
import { FileRow } from "@/components/files/file-row";
import { FileActionModals } from "@/components/modals/file-action-modals";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface DashboardProps {
  currentUser: { id: string; username: string };
  onLogout: () => void;
}

export function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const { viewMode, searchQuery } = useAppStore();

  const [matchType, paramsType] = useRoute("/type/:type");
  const [matchFolder, paramsFolder] = useRoute("/folder/:id");
  const isRoot = !matchType && !matchFolder;

  const currentType = matchType ? paramsType?.type : undefined;
  const currentFolderId = matchFolder ? paramsFolder?.id : undefined;

  const { data: files, isLoading } = useListFiles({
    type: currentType,
    folderId: currentFolderId,
    search: searchQuery || undefined,
  });

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [actionType, setActionType] = useState<"rename" | "move" | "delete" | null>(null);

  const handleAction = (file: FileItem, action: "rename" | "move" | "delete") => {
    setSelectedFile(file);
    setActionType(action);
  };

  const getPageTitle = () => {
    if (searchQuery) return `Search results for "${searchQuery}"`;
    if (matchType) return `${currentType?.charAt(0).toUpperCase()}${currentType?.slice(1)}s`;
    if (matchFolder) return "Folder Contents";
    return "Recent Files";
  };

  return (
    <AppLayout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-7xl mx-auto">

        {/* Storage stats shown only on root/home */}
        {isRoot && !searchQuery && <StorageStatsDashboard />}

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            {getPageTitle()}
          </h1>
          <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
            {files?.length || 0} items
          </span>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p>Loading your files...</p>
          </div>

        /* Empty state */
        ) : files?.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center">
            {searchQuery ? (
              <>
                <img src={`${import.meta.env.BASE_URL}images/empty-search.png`} alt="No results" className="w-48 h-48 opacity-80 mb-6 drop-shadow-2xl" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-muted-foreground max-w-sm">We couldn't find any files matching "{searchQuery}". Try a different keyword.</p>
              </>
            ) : (
              <>
                <img src={`${import.meta.env.BASE_URL}images/empty-folder.png`} alt="Empty folder" className="w-48 h-48 opacity-80 mb-6 drop-shadow-2xl animate-in fade-in zoom-in duration-700" />
                <h3 className="text-xl font-semibold text-white mb-2">This space is empty</h3>
                <p className="text-muted-foreground max-w-sm">Drag and drop files here to upload, or use the Upload button in the top right.</p>
              </>
            )}
          </div>

        /* File grid or list */
        ) : (
          <div className={viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            : "flex flex-col gap-2"
          }>
            <AnimatePresence mode="popLayout">
              {files?.map((file) =>
                viewMode === "grid" ? (
                  <FileCard key={file.id} file={file} onAction={handleAction} />
                ) : (
                  <FileRow key={file.id} file={file} onAction={handleAction} />
                )
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <FileActionModals
        file={selectedFile}
        action={actionType}
        onClose={() => {
          setSelectedFile(null);
          setActionType(null);
        }}
      />
    </AppLayout>
  );
}
