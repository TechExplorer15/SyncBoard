/**
 * Dashboard — Workspace list.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { fetchWorkspaces, createWorkspace } from '../store/slices/workspaceSlice';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../hooks/useAuth';
import { Plus, Users, Layout, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { workspaces, isLoading } = useAppSelector((state) => state.workspace);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    await dispatch(createWorkspace({ name: newWorkspaceName }));
    setNewWorkspaceName('');
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Welcome back, {user?.name.split(' ')[0] || 'there'}.
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl">
            Here's what's happening across your workspaces. Jump back in or create a new space to collaborate with your team.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Workspaces</h2>
          </div>
          
          <button
            onClick={() => setIsCreating(true)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-black transition-all active:scale-95 shadow-sm"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            New Workspace
          </button>
        </div>

        {/* Create Form inline transition */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isCreating ? 'max-h-64 opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="p-1">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm ring-1 ring-gray-900/5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create a new workspace</h3>
              <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Corp, Engineering, Marketing..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
                  autoFocus={isCreating}
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between animate-pulse">
                <div className="w-1/2 h-6 bg-gray-200 rounded-md"></div>
                <div className="w-1/4 h-4 bg-gray-100 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6">
              <Layout size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No workspaces yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Workspaces are where your team collaborates on boards. Create your first workspace to get started.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-black transition-colors"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Link
                key={workspace._id}
                to={`/w/${workspace._id}`}
                className="group relative flex flex-col justify-between h-44 p-6 bg-white rounded-2xl border border-gray-200/75 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Decorative background gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors tracking-tight line-clamp-2">
                    {workspace.name}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    <Users size={16} className="mr-1.5 opacity-70" />
                    {workspace.members.length} member{workspace.members.length !== 1 ? 's' : ''}
                  </div>
                  
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
