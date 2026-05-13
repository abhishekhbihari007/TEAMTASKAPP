import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const adminCredentials = {
    email: "admin@task.io",
    password: "admin123",
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password, role });
      toast.success("Welcome to TeamTask");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[#09090b]">
      {/* Left Pane - Narrative/Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 bg-[#18181b] border-r border-[#27272a] relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-6xl font-bold tracking-tighter leading-none mb-6 text-white text-balance uppercase">TEAM<span className="text-indigo-500">TASK</span></h1>
          <p className="text-xl font-light text-zinc-400 max-w-md leading-relaxed">A full-stack project orchestration platform designed for team collaboration and task management.</p>
        </div>

        {/* Decorative elements - Bento Grid Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
           <div className="grid grid-cols-12 h-full gap-4 p-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="bg-zinc-100 rounded-3xl" />
            ))}
          </div>
        </div>

        <div className="relative z-10 hidden lg:block">
          {/* Footer content omitted per request */}
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#09090b]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10 text-center">
             <h2 className="text-3xl font-bold mb-2 text-white">Enter Details</h2>
             <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Kindly fill the following info</p>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-[2.5rem] p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Email or Name</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="rounded-2xl border-zinc-800 bg-zinc-900 focus-visible:ring-indigo-500 h-12 text-white"
                  placeholder="Enter your email"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Secret Password</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="rounded-2xl border-zinc-800 bg-zinc-900 focus-visible:ring-indigo-500 h-12 text-white"
                  placeholder="Enter password"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Login As</Label>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-900 p-1 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setRole("member");
                      if (email === adminCredentials.email && password === adminCredentials.password) {
                        setEmail("");
                        setPassword("");
                      }
                    }}
                    className={`h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      role === "member" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    Member
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRole("admin");
                      setEmail(adminCredentials.email);
                      setPassword(adminCredentials.password);
                    }}
                    className={`h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      role === "admin" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl group transition-all font-bold"
                disabled={isLoading}
              >
                <span className="text-xs uppercase tracking-[0.2em]">{isLoading ? "Verifying..." : "Initialize Session"}</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <p className="mt-8 text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              First mission here?
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign Up</Link>
            </p>
          </div>
          <p className="mt-12 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Developed and Designed by Abhishekh Bihari</p>
        </motion.div>
      </div>
    </div>
  );
}
