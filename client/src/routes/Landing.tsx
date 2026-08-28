import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Database, LayoutDashboard, Globe } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-brand-500/30 overflow-x-hidden">
      
      {/* Abstract Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">SyncBoard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link to="/register" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <Zap size={14} className="text-brand-400" />
          <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">SyncBoard 2.0 is live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Sync your team,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-brand-400 animate-gradient-x">
            at the speed of thought.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          The ultra-scalable, real-time Kanban workspace engineered for high-performance teams. 
          Experience zero-lag dragging, live multiplayer presence, and enterprise-grade security.
        </p>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/register" 
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]"
          >
            Start building for free
            <ArrowRight size={20} />
          </Link>
        </div>
      </main>

      {/* Product Image / Mockup */}
      <div className="relative max-w-6xl mx-auto px-6 mb-32 z-10">
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl p-2 shadow-2xl">
          <div className="aspect-[16/9] w-full rounded-xl border border-white/5 bg-[#111] relative overflow-hidden flex items-center justify-center group">
             {/* Decorative UI elements inside the mockup */}
             <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5"></div>
             
             {/* Board Grid Mockup */}
             <div className="w-full h-full p-8 flex gap-6 opacity-80 transition-transform group-hover:scale-[1.02] duration-700">
               {[1, 2, 3].map((col) => (
                 <div key={col} className="w-1/3 h-full bg-white/5 rounded-xl border border-white/5 p-4 space-y-4">
                   <div className="w-24 h-4 bg-white/10 rounded-md"></div>
                   <div className="w-full h-24 bg-white/10 rounded-lg shadow-sm"></div>
                   <div className="w-full h-32 bg-white/10 rounded-lg shadow-sm"></div>
                   {col === 2 && <div className="w-full h-20 bg-brand-500/20 border border-brand-500/30 rounded-lg shadow-sm"></div>}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-32 z-10 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Engineered for Scale</h2>
          <p className="text-gray-400">Everything you need to manage projects without the database bottlenecks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl hover:bg-white/[0.05] transition-colors">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Live Multiplayer</h3>
            <p className="text-gray-400 leading-relaxed">
              Powered by Redis Pub/Sub and optimized WebSockets. See your teammates' cursors and actions instantly across the globe.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl hover:bg-white/[0.05] transition-colors">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Fractional Indexing</h3>
            <p className="text-gray-400 leading-relaxed">
              Drag and drop thousands of cards without cascading database rewrites. O(1) time complexity for reordering.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl hover:bg-white/[0.05] transition-colors">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
            <p className="text-gray-400 leading-relaxed">
              Battle-hardened against IDOR, NoSQL injections, and strictly enforces Role-Based Access Control (RBAC) at the WebSocket level.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} SyncBoard. Built for modern teams.</p>
      </footer>
      
    </div>
  );
}
