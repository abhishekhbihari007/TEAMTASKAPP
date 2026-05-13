import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderKanban },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans p-4 lg:p-6 flex flex-col gap-4">
      {/* Top Header - Bento Card Style */}
      <header className="flex items-center justify-between bg-[#18181b] border border-[#27272a] rounded-2xl px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Team<span className="text-indigo-400">Task</span></h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-6">
          <nav className="flex gap-4 text-sm font-medium text-zinc-400">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                to={item.href}
                className={`hover:text-white transition-colors pb-1 ${
                  location.pathname === item.href ? 'text-white border-b-2 border-indigo-500' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="h-6 w-[1px] bg-zinc-800"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-white">{user?.name}</p>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest">{user?.role}</p>
            </div>
            <button 
              onClick={logout}
              className="w-9 h-9 bg-zinc-800 rounded-full border border-zinc-600 flex items-center justify-center text-xs hover:bg-zinc-700 transition-colors"
            >
              <LogOut className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6 text-zinc-400" />
        </Button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#09090b]/95 backdrop-blur-sm lg:hidden p-6"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <h1 className="text-2xl font-bold tracking-tight">Team<span className="text-indigo-400">Task</span></h1>
                  <Button variant="ghost" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-8 h-8 text-zinc-400" />
                  </Button>
                </div>
                <nav className="space-y-8">
                   {navItems.map((item) => (
                    <Link key={item.href} to={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center gap-6 group">
                        <item.icon className="w-8 h-8 text-indigo-500" />
                        <span className="text-3xl font-medium">{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto pt-12 border-t border-zinc-800">
                  <Button variant="outline" className="w-full border-zinc-700 text-zinc-400" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area - Responsive Bento Container */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
