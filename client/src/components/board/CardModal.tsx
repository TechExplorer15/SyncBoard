import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { closeCardModal, updateCardThunk, deleteCardThunk } from '../../store/slices/boardSlice';
import { X, AlignLeft, Trash2, Clock, CheckCircle } from 'lucide-react';

export default function CardModal() {
  const dispatch = useAppDispatch();
  const { activeBoard, activeCardId } = useAppSelector((state) => state.board);

  // Find the active card
  let activeCard = null;
  let activeList = null;
  if (activeBoard && activeCardId) {
    for (const list of activeBoard.lists) {
      const card = list.cards.find(c => c._id === activeCardId);
      if (card) {
        activeCard = card;
        activeList = list;
        break;
      }
    }
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSavingDesc, setIsSavingDesc] = useState(false);

  // Sync state when activeCard changes (e.g. opened, or updated via websocket)
  useEffect(() => {
    if (activeCard) {
      setTitle(activeCard.title);
      setDescription(activeCard.description || '');
    }
  }, [activeCard?._id, activeCard?.title, activeCard?.description]);

  if (!activeCard || !activeList) return null;

  const handleClose = () => {
    dispatch(closeCardModal());
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== activeCard?.title) {
      dispatch(updateCardThunk({ cardId: activeCard._id, title: title.trim() }));
    }
  };

  const handleSaveDescription = async () => {
    if (description !== activeCard?.description) {
      setIsSavingDesc(true);
      await dispatch(updateCardThunk({ cardId: activeCard._id, description }));
      setIsSavingDesc(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      dispatch(deleteCardThunk(activeCard._id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-500">
                In list <span className="underline decoration-gray-300 underline-offset-2">{activeList.title}</span>
              </span>
            </div>
            
            {isEditingTitle ? (
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleBlur();
                  if (e.key === 'Escape') {
                    setTitle(activeCard.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="w-full text-2xl font-bold text-gray-900 bg-white border border-brand-500 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-4 focus:ring-brand-500/10 resize-none"
                rows={1}
                autoFocus
              />
            ) : (
              <h2 
                onClick={() => setIsEditingTitle(true)}
                className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-100/80 px-3 py-1.5 -ml-3 rounded-lg transition-colors inline-block"
              >
                {title}
              </h2>
            )}
          </div>
          
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 overflow-y-auto flex-1">
          <div className="flex items-start gap-4 mb-8">
            <div className="mt-1 flex-shrink-0 text-gray-400">
              <AlignLeft size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Description</h3>
              <div className="space-y-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                  className="w-full min-h-[140px] px-4 py-3 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm text-gray-700 resize-y transition-all"
                />
                {description !== (activeCard.description || '') && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDescription}
                      disabled={isSavingDesc}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {isSavingDesc ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setDescription(activeCard.description || '')}
                      className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="mt-1 flex-shrink-0 text-gray-400">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Activity</h3>
              <p className="text-sm text-gray-500">
                Created {new Date(activeCard.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Danger Zone */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 font-medium text-sm rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            Delete Card
          </button>
        </div>

      </div>
    </div>
  );
}
