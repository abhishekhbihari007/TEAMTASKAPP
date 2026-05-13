import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/src/lib/api";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ChevronLeft, MoreHorizontal, Calendar, User, Clock } from "lucide-react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [project, setProject] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", dueDate: "", assignee: "" });

  useEffect(() => {
    loadProject();
    loadTasks();
    if (user?.role === "admin") {
      loadUsers();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await api.projects.get(id!);
      setProject(data);
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

  const loadTasks = async () => {
    try {
      const data = await api.tasks.listByProject(id!);
      setTasks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.tasks.create({ ...newTask, project: id, assignee: newTask.assignee || user?.id });
      toast.success("Task created successfully");
      setIsCreateTaskOpen(false);
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignee: "" });
      loadTasks();
    } catch (error: any) {
      toast.error(error.message || "Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.tasks.update(taskId, { status });
      loadTasks();
      toast.success(`Task status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const toggleMember = async (userId: string) => {
    try {
      const currentMembers = project.members.map((m: any) => m._id);
      const isMember = currentMembers.includes(userId);
      
      const newMembers = isMember 
        ? currentMembers.filter((m: string) => m !== userId)
        : [...currentMembers, userId];

      const updated = await api.projects.update(id!, { members: newMembers });
      setProject(updated);
      toast.success(isMember ? "Member removed" : "Member added");
    } catch (error) {
      toast.error("Failed to update members");
    }
  };

  const filteredTasks = filter === 'mine' 
    ? tasks.filter(t => t.assignee?._id === user?.id) 
    : tasks;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 h-full flex flex-col">
      <header className="flex flex-col gap-4">
        <Link to="/projects" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-indigo-400 transition-colors w-fit">
          <ChevronLeft className="w-3 h-3" />
          Back to Projects
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 bg-[#18181b] border border-[#27272a] rounded-3xl p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">{project?.name || "Project Tasks"}</h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Project ID: {id?.slice(-8)}</p>
          </div>

          <div className="md:col-span-4 bg-[#18181b] border border-[#27272a] rounded-3xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Project Team</h3>
              {user?.role === "admin" && (
                <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
                  <DialogTrigger render={<Button variant="ghost" size="sm" className="h-6 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg">Manage</Button>} />
                  <DialogContent className="rounded-3xl bg-[#18181b] border-zinc-800 text-white p-8 max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Project Roster</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4 max-h-[400px] overflow-auto pr-2 scrollbar-thin">
                      {project && allUsers.filter(u => u._id !== project.owner?._id).map(u => {
                        const isMember = project.members?.some((m: any) => m._id === u._id);
                        return (
                          <div key={u._id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                            <div>
                              <p className="text-sm font-bold">{u.name}</p>
                              <p className="text-[10px] text-zinc-500">{u.email}</p>
                            </div>
                            <Button 
                              variant={isMember ? "destructive" : "default"} 
                              size="sm" 
                              onClick={() => toggleMember(u._id)}
                              className={`rounded-xl px-4 h-9 text-[10px] font-bold uppercase tracking-widest ${!isMember ? 'bg-indigo-600 hover:bg-indigo-500' : ''}`}
                            >
                              {isMember ? "Remove" : "Assign"}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <div className="flex -space-x-2 overflow-hidden">
               {project?.members?.map((m: any) => (
                 <div key={m._id} className="inline-block h-8 w-8 rounded-full ring-2 ring-[#18181b] bg-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-300" title={m.name}>
                   {m.name.charAt(0)}
                 </div>
               ))}
               {!project?.members?.length && <p className="text-[10px] text-zinc-600 italic">No assigned members</p>}
            </div>
          </div>
          
          <div className="md:col-span-4 bg-indigo-600 rounded-3xl p-8 flex items-center justify-between group cursor-pointer hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.1)]">
             <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
              <DialogTrigger nativeButton={false} render={
                <div className="flex items-center justify-between w-full h-full">
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Add Task</p>
                    <p className="text-xs text-indigo-100/70 capitalize">Create new assignment</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </div>
              } />
              <DialogContent className="rounded-3xl bg-[#18181b] border-zinc-800 text-white p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white">Create New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Task Title</Label>
                    <Input 
                      value={newTask.title} 
                      onChange={e => setNewTask({...newTask, title: e.target.value})} 
                      className="rounded-xl border-zinc-800 bg-zinc-900/50 focus-visible:ring-indigo-500 h-12"
                      placeholder="e.g. Design Landing Page"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Description</Label>
                    <textarea 
                      value={newTask.description} 
                      onChange={e => setNewTask({...newTask, description: e.target.value})} 
                      className="w-full h-24 p-3 border border-zinc-800 bg-zinc-900/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Details..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-zinc-500">Priority</Label>
                      <select 
                        value={newTask.priority} 
                        onChange={e => setNewTask({...newTask, priority: e.target.value})}
                        className="w-full h-11 px-3 border border-zinc-800 bg-zinc-900/50 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-zinc-500">Target Date</Label>
                      <Input 
                        type="date"
                        value={newTask.dueDate} 
                        onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                        className="rounded-xl border-zinc-800 bg-zinc-900/50 focus-visible:ring-indigo-500 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Assignee</Label>
                    <select 
                      value={newTask.assignee} 
                      onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                      className="w-full h-11 px-3 border border-zinc-800 bg-zinc-900/50 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select Assignee (Default: You)</option>
                      {project?.members?.map((m: any) => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                      {project?.owner && <option value={project.owner._id}>{project.owner.name} (Owner)</option>}
                    </select>
                  </div>

                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold uppercase tracking-widest transition-all">
                      Create Task
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

    <div className="flex-1 bg-[#18181b] border border-[#27272a] rounded-3xl overflow-hidden flex flex-col mb-4">
        <div className="flex items-center justify-between px-5 pt-4 bg-zinc-900/50">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFilter('all')}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 h-8 rounded-lg transition-all ${filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
            >
              All Tasks
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFilter('mine')}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 h-8 rounded-lg transition-all ${filter === 'mine' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
            >
              My Tasks
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-12 bg-zinc-900/50 text-zinc-500 font-bold text-[10px] uppercase tracking-widest p-5 border-b border-zinc-800">
          <div className="col-span-4 px-2">Task Description</div>
          <div className="col-span-2 px-2 text-center">Assignee</div>
          <div className="col-span-2 px-2 text-center">Priority</div>
          <div className="col-span-2 px-2 text-center">Status</div>
          <div className="col-span-2 px-2 text-right">Due Date</div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-zinc-800">
          {filteredTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-20">
               <div className="p-6 bg-zinc-900 rounded-full mb-4">
                  <Clock className="w-12 h-12 text-zinc-500" />
               </div>
               <p className="font-bold text-xl text-white">No tasks found.</p>
               <p className="text-xs uppercase mt-2 tracking-widest text-zinc-600">{filter === 'mine' ? "You have no assignments here" : "Start by creating your first task above"}</p>
            </div>
          ) : (
            filteredTasks.map((task, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={task._id} 
                className="grid grid-cols-12 border-b border-zinc-800/40 p-5 items-center hover:bg-zinc-800/40 transition-colors group"
              >
                <div className="col-span-4 px-2">
                  <h4 className="font-bold text-sm text-white mb-0.5">{task.title}</h4>
                  <p className="text-[10px] uppercase text-zinc-600 font-bold tracking-tight line-clamp-1">{task.description}</p>
                </div>

                <div className="col-span-2 px-2 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400 border border-zinc-700">
                      {task.assignee?.name?.charAt(0) || "?"}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 truncate max-w-[80px]">
                      {task.assignee?.name || "Unassigned"}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-2 px-2 flex items-center justify-center">
                  <div className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    task.priority === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                    task.priority === 'medium' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 
                    'bg-zinc-800 border-zinc-700 text-zinc-500'
                  }`}>
                    {task.priority}
                  </div>
                </div>

                  <div className="col-span-2 px-2 flex items-center justify-center">
                   <select 
                    value={task.status} 
                    onChange={e => updateTaskStatus(task._id, e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-bold uppercase text-zinc-400 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-zinc-800 transition-colors"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="col-span-2 px-2 flex items-center justify-end text-zinc-500 text-[10px] font-bold">
                  {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "OPEN"}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-zinc-800 flex justify-between items-center bg-zinc-900/20 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
           <div className="flex gap-4">
              <span>Total Tasks: <span className="text-indigo-500">{tasks.length}</span></span>
              <span>Completed: <span className="text-emerald-500">{tasks.filter(t => t.status === 'completed').length}</span></span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Live Project Feed
           </div>
        </div>
      </div>
    </div>
  );
}
