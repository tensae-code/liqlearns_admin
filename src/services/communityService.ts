import { supabase } from '../lib/supabase';

export interface CommunityPost {
  id: string;
  userId: string;
  content: string;
  mediaUrls?: string[];
  isApproved: boolean;
  approvedBy?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  userFullName?: string;
  userAvatar?: string;
}

export interface PostInteraction {
  id: string;
  postId: string;
  userId: string;
  interactionType: 'like' | 'share' | 'comment';
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  replyToId?: string;
  createdAt: string;
  userFullName?: string;
  userAvatar?: string;
}

class CommunityService {
  async createPost(userId: string, content: string, mediaUrls?: string[]): Promise<CommunityPost> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: userId,
          content,
          media_urls: mediaUrls || [],
          is_approved: false, // Requires CEO approval
          like_count: 0,
          comment_count: 0,
          share_count: 0
        })
        .select(`
          *,
          user_profiles!community_posts_user_id_fkey(full_name, email)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        content: data.content,
        mediaUrls: data.media_urls,
        isApproved: data.is_approved,
        approvedBy: data.approved_by,
        likeCount: data.like_count,
        commentCount: data.comment_count,
        shareCount: data.share_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userFullName: data.user_profiles?.full_name || data.user_profiles?.email?.split('@')[0],
        userAvatar: data.user_profiles?.full_name?.charAt(0).toUpperCase()
      };
    } catch (error: any) {
      console.error('Error creating post:', error);
      throw new Error(error.message || 'Failed to create post');
    }
  }

  async getPosts(limit: number = 20, offset: number = 0): Promise<CommunityPost[]> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user_profiles!community_posts_user_id_fkey(full_name, email)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (data || []).map(post => ({
        id: post.id,
        userId: post.user_id,
        content: post.content,
        mediaUrls: post.media_urls,
        isApproved: post.is_approved,
        approvedBy: post.approved_by,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        shareCount: post.share_count,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        userFullName: post.user_profiles?.full_name || post.user_profiles?.email?.split('@')[0],
        userAvatar: post.user_profiles?.full_name?.charAt(0).toUpperCase() || 
                    post.user_profiles?.email?.charAt(0).toUpperCase()
      }));
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      throw new Error(error.message || 'Failed to fetch posts');
    }
  }

  async likePost(postId: string, userId: string): Promise<void> {
    try {
      // Check if already liked
      const { data: existing } = await supabase
        .from('community_post_interactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('interaction_type', 'like')
        .single();

      if (existing) {
        // Unlike
        await supabase
          .from('community_post_interactions')
          .delete()
          .eq('id', existing.id);
      } else {
        // Like
        await supabase
          .from('community_post_interactions')
          .insert({
            post_id: postId,
            user_id: userId,
            interaction_type: 'like'
          });
      }
    } catch (error: any) {
      console.error('Error liking post:', error);
      throw new Error(error.message || 'Failed to like post');
    }
  }

  async commentOnPost(postId: string, userId: string, content: string, replyToId?: string): Promise<PostComment> {
    try {
      const { data, error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content,
          reply_to_id: replyToId
        })
        .select(`
          *,
          user_profiles!community_post_comments_user_id_fkey(full_name, email)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        content: data.content,
        replyToId: data.reply_to_id,
        createdAt: data.created_at,
        userFullName: data.user_profiles?.full_name || data.user_profiles?.email?.split('@')[0],
        userAvatar: data.user_profiles?.full_name?.charAt(0).toUpperCase()
      };
    } catch (error: any) {
      console.error('Error commenting on post:', error);
      throw new Error(error.message || 'Failed to comment on post');
    }
  }

  async sharePost(postId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('community_post_interactions')
        .insert({
          post_id: postId,
          user_id: userId,
          interaction_type: 'share'
        });
    } catch (error: any) {
      console.error('Error sharing post:', error);
      throw new Error(error.message || 'Failed to share post');
    }
  }

  async getPostComments(postId: string): Promise<PostComment[]> {
    try {
      const { data, error } = await supabase
        .from('community_post_comments')
        .select(`
          *,
          user_profiles!community_post_comments_user_id_fkey(full_name, email)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(comment => ({
        id: comment.id,
        postId: comment.post_id,
        userId: comment.user_id,
        content: comment.content,
        replyToId: comment.reply_to_id,
        createdAt: comment.created_at,
        userFullName: comment.user_profiles?.full_name || comment.user_profiles?.email?.split('@')[0],
        userAvatar: comment.user_profiles?.full_name?.charAt(0).toUpperCase()
      }));
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      throw new Error(error.message || 'Failed to fetch comments');
    }
  }

  async getApprovedPosts(limit: number = 20, offset: number = 0): Promise<CommunityPost[]> {
    return this.getPosts(limit, offset);
  }
}

export const communityService = new CommunityService();