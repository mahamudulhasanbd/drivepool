import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useRenameFile, useMoveFile, useDeleteFile, useListFolders,
  getListFilesQueryKey, getGetStorageStatsQueryKey, type FileItem
} from "@workspace/api-client-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface FileActionModalsProps {
  file: FileItem | null;
  action: 'rename' | 'move' | 'delete' | null;
  onClose: () => void;
}

export function FileActionModals({ file, action, onClose }: FileActionModalsProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  React.useEffect(() => {
    if (file && action === 'rename') setName(file.name);
    if (file && action === 'move') setSelectedFolderId(file.folderId || null);
  }, [file, action]);

  const { data: folders } = useListFolders();
  const renameMutation = useRenameFile();
  const moveMutation   = useMoveFile();
  const deleteMutation = useDeleteFile();

  const handleSuccess = (message: string) => {
    toast({ title: "Success", description: message });
    queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStorageStatsQueryKey() });
    onClose();
  };

  const handleError = (error: any) => {
    toast({ title: "Error", description: error.message || "An error occurred", variant: "destructive" });
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) return;
    try {
      await renameMutation.mutateAsync({ id: file.id, data: { name: name.trim() } });
      handleSuccess(`Renamed to ${name}`);
    } catch (err) { handleError(err); }
  };

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      await moveMutation.mutateAsync({ id: file.id, data: { folderId: selectedFolderId } });
      handleSuccess("File moved successfully");
    } catch (err) { handleError(err); }
  };

  const handleDelete = async () => {
    if (!file) return;
    try {
      await deleteMutation.mutateAsync({ id: file.id });
      handleSuccess("File moved to trash");
    } catch (err) { handleError(err); }
  };

  if (!file) return null;

  return (
    <>
      {/* ── RENAME ── */}
      <Dialog open={action === 'rename'} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <form onSubmit={handleRename}>
            <DialogHeader>
              <DialogTitle>Rename File</DialogTitle>
              <DialogDescription>Enter a new name for your file.</DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                placeholder="File name"
              />
            </div>
            <DialogFooter>
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={renameMutation.isPending || !name.trim() || name === file.name}
                className="px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {renameMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MOVE ── */}
      <Dialog open={action === 'move'} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <form onSubmit={handleMove}>
            <DialogHeader>
              <DialogTitle>Move File</DialogTitle>
              <DialogDescription>Select a destination folder for '{file.name}'.</DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-2">
              {/* Root option */}
              <div
                onClick={() => setSelectedFolderId(null)}
                className={`p-3 rounded-xl cursor-pointer border-2 transition-all flex items-center gap-3 ${
                  selectedFolderId === null ? "border-primary bg-primary/10" : "border-transparent bg-secondary/50 hover:bg-secondary"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-medium text-white">Root (All Files)</span>
              </div>

              {/* Folder options */}
              {folders?.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`p-3 rounded-xl cursor-pointer border-2 transition-all flex items-center gap-3 ${
                    selectedFolderId === folder.id ? "border-primary bg-primary/10" : "border-transparent bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-white">{folder.name}</span>
                </div>
              ))}
              {folders?.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">No custom folders created yet.</p>
              )}
            </div>
            <DialogFooter>
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={moveMutation.isPending || selectedFolderId === file.folderId}
                className="px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {moveMutation.isPending ? "Moving..." : "Move Here"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DELETE ── */}
      <Dialog open={action === 'delete'} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="text-white font-medium">'{file.name}'</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-5 py-2.5 rounded-xl font-semibold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all shadow-lg shadow-red-500/10 hover:shadow-red-500/25 disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Forever"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
