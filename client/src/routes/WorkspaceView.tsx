/**
 * Workspace View — Board list for a specific workspace.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { fetchWorkspaceBoards, createBoard } from '../store/slices/boardSlice';
import Navbar from '../components/layout/Navbar';
import { Plus, LayoutDashboard, ChevronRight, LayoutTemplate } from 'lucide-react';

export default function WorkspaceView() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const dispatch = useAppDispatch();
  
  const { boards, isLoading } = useAppSelector((state) => state.board);
  const { workspaces } = useAppSelector((state) => state.workspace);
  
  const workspace = workspaces.find((w) => w._id === workspaceId);

  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspaceBoards(workspaceId));
    }
  }, [dispatch, workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !workspaceId) return;
    
    await dispatch(createBoard({ workspaceId, title: newBoardTitle }));
    setNewBoardTitle('');
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm font-medium text-gray-500 mb-6">
            <Link to="/" className="hover:text-gray-900 transition-colors">Workspaces</Link>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="text-gray-900">{workspace ? workspace.name : 'Workspace'}</span>
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center">
                  <LayoutDashboard size={20} />
                </div>
                {workspace ? workspace.name : 'Workspace'}
              </h1>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-black transition-all active:scale-95 shadow-sm"
            >
              <Plus size={18} className="transition-transform group-hover:rotate-90" />
              New Board
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Create Form inline transition */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isCreating ? 'max-h-64 opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="p-1">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm ring-1 ring-gray-900/5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create a new board</h3>
              <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="e.g. Q3 Roadmap, Product Backlog, Design Sprint..."
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[4/3] bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between animate-pulse">
                <div className="w-3/4 h-6 bg-gray-200 rounded-md"></div>
                <div className="w-1/2 h-4 bg-gray-100 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6">
              <LayoutTemplate size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">This workspace is empty</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Boards contain lists and cards to organize your projects. Create one to get started.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-black transition-colors"
            >
              Create Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board._id}
                to={`/b/${board._id}`}
                className="group relative flex flex-col justify-between aspect-[4/3] p-6 bg-white rounded-2xl border border-gray-200/75 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Abstract Kanban visual background */}
                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {/* Gradient Accent */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-200 group-hover:bg-gradient-to-r group-hover:from-brand-500 group-hover:to-indigo-500 transition-all duration-300"></div>

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors tracking-tight line-clamp-2 mb-2">
                    {board.title}
                  </h3>
                </div>
                
                <div className="relative z-10 flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-brand-500 transition-colors">
                    View Board
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <ChevronRight size={16} />
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
