import { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, FolderKanban, ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  useEffect(() => {
    loadProjects();
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [user?.role]);

  const loadProjects = async () => {
    try {
      const data = await api.projects.list();
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.users.list();
      setAllUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSelectedMember = (memberId: string) => {
    setSelectedMembers((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.projects.create({ ...newProject, members: selectedMembers });
      toast.success("Project archive initialized");
      setIsCreateOpen(false);
      setNewProject({ name: "", description: "" });
      setSelectedMembers([]);
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2 text-white">Current Projects</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium">Manage your team's workspace and members</p>
        </div>
        
        {user?.role === "admin" && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
             <DialogTrigger render={
              <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest px-8 h-12 shadow-[0_0_20px_rgba(79,70,229,0.2)] transition-all">
                <Plus className="w-5 h-5 mr-2" />
                Create Project
              </Button>
            } />
            <DialogContent className="rounded-3xl bg-[#18181b] border-zinc-800 text-white p-8 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">New Project Setup</DialogTitle>
                <DialogDescription className="text-zinc-500 text-xs uppercase tracking-widest">Define your project goals and scope</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Project Name</Label>
                  <Input 
                    value={newProject.name} 
                    onChange={e => setNewProject({...newProject, name: e.target.value})} 
                    className="rounded-xl border-zinc-800 bg-zinc-900/50 focus-visible:ring-indigo-500 h-12"
                    placeholder="e.g. Website Overhaul"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Project Description</Label>
                  <textarea 
                    value={newProject.description} 
                    onChange={e => setNewProject({...newProject, description: e.target.value})} 
                    className="w-full h-24 p-3 border border-zinc-800 bg-zinc-900/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="What is this project about?"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Select Members</Label>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {allUsers.filter((member) => member._id !== user?.id).map((member) => {
                      const isSelected = selectedMembers.includes(member._id);

                      return (
                        <button
                          key={member._id}
                          type="button"
                          onClick={() => toggleSelectedMember(member._id)}
                          className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-500/10"
                              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-bold text-white">{member.name}</span>
                            <span className="block text-[10px] text-zinc-500">{member.email}</span>
                          </span>
                          <span className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
                            isSelected ? "border-indigo-500 bg-indigo-600 text-white" : "border-zinc-700 text-transparent"
                          }`}>
                            <Check className="h-4 w-4" />
                          </span>
                        </button>
                      );
                    })}
                    {allUsers.filter((member) => member._id !== user?.id).length === 0 && (
                      <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-5 text-center text-[10px] uppercase tracking-widest text-zinc-600">
                        No members available yet
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all">
                    Create Project
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={project._id}
          >
            <Link to={`/projects/${project._id}`} className="group block h-full">
              <div className="h-full p-8 bg-[#18181b] border border-[#27272a] rounded-2xl group-hover:border-indigo-500/50 transition-all flex flex-col relative overflow-hidden group">
                 {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-indigo-600/5 rounded-full group-hover:bg-indigo-600/10 transition-colors" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-indigo-400">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">ID: {project._id.slice(-6)}</span>
                </div>

                <h3 className="text-xl font-bold mb-3 text-white transition-transform group-hover:translate-x-1">{project.name}</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed mb-8 flex-1 line-clamp-3">
                  {project.description}
                </p>

                <div className="mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(3, (project.members?.length || 0) + 1) }).map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#18181b] flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                        {i === 0 ? "AR" : "JD"}
                      </div>
                    ))}
                    {(project.members?.length || 0) > 2 && (
                       <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#18181b] flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                         +{(project.members?.length || 0) - 1}
                       </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 group-hover:text-indigo-400 transition-colors">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">View Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-24 text-center border border-dashed border-zinc-800 rounded-3xl opacity-50">
             <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                <FolderKanban className="w-8 h-8 text-zinc-600" />
             </div>
             <p className="text-xl font-bold text-white">No active projects.</p>
             <p className="text-xs uppercase tracking-widest text-zinc-500 mt-2">Start by creating your first project</p>
          </div>
        )}
      </div>
    </div>
  );
}
