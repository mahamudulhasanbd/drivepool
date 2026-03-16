import React, { useState } from "react";
import { Link, useRoute } from "wouter";
import { 
  Cloud, Folder as FolderIcon, Image as ImageIcon, Video, Music,
  FileText, Archive, Plus, Trash2, MoreVertical, User, LogOut,
  KeyRound, Star, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { useListFolders, useDeleteFolder, getListFoldersQueryKey, type Folder } from "@workspace/api-client-react";
import { CreateFolderDialog } from "@/components/modals/create-folder-dialog";
import { ChangePasswordDialog } from "@/components/modals/change-password-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  folder?: Folder;
  onClick?: () => void;
  className?: string;
}

function NavItem({ href, icon: Icon, label, isActive, folder, onClick, className }: NavItemProps) {
  const queryClient = useQueryClient();
  const deleteFolder = useDeleteFolder();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!folder) return;
    if (confirm(`Delete folder '${folder.name}'? Files will NOT be deleted, they will move to Root.`)) {
      await deleteFolder.mutateAsync({ id: folder.id });
      queryClient.invalidateQueries({ queryKey: getListFoldersQueryKey() });
    }
  };

  return (
    <Link href={href} onClick={onClick} className={cn("group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all", className)}>
      <div className={cn(
        "absolute inset-x-4 h-10 rounded-xl transition-all -z-10",
        isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"
      )} />
      <div className="flex items-center gap-3 relative z-10">
        <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
        <span className={cn("font-medium text-sm transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
          {label}
        </span>
      </div>

      {folder && (
        <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" onClick={(e) => e.preventDefault()}>
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </Link>
  );
}

interface SidebarProps {
  currentUser: { id: string; username: string };
  onLogout: () => void;
}

export function Sidebar({ currentUser, onLogout }: SidebarProps) {
  const { isSidebarOpen, setSidebarOpen } = useAppStore();
  const queryClient = useQueryClient();
  const [matchRoot] = useRoute("/");
  const [matchStarred] = useRoute("/starred");
  const [matchTrash] = useRoute("/trash");
  const [matchType, paramsType] = useRoute("/type/:type");
  const [matchFolder, paramsFolder] = useRoute("/folder/:id");

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const { data: folders } = useListFolders();

  const getTypeRoute = (type: string) => `/type/${type}`;
  const getFolderRoute = (id: string) => `/folder/${id}`;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    queryClient.clear();
    onLogout();
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card/95 backdrop-blur-xl border-r border-border w-64 md:w-full md:bg-transparent md:backdrop-blur-none">

      {/* Mobile close button */}
      <button
        onClick={() => setSidebarOpen(false)}
        className="md:hidden absolute top-6 right-4 p-2 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">Drivepool</span>
        </div>
      </div>

      {/* Scrollable Nav */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">

        {/* Main links */}
        <div className="space-y-1 relative">
          <NavItem href="/" icon={Cloud} label="All Files" isActive={matchRoot} onClick={closeSidebarOnMobile} />
          <NavItem href="/starred" icon={Star} label="Starred" isActive={matchStarred} onClick={closeSidebarOnMobile} />
        </div>

        {/* Categories */}
        <div>
          <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</h4>
          <div className="space-y-1 relative">
            <NavItem href={getTypeRoute('image')}    icon={ImageIcon} label="Images"    isActive={matchType && paramsType?.type === 'image'}    onClick={closeSidebarOnMobile} />
            <NavItem href={getTypeRoute('video')}    icon={Video}     label="Videos"    isActive={matchType && paramsType?.type === 'video'}    onClick={closeSidebarOnMobile} />
            <NavItem href={getTypeRoute('document')} icon={FileText}  label="Documents" isActive={matchType && paramsType?.type === 'document'} onClick={closeSidebarOnMobile} />
            <NavItem href={getTypeRoute('audio')}    icon={Music}     label="Audio"     isActive={matchType && paramsType?.type === 'audio'}    onClick={closeSidebarOnMobile} />
            <NavItem href={getTypeRoute('archive')}  icon={Archive}   label="Archives"  isActive={matchType && paramsType?.type === 'archive'}  onClick={closeSidebarOnMobile} />
          </div>
        </div>

        {/* Folders */}
        <div>
          <div className="flex items-center justify-between px-3 mb-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</h4>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 relative">
            {folders?.map((folder) => (
              <NavItem
                key={folder.id}
                href={getFolderRoute(folder.id)}
                icon={FolderIcon}
                label={folder.name}
                isActive={matchFolder && paramsFolder?.id === folder.id}
                folder={folder}
                onClick={closeSidebarOnMobile}
              />
            ))}
            {folders?.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground/60 italic">No folders yet</div>
            )}
          </div>
        </div>

        {/* Trash */}
        <div className="space-y-1 relative pt-4 border-t border-border/50">
          <NavItem
            href="/trash"
            icon={Trash2}
            label="Trash"
            isActive={matchTrash}
            onClick={closeSidebarOnMobile}
            className="text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
          />
        </div>
      </div>

      {/* User Footer */}
      <div className="shrink-0 border-t border-border/50 p-4 bg-background/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-md shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{currentUser.username}</p>
                <p className="text-xs text-muted-foreground">Personal account</p>
              </div>
              <MoreVertical className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52 bg-card border-border mb-1">
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
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="w-64 shrink-0 h-screen sticky top-0 bg-card/50 flex-col hidden md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CreateFolderDialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen} />
      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </>
  );
          }
