import React, { useState, useEffect } from 'react';
import { 
  Search, 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import {
  SupportFAQ,
  SupportTicket,
  getFAQs,
  rateFAQ,
  getUserTickets,
  createTicket,
  getTicketMessages,
  sendTicketMessage,
  SupportMessage,
  CreateTicketData
} from '../../../services/supportService';

interface HelpCenterProps {
  userId: string;
}

type Category = 'account' | 'learning' | 'payments' | 'technical' | 'general';

const HelpCenter: React.FC<HelpCenterProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'tickets'>('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<SupportFAQ[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTicket, setNewTicket] = useState<CreateTicketData>({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });

  const categories: { value: Category | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'account', label: 'Account' },
    { value: 'learning', label: 'Learning' },
    { value: 'payments', label: 'Payments' },
    { value: 'technical', label: 'Technical' },
    { value: 'general', label: 'General' }
  ];

  useEffect(() => {
    loadFAQs();
  }, [selectedCategory]);

  useEffect(() => {
    if (activeTab === 'tickets') {
      loadTickets();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedTicket) {
      loadTicketMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const data = await getFAQs(category);
      setFaqs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserTickets();
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    try {
      const messages = await getTicketMessages(ticketId);
      setTicketMessages(messages);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleRateFAQ = async (faqId: string, isHelpful: boolean) => {
    try {
      await rateFAQ(faqId, isHelpful);
      await loadFAQs();
    } catch (err: any) {
      console.error('Failed to rate FAQ:', err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await createTicket(newTicket);
      setShowNewTicketForm(false);
      setNewTicket({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });
      await loadTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      await sendTicketMessage(selectedTicket.id, newMessage);
      setNewMessage('');
      await loadTicketMessages(selectedTicket.id);
    } catch (err: any) {
      console.error('Failed to send message:', err);
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Help Center</h2>
          <p className="text-sm text-gray-600 mt-1">
            Find answers to common questions or submit a support ticket
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'faqs' ?'bg-orange-500 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            FAQs
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tickets' ?'bg-orange-500 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            My Tickets
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* FAQ List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading FAQs...</p>
            </div>
          ) : filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No FAQs found matching your search</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4 flex-1 text-left">
                      <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{faq.question}</h3>
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded capitalize">
                          {faq.category}
                        </span>
                      </div>
                    </div>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <p className="text-gray-700 mt-4 mb-4">{faq.answer}</p>
                      <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Was this helpful?</span>
                        <button
                          onClick={() => handleRateFAQ(faq.id, true)}
                          className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{faq.helpfulCount}</span>
                        </button>
                        <button
                          onClick={() => handleRateFAQ(faq.id, false)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm">{faq.notHelpfulCount}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Still need help CTA */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
            <MessageCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Still need help?
            </h3>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Submit a support ticket and our team will assist you.
            </p>
            <button
              onClick={() => {
                setActiveTab('tickets');
                setShowNewTicketForm(true);
              }}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Submit a Ticket
            </button>
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          {!selectedTicket ? (
            <>
              {/* New Ticket Button */}
              <button
                onClick={() => setShowNewTicketForm(true)}
                className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Ticket</span>
              </button>

              {/* Tickets List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No support tickets yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first ticket to get help from our support team
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {ticket.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {ticket.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                              {ticket.category}
                            </span>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority} priority
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xs text-gray-500">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Ticket Detail View */
            <div className="space-y-6">
              {/* Back Button and Ticket Header */}
              <div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-orange-600 hover:text-orange-700 mb-4 flex items-center space-x-2"
                >
                  <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                  <span>Back to Tickets</span>
                </button>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedTicket.title}
                      </h2>
                      <p className="text-gray-600">{selectedTicket.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                      {selectedTicket.category}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority} priority
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      Created {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Conversation</h3>
                </div>
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  {ticketMessages.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No messages yet. Send a message to start the conversation.
                    </p>
                  ) : (
                    ticketMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-lg ${
                            message.senderId === userId
                              ? 'bg-orange-500 text-white' :'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === userId ? 'text-orange-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Create Support Ticket</h3>
              <button
                onClick={() => setShowNewTicketForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Brief description of your issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as Category })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {categories.filter(c => c.value !== 'all').map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Please provide as much detail as possible about your issue..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;