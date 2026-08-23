/**
 * Workspace View — Board list for a specific workspace.
 */
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { fetchWorkspaceBoards, createBoard } from '../store/slices/boardSlice';
import Navbar from '../components/layout/Navbar';

export default function WorkspaceView() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4 inline-block"
          >
            &larr; Back to Dashboard
          </button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {workspace ? workspace.name : 'Workspace'} Boards
            </h1>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Create Board
            </button>
          </div>
        </div>

        {isCreating && (
          <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Board</h2>
            <form onSubmit={handleCreate} className="flex gap-4">
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Board Title"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading boards...</p>
        ) : boards.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">No boards yet</h2>
            <p className="text-gray-500 text-sm mt-1">
              Create a board to start tracking your work.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {boards.map((board) => (
              <Link
                key={board._id}
                to={`/b/${board._id}`}
                className="block p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-between aspect-video"
              >
                <h3 className="text-xl font-semibold text-gray-900">{board.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
