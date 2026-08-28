/**
 * Board View — Kanban board rendering lists and cards.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { generateKeyBetween } from 'fractional-indexing';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { 
  fetchBoard, 
  createList, 
  createCard, 
  clearActiveBoard, 
  cardMoved,
  moveCardThunk,
  openCardModal
} from '../store/slices/boardSlice';
import Navbar from '../components/layout/Navbar';
import { AlignLeft } from 'lucide-react';
import CardModal from '../components/board/CardModal';
import { joinBoardRoom, leaveBoardRoom, sendHeartbeat } from '../lib/socket';

export default function BoardView() {
  const { boardId } = useParams<{ boardId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { activeBoard, activeUsers, isLoading, error } = useAppSelector((state) => state.board);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  
  const [addingCardToList, setAddingCardToList] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    
    if (boardId) {
      dispatch(fetchBoard(boardId));
      joinBoardRoom(boardId);
      
      // Start heartbeat for presence (reduced frequency to minimize Redis usage)
      intervalId = setInterval(() => {
        sendHeartbeat(boardId);
      }, 60000);
    }
    
    return () => {
      dispatch(clearActiveBoard());
      if (boardId) {
        leaveBoardRoom(boardId);
      }
      if (intervalId) {
        clearInterval(intervalId);
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

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || !activeBoard || !boardId) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceList = activeBoard.lists.find(l => l._id === source.droppableId);
    const targetList = activeBoard.lists.find(l => l._id === destination.droppableId);
    if (!sourceList || !targetList) return;

    const cardToMove = sourceList.cards.find(c => c._id === draggableId);
    if (!cardToMove) return;

    // Calculate new fractional-indexing order
    const targetCards = [...targetList.cards];
    if (source.droppableId === destination.droppableId) {
      targetCards.splice(source.index, 1);
    }
    
    const prevCard = destination.index > 0 ? targetCards[destination.index - 1] : null;
    const nextCard = destination.index < targetCards.length ? targetCards[destination.index] : null;

    const prevOrder = prevCard ? prevCard.order : null;
    const nextOrder = nextCard ? nextCard.order : null;

    let newOrder;
    try {
      newOrder = generateKeyBetween(prevOrder, nextOrder);
    } catch (e) {
      console.error('Failed to generate key', e);
      return;
    }

    // Optimistic UI Update (dispatches instantly)
    const optimisticCard = {
      ...cardToMove,
      listId: targetList._id,
      order: newOrder,
    };
    dispatch(cardMoved(optimisticCard));

    // Server API Call
    try {
      await dispatch(moveCardThunk({
        cardId: draggableId,
        targetListId: destination.droppableId,
        prevOrder,
        nextOrder,
      })).unwrap();
    } catch (err) {
      console.error('Failed to move card on server', err);
      // Revert optimism if it failed
      dispatch(fetchBoard(boardId));
    }
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
    <div className="h-screen bg-[#fafafa] flex flex-col overflow-hidden">
      <Navbar />
      
      {/* Board Header */}
      <div className="bg-white border-b border-gray-200/60 px-6 py-4 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/w/${activeBoard.workspaceId}`)} 
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="h-6 w-px bg-gray-200"></div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{activeBoard.title}</h1>
        </div>
        
        {/* Presence Avatars */}
        <div className="flex items-center gap-3">
          {activeUsers?.length > 0 && (
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {activeUsers.length} online
            </div>
          )}
          <div className="flex items-center -space-x-2">
            {activeUsers?.map((user) => (
              <div 
                key={user.userId} 
                title={user.name}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm ring-1 ring-black/5"
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Canvas */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex items-start space-x-6 relative">
          
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

          {/* Render Lists */}
          {activeBoard.lists?.map((list) => (
            <div key={list._id} className="w-[340px] bg-gray-100/50 rounded-2xl flex flex-col flex-shrink-0 max-h-full border border-gray-200/50 backdrop-blur-sm relative z-10">
              <div className="p-4 flex-shrink-0 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 tracking-tight">{list.title}</h3>
                <span className="text-xs font-medium bg-gray-200/50 text-gray-500 px-2 py-1 rounded-full">
                  {list.cards.length}
                </span>
              </div>
              
              <Droppable droppableId={list._id}>
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 overflow-y-auto px-3 space-y-2.5 pb-3 min-h-[10px]"
                  >
                    {list.cards?.map((card, index) => (
                      <Draggable key={card._id} draggableId={card._id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              bg-white p-4 rounded-xl border border-gray-200 shadow-sm
                              hover:border-brand-500/30 hover:shadow-md transition-all duration-200 cursor-pointer
                              ${snapshot.isDragging ? 'shadow-xl ring-2 ring-brand-500 rotate-2 scale-105 opacity-90' : ''}
                            `}
                            style={{ ...provided.draggableProps.style }}
                            onClick={() => dispatch(openCardModal(card._id))}
                          >
                            <p className="text-sm font-medium text-gray-900 mb-1">{card.title}</p>
                            {card.description && (
                              <div className="flex items-center text-gray-400 mt-2">
                                <AlignLeft size={14} />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {/* Add Card Input */}
                    {addingCardToList === list._id ? (
                      <form onSubmit={(e) => handleCreateCard(e, list._id)} className="mt-2.5">
                        <textarea
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                          placeholder="What needs to be done?"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm resize-none shadow-sm transition-all"
                          rows={2}
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
                            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
                          >
                            Add Card
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingCardToList(null)}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
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
                        className="w-full text-left px-4 py-2.5 mt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors flex items-center"
                      >
                        <span className="mr-2 text-lg leading-none">+</span> Add a card
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}

          {/* Add List Column */}
          <div className="w-[340px] flex-shrink-0 relative z-10">
            {isAddingList ? (
              <div className="bg-gray-100/50 p-3 rounded-2xl border border-gray-200/50 backdrop-blur-sm">
                <form onSubmit={handleCreateList}>
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium mb-3 shadow-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-black text-sm transition-colors"
                    >
                      Add List
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingList(false)}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="w-full bg-white/50 hover:bg-white text-gray-600 hover:text-gray-900 font-medium p-4 rounded-2xl border border-dashed border-gray-300 hover:border-gray-400 hover:shadow-sm transition-all text-left flex items-center"
              >
                <span className="mr-2 text-xl leading-none">+</span> Add another list
              </button>
            )}
          </div>
        </main>
      </DragDropContext>
      <CardModal />
    </div>
  );
}
