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
  moveCardThunk 
} from '../store/slices/boardSlice';
import Navbar from '../components/layout/Navbar';
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
        boardId,
        listId: sourceList._id,
        cardId: cardToMove._id,
        targetListId: targetList._id,
        prevOrder,
        nextOrder
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Navbar />
      
      {/* Board Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(`/w/${activeBoard.workspaceId}`)} 
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{activeBoard.title}</h1>
        </div>
        
        {/* Presence Avatars */}
        <div className="flex items-center -space-x-2">
          {activeUsers?.map((user) => (
            <div 
              key={user.userId} 
              title={user.name}
              className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {activeUsers?.length > 0 && (
            <div className="ml-4 text-xs text-gray-500">
              {activeUsers.length} online
            </div>
          )}
        </div>
      </div>

      {/* Kanban Canvas */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex items-start space-x-6">
          
          {/* Render Lists */}
          {activeBoard.lists?.map((list) => (
            <div key={list._id} className="w-80 bg-gray-100 rounded-xl flex flex-col flex-shrink-0 max-h-full">
              <div className="p-4 flex-shrink-0">
                <h3 className="font-semibold text-gray-900">{list.title}</h3>
              </div>
              
              <Droppable droppableId={list._id}>
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 overflow-y-auto px-4 space-y-3 pb-4 min-h-[10px]"
                  >
                    {list.cards?.map((card, index) => (
                      <Draggable key={card._id} draggableId={card._id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''}`}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <p className="text-sm text-gray-900">{card.title}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
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
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors flex items-center mt-2"
                      >
                        <span className="mr-1 text-lg">+</span> Add a card
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
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
      </DragDropContext>
    </div>
  );
}
