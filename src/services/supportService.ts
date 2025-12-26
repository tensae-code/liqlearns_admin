import { supabase } from '../lib/supabase';

export interface SupportFAQ {
  id: string;
  question: string;
  answer: string;
  category: 'account' | 'learning' | 'payments' | 'technical' | 'general';
  isActive: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'account' | 'learning' | 'payments' | 'technical' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  userId: string;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  content: string;
  messageType: 'user' | 'agent' | 'system';
  isRead: boolean;
  attachmentUrl?: string;
  createdAt: string;
}

export interface CreateTicketData {
  title: string;
  description: string;
  category: 'account' | 'learning' | 'payments' | 'technical' | 'general';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

// Get all active FAQs
export const getFAQs = async (category?: string): Promise<SupportFAQ[]> => {
  try {
    let query = supabase
      .from('support_faqs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((faq: any) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.is_active,
      viewCount: faq.view_count,
      helpfulCount: faq.helpful_count,
      notHelpfulCount: faq.not_helpful_count,
      displayOrder: faq.display_order,
      createdAt: faq.created_at,
      updatedAt: faq.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
};

// Rate FAQ as helpful or not
export const rateFAQ = async (faqId: string, isHelpful: boolean): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Insert rating
    const { error: ratingError } = await supabase
      .from('faq_ratings')
      .insert({
        faq_id: faqId,
        user_id: user.user.id,
        is_helpful: isHelpful,
      });

    if (ratingError) throw ratingError;

    // Update FAQ counts
    const column = isHelpful ? 'helpful_count' : 'not_helpful_count';
    const { error: updateError } = await supabase.rpc('increment_faq_rating', {
      faq_id: faqId,
      rating_column: column,
    });

    if (updateError) {
      // Fallback: manually increment
      const { data: faq } = await supabase
        .from('support_faqs')
        .select(column)
        .eq('id', faqId)
        .single();

      if (faq) {
        await supabase
          .from('support_faqs')
          .update({ [column]: faq[column] + 1 })
          .eq('id', faqId);
      }
    }
  } catch (error) {
    console.error('Error rating FAQ:', error);
    throw error;
  }
};

// Get user's tickets
export const getUserTickets = async (): Promise<SupportTicket[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((ticket: any) => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      userId: ticket.user_id,
      assignedTo: ticket.assigned_to,
      resolvedAt: ticket.resolved_at,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

// Create new support ticket
export const createTicket = async (ticketData: CreateTicketData): Promise<SupportTicket> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority || 'medium',
        user_id: user.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      userId: data.user_id,
      assignedTo: data.assigned_to,
      resolvedAt: data.resolved_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

// Get ticket messages
export const getTicketMessages = async (ticketId: string): Promise<SupportMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('support_chat_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((message: any) => ({
      id: message.id,
      ticketId: message.ticket_id,
      senderId: message.sender_id,
      content: message.content,
      messageType: message.message_type,
      isRead: message.is_read,
      attachmentUrl: message.attachment_url,
      createdAt: message.created_at,
    }));
  } catch (error) {
    console.error('Error fetching ticket messages:', error);
    throw error;
  }
};

// Send message to ticket
export const sendTicketMessage = async (
  ticketId: string,
  content: string
): Promise<SupportMessage> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('support_chat_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: user.user.id,
        content,
        message_type: 'user',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      ticketId: data.ticket_id,
      senderId: data.sender_id,
      content: data.content,
      messageType: data.message_type,
      isRead: data.is_read,
      attachmentUrl: data.attachment_url,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error sending ticket message:', error);
    throw error;
  }
};