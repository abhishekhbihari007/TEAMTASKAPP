import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/src/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({ name, email, password });
      toast.success("Account requested successfully. You can now login.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-[#09090b]">
      <div className="hidden lg:flex flex-col justify-between w-1/3 p-16 bg-[#18181b] border-r border-[#27272a] relative">
         <div>
          <h1 className="text-4xl font-bold tracking-tighter leading-none mb-12 text-white">TEAM<span className="text-indigo-500">TASK</span></h1>
          <div className="relative z-10 hidden lg:block">
            {/* Onboarding protocol removed */}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#09090b]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10 text-center">
             <h2 className="text-3xl font-bold mb-2 text-white">Enter Details</h2>
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Kindly join our roster</p>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-[2.5rem] p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Your Good Name</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="rounded-2xl border-zinc-800 bg-zinc-900 focus-visible:ring-indigo-500 h-11 text-white"
                  placeholder="Type your name"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Email Detail</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="rounded-2xl border-zinc-800 bg-zinc-900 focus-visible:ring-indigo-500 h-11 text-white"
                  placeholder="Type your email"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Secure Key</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="rounded-2xl border-zinc-800 bg-zinc-900 focus-visible:ring-indigo-500 h-11 text-white"
                  required 
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl group transition-all mt-4 font-bold"
                disabled={isLoading}
              >
                <span className="text-[10px] uppercase tracking-[0.2em]">{isLoading ? "Processing..." : "Sign Up"}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <p className="mt-8 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Already registered? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Login</Link>
            </p>
          </div>
          <p className="mt-12 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Developed and Designed by Abhishekh Bihari</p>
        </motion.div>
      </div>
    </div>
  );
}
