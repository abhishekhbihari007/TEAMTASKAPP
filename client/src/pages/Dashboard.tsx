import { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { motion } from "motion/react";
import { LayoutDashboard, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, overdue: 0 });
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", dueDate: "", assignee: "", project: "" });

  useEffect(() => {
    loadDashboard();
    if (user?.role === "admin") {
      loadProjects();
      loadUsers();
    }
  }, []);

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
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadDashboard = async () => {
    try {
      const response = await api.tasks.dashboard();
      const dashboardTasks = Array.isArray(response) ? response : response.tasks;
      const dashboardStats = Array.isArray(response) ? null : response.stats;

      setTasks(dashboardTasks);
      
      if (dashboardStats) {
        setStats({
          total: dashboardStats.total,
          pending: dashboardStats.todo + dashboardStats.inProgress,
          completed: dashboardStats.done,
          overdue: dashboardStats.overdue
        });
      } else {
        const counts = dashboardTasks.reduce((acc: any, task: any) => {
          acc.total++;
          if (task.status === 'completed') acc.completed++;
          else if (task.dueDate && new Date(task.dueDate) < new Date()) acc.overdue++;
          else acc.pending++;
          return acc;
        }, { total: 0, pending: 0, completed: 0, overdue: 0 });
        setStats(counts);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.project) {
      toast.error("Please select a project");
      return;
    }
    try {
      await api.tasks.create({ 
        ...newTask, 
        assignee: newTask.assignee || user?.id 
      });
      toast.success("Task created and assigned");
      setIsAddTaskOpen(false);
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignee: "", project: "" });
      loadDashboard();
    } catch (error: any) {
      toast.error(error.message || "Failed to create task");
    }
  };

  const handleToggleTask = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
      await api.tasks.update(id, { status: newStatus });
      loadDashboard();
      toast.success("Assignment updated");
    } catch (error) {
       console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Top Header with Add Task */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">Real-time task tracking</p>
        </div>
        
        {user?.role === "admin" && (
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger render={
              <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-xl px-6 h-11 text-xs font-bold uppercase tracking-widest gap-2 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                <Plus className="w-4 h-4" />
                Quick Assign
              </Button>
            } />
            <DialogContent className="rounded-3xl bg-[#18181b] border-zinc-800 text-white p-8 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Direct Task Assignment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-zinc-500">Task Title</Label>
                  <Input 
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})} 
                    className="rounded-xl border-zinc-800 bg-zinc-900/50 focus-visible:ring-indigo-500 h-12"
                    placeholder="e.g. Update Security Patch"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Select Project</Label>
                    <select 
                      value={newTask.project} 
                      onChange={e => setNewTask({...newTask, project: e.target.value})}
                      className="w-full h-11 px-3 border border-zinc-800 bg-zinc-900/50 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Assign To</Label>
                    <select 
                      value={newTask.assignee} 
                      onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                      className="w-full h-11 px-3 border border-zinc-800 bg-zinc-900/50 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select User</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Priority</Label>
                    <select 
                      value={newTask.priority} 
                      onChange={e => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full h-11 px-3 border border-zinc-800 bg-zinc-900/50 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-zinc-500">Due Date</Label>
                    <Input 
                      type="date"
                      value={newTask.dueDate} 
                      onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                      className="rounded-xl border-zinc-800 bg-zinc-900/50 focus-visible:ring-indigo-500 h-11 text-xs"
                      required
                    />
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold uppercase tracking-widest transition-all">
                    Assign Task
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Summary Cards */}
        <section className="col-span-12 md:col-span-4 bg-[#18181b] border border-[#27272a] rounded-2xl p-5 group hover:border-indigo-500/50 transition-colors">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Total Tasks</h3>
          <p className="text-4xl font-bold text-white mb-1 font-mono">{stats.total}</p>
          <p className="text-[10px] text-zinc-500 italic">Across all active projects</p>
        </section>

        <section className="col-span-12 md:col-span-4 bg-[#18181b] border border-[#27272a] rounded-2xl p-5 group hover:border-emerald-500/50 transition-colors">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Completed</h3>
          <p className="text-4xl font-bold text-emerald-400 mb-1 font-mono">{stats.completed}</p>
          <p className="text-[10px] text-zinc-500 italic">Success rate: {stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%</p>
        </section>

        <section className="col-span-12 md:col-span-4 bg-[#18181b] border border-[#27272a] rounded-2xl p-5 group hover:border-red-500/50 transition-colors">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Overdue</h3>
          <p className="text-4xl font-bold text-red-400 mb-1 font-mono">{stats.overdue}</p>
          <p className="text-[10px] text-zinc-500 italic">Tasks past their deadline</p>
        </section>

        {/* Task List Bento */}
        <section className="col-span-12 md:col-span-8 bg-[#18181b] border border-[#27272a] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">Recent Tasks</h3>
          </div>
          <div className="flex-1 overflow-auto p-2 scrollbar-thin scrollbar-thumb-zinc-800">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Assignee</th>
                  <th className="px-4 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-zinc-500 opacity-50 italic">
                      No active tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                           <Checkbox 
                            checked={task.status === 'completed'} 
                            onCheckedChange={() => handleToggleTask(task._id, task.status)}
                            className="border-zinc-700 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                          />
                          <span className={`font-medium ${task.status === 'completed' ? 'line-through text-zinc-500' : ''}`}>{task.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-400 capitalize">{task.project?.name || "General"}</td>
                      <td className="px-4 py-4 text-xs text-zinc-400">
                        {task.assignee?.name || "Unassigned"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                          task.status === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : task.status === 'in-progress'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Priorities Bento */}
        <section className="col-span-12 md:col-span-4 bg-[#18181b] border border-[#27272a] rounded-2xl p-5 flex flex-col group hover:border-indigo-500/50 transition-colors">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">High Priority</h3>
          <div className="space-y-3 flex-1 overflow-auto pr-1 scrollbar-thin">
            {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').slice(0, 5).map(task => (
              <div key={task._id} className="flex items-center gap-3 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800">
                <div className="w-1 h-6 bg-red-500 rounded-full shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate text-white">{task.title}</p>
                  <p className="text-[9px] uppercase font-mono text-zinc-500">{task.project?.name || "General"}</p>
                </div>
              </div>
            ))}
            {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length === 0 && (
              <p className="text-[10px] text-zinc-600 italic">No high priority blockers.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
