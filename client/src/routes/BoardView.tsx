/**
 * Board View — Kanban board rendering lists and cards.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { fetchBoard, createList, createCard, clearActiveBoard } from '../store/slices/boardSlice';
import Navbar from '../components/layout/Navbar';
import { joinBoardRoom, leaveBoardRoom } from '../lib/socket';

export default function BoardView() {
  const { boardId } = useParams<{ boardId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { activeBoard, isLoading, error } = useAppSelector((state) => state.board);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  
  const [addingCardToList, setAddingCardToList] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
      joinBoardRoom(boardId);
    }
    return () => {
      dispatch(clearActiveBoard());
      if (boardId) {
        leaveBoardRoom(boardId);
      }
    };
  }, [dispatch, boardId]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !boardId) return;
    
    await dispatch(createList({ boardId, title: newListTitle }));
    setNewListTitle('');
    setIsAddingList(false);
  };

  const handleCreateCard = async (e: React.FormEvent, listId: string) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !boardId) return;
    
    await dispatch(createCard({ boardId, listId, title: newCardTitle }));
    setNewCardTitle('');
    setAddingCardToList(null);
  };

  if (isLoading && !activeBoard) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error || !activeBoard) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-red-500 mb-4">{error || 'Board not found'}</p>
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Navbar />
      
      {/* Board Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 flex items-center">
        <button 
          onClick={() => navigate(`/w/${activeBoard.workspaceId}`)} 
          className="text-gray-500 hover:text-gray-700 mr-4"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{activeBoard.title}</h1>
      </div>

      {/* Kanban Canvas */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex items-start space-x-6">
        
        {/* Render Lists */}
        {activeBoard.lists?.map((list) => (
          <div key={list._id} className="w-80 bg-gray-100 rounded-xl flex flex-col flex-shrink-0 max-h-full">
            <div className="p-4 flex-shrink-0">
              <h3 className="font-semibold text-gray-900">{list.title}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
              {list.cards?.map((card) => (
                <div key={card._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-900">{card.title}</p>
                </div>
              ))}
              
              {/* Add Card Input */}
              {addingCardToList === list._id ? (
                <form onSubmit={(e) => handleCreateCard(e, list._id)} className="mt-3">
                  <textarea
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="Enter card title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    rows={3}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCreateCard(e as any, list._id);
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      Add Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingCardToList(null)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setAddingCardToList(list._id);
                    setNewCardTitle('');
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors flex items-center"
                >
                  <span className="mr-1 text-lg">+</span> Add a card
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add List Column */}
        <div className="w-80 flex-shrink-0">
          {isAddingList ? (
            <div className="bg-gray-100 p-4 rounded-xl">
              <form onSubmit={handleCreateList}>
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Enter list title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                  >
                    Add List
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingList(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingList(true)}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium p-4 rounded-xl transition-colors text-left flex items-center"
            >
              <span className="mr-2 text-xl">+</span> Add another list
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
