import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { studyRoomService, ChatMessage } from '../services/studyRoomService';

interface StudyRoomChatProps {
  roomId: string;
  userId: string;
  userName: string;
}

export const StudyRoomChat: React.FC<StudyRoomChatProps> = ({
  roomId,
  userId,
  userName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [roomId]);

  // Subscribe to new messages
  useEffect(() => {
    const subscription = studyRoomService.subscribeToChat(roomId, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMsg: ChatMessage = {
          id: payload.new.id,
          roomId: payload.new.room_id,
          userId: payload.new.user_id,
          userName: payload.new.user_name,
          message: payload.new.message,
          isAnnouncement: payload.new.is_announcement,
          createdAt: payload.new.created_at,
        };
        setMessages(prev => [...prev, newMsg]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const msgs = await studyRoomService.getChatMessages(roomId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await studyRoomService.sendChatMessage(
        roomId,
        userId,
        userName,
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-t-lg">
        <h3 className="text-white font-semibold text-lg">Study Room Chat</h3>
        <p className="text-purple-100 text-sm">{messages.length} messages</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <AlertCircle className="w-12 h-12 mb-2" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${
                message.isAnnouncement
                  ? 'bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded'
                  : message.userId === userId
                  ? 'ml-auto' :''
              } max-w-[80%]`}
            >
              {message.isAnnouncement ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-semibold text-yellow-800">
                      Announcement
                    </span>
                  </div>
                  <p className="text-sm text-yellow-900">{message.message}</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      {message.userName}
                      {message.userId === userId && ' (You)'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.userId === userId
                        ? 'bg-orange-500 text-white' :'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm break-words">{message.message}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={loading}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">
          {newMessage.length}/500 characters
        </p>
      </form>
    </div>
  );
};

export default StudyRoomChat;