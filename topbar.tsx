import React, { useCallback, useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Search, LayoutGrid, List as ListIcon, UploadCloud, Menu, LogOut, KeyRound, User, Sun, Moon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "@/components/modals/change-password-dialog";
import { useFileUpload } from "@/hooks/use-file-upload";

interface TopbarProps {
  currentUser: { id: string; username: string };
  onLogout: () => void;
}

export function Topbar({ currentUser, onLogout }: TopbarProps) {
  const { viewMode, setViewMode, searchQuery, setSearchQuery, isSidebarOpen, setSidebarOpen, theme, toggleTheme } = useAppStore();
  const queryClient = useQueryClient();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [matchFolder, params] = useRoute("/folder/:id");
  const currentFolderId = matchFolder ? params?.id : undefined;
  const { uploadFiles } = useFileUpload(currentFolderId);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    queryClient.clear();
    onLogout();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    await uploadFiles(acceptedFiles);
  }, [uploadFiles]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop, noClick: true, noKeyboard: true
  });

  return (
    <>
      <header className="h-20 shrink-0 px-6 flex items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">

        <div className="flex items-center gap-4 flex-1">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-11 pr-4 py-2.5 bg-secondary/50 hover:bg-secondary border border-transparent focus:border-primary/50 focus:bg-secondary rounded-xl text-sm outline-none transition-all placeholder:text-muted-foreground text-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">

          {/* Dark / Light toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          {/* Grid / List toggle */}
          <div className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border hidden sm:flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          {/* Upload button + dropzone */}
          <div {...getRootProps()} className="relative">
            <input {...getInputProps()} />
            <button
              onClick={open}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                isDragActive
                  ? "bg-primary text-primary-foreground scale-105 shadow-primary/40 ring-4 ring-primary/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5"
              }`}
            >
              <UploadCloud className="w-5 h-5" />
              <span className="hidden sm:inline">{isDragActive ? "Drop files!" : "Upload"}</span>
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-border transition-all group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block max-w-[120px] truncate">
                  {currentUser.username}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card border-border">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm font-semibold text-foreground truncate">{currentUser.username}</p>
              </div>
              <DropdownMenuItem onClick={() => setChangePasswordOpen(true)} className="cursor-pointer focus:bg-black/5 dark:focus:bg-white/5 text-muted-foreground focus:text-foreground gap-2">
                <KeyRound className="w-4 h-4" /> Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer focus:bg-red-500/10 text-red-500 focus:text-red-600 dark:focus:text-red-400 gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </>
  );
}
