import { supabase } from '../lib/supabase';

// Types
export interface CourseTitle {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  creatorName?: string;
  contentItemsCount?: number;
}

export interface CourseContentItem {
  id: string;
  courseTitleId: string;
  contentType: ContentType;
  title: string;
  description: string | null;
  contentUrl: string | null;
  contentData: any;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  orderIndex: number;
  creatorName?: string;
}

export type ContentType = 
  | 'video' | 'audio' | 'document' | 'image' | 'game' | 'movie' 
  | 'interactive'| 'article' | 'quiz' | 'exercise' | 'flashcard' |'notes'| 'presentation' | 'animation' | 'simulation' |'podcast' | 'ebook' | 'infographic' | 'code';

// Content type metadata for UI
export const CONTENT_TYPES: Record<ContentType, { label: string; icon: string; color: string }> = {
  video: { label: 'Video', icon: '🎥', color: 'bg-red-100 text-red-700' },
  audio: { label: 'Audio', icon: '🎵', color: 'bg-purple-100 text-purple-700' },
  document: { label: 'Document', icon: '📄', color: 'bg-blue-100 text-blue-700' },
  image: { label: 'Image', icon: '🖼️', color: 'bg-green-100 text-green-700' },
  game: { label: 'Game', icon: '🎮', color: 'bg-pink-100 text-pink-700' },
  movie: { label: 'Movie', icon: '🎬', color: 'bg-indigo-100 text-indigo-700' },
  interactive: { label: 'Interactive', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
  article: { label: 'Article', icon: '📰', color: 'bg-gray-100 text-gray-700' },
  quiz: { label: 'Quiz', icon: '❓', color: 'bg-orange-100 text-orange-700' },
  exercise: { label: 'Exercise', icon: '💪', color: 'bg-teal-100 text-teal-700' },
  flashcard: { label: 'Flashcard', icon: '🃏', color: 'bg-cyan-100 text-cyan-700' },
  notes: { label: 'Notes', icon: '📝', color: 'bg-lime-100 text-lime-700' },
  presentation: { label: 'Presentation', icon: '📊', color: 'bg-amber-100 text-amber-700' },
  animation: { label: 'Animation', icon: '🎞️', color: 'bg-fuchsia-100 text-fuchsia-700' },
  simulation: { label: 'Simulation', icon: '🔬', color: 'bg-emerald-100 text-emerald-700' },
  podcast: { label: 'Podcast', icon: '🎙️', color: 'bg-violet-100 text-violet-700' },
  ebook: { label: 'E-Book', icon: '📚', color: 'bg-rose-100 text-rose-700' },
  infographic: { label: 'Infographic', icon: '📈', color: 'bg-sky-100 text-sky-700' },
  code: { label: 'Code', icon: '💻', color: 'bg-slate-100 text-slate-700' }
};

class CourseContentService {
  // Course Titles (Teacher functionality)
  async getCourseTitles(courseId: string): Promise<CourseTitle[]> {
    // FIXED: Add UUID validation to prevent invalid input syntax errors
    if (!courseId || courseId.trim() === '') {
      throw new Error('Course ID is required');
    }
    
    // Validate UUID format (basic check for UUID-like string)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(courseId)) {
      throw new Error('Invalid course ID format. Expected UUID format.');
    }

    const { data, error } = await supabase
      .from('course_titles')
      .select(`
        *,
        user_profiles!course_titles_created_by_fkey(full_name)
      `)
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map(item => ({
      id: item.id,
      courseId: item.course_id,
      title: item.title,
      description: item.description,
      orderIndex: item.order_index,
      createdBy: item.created_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      isPublished: item.is_published,
      creatorName: item.user_profiles?.full_name || 'Unknown'
    }));
  }

  async createCourseTitle(
    courseId: string,
    title: string,
    description: string | null,
    userId: string
  ): Promise<CourseTitle> {
    // Get max order index
    const { data: maxOrder } = await supabase
      .from('course_titles')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrder?.order_index || 0) + 1;

    const { data, error } = await supabase
      .from('course_titles')
      .insert({
        course_id: courseId,
        title,
        description,
        order_index: nextOrder,
        created_by: userId,
        is_published: false
      })
      .select(`
        *,
        user_profiles!course_titles_created_by_fkey(full_name)
      `)
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description,
      orderIndex: data.order_index,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isPublished: data.is_published,
      creatorName: data.user_profiles?.full_name || 'Unknown'
    };
  }

  async updateCourseTitle(
    titleId: string,
    updates: Partial<Pick<CourseTitle, 'title' | 'description' | 'isPublished'>>
  ): Promise<void> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.isPublished !== undefined) updateData.is_published = updates.isPublished;

    const { error } = await supabase
      .from('course_titles')
      .update(updateData)
      .eq('id', titleId);

    if (error) throw new Error(error.message);
  }

  async deleteCourseTitle(titleId: string): Promise<void> {
    const { error } = await supabase
      .from('course_titles')
      .delete()
      .eq('id', titleId);

    if (error) throw new Error(error.message);
  }

  // Course Content Items (Student functionality)
  async getContentItems(titleId: string): Promise<CourseContentItem[]> {
    const { data, error } = await supabase
      .from('course_content_items')
      .select(`
        *,
        user_profiles!course_content_items_created_by_fkey(full_name)
      `)
      .eq('course_title_id', titleId)
      .order('order_index', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map(item => ({
      id: item.id,
      courseTitleId: item.course_title_id,
      contentType: item.content_type as ContentType,
      title: item.title,
      description: item.description,
      contentUrl: item.content_url,
      contentData: item.content_data,
      createdBy: item.created_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      isApproved: item.is_approved,
      approvedBy: item.approved_by,
      approvedAt: item.approved_at,
      orderIndex: item.order_index,
      creatorName: item.user_profiles?.full_name || 'Unknown'
    }));
  }

  async createContentItem(
    titleId: string,
    contentType: ContentType,
    title: string,
    description: string | null,
    contentUrl: string | null,
    contentData: any,
    userId: string
  ): Promise<CourseContentItem> {
    // Get max order index
    const { data: maxOrder } = await supabase
      .from('course_content_items')
      .select('order_index')
      .eq('course_title_id', titleId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrder?.order_index || 0) + 1;

    const { data, error } = await supabase
      .from('course_content_items')
      .insert({
        course_title_id: titleId,
        content_type: contentType,
        title,
        description,
        content_url: contentUrl,
        content_data: contentData,
        order_index: nextOrder,
        created_by: userId,
        is_approved: false
      })
      .select(`
        *,
        user_profiles!course_content_items_created_by_fkey(full_name)
      `)
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      courseTitleId: data.course_title_id,
      contentType: data.content_type as ContentType,
      title: data.title,
      description: data.description,
      contentUrl: data.content_url,
      contentData: data.content_data,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      isApproved: data.is_approved,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      orderIndex: data.order_index,
      creatorName: data.user_profiles?.full_name || 'Unknown'
    };
  }

  async approveContentItem(itemId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('course_content_items')
      .update({
        is_approved: true,
        approved_by: userId,
        approved_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) throw new Error(error.message);
  }

  async updateContentItem(
    itemId: string,
    updates: Partial<Pick<CourseContentItem, 'title' | 'description' | 'contentUrl' | 'contentData'>>
  ): Promise<void> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.contentUrl !== undefined) updateData.content_url = updates.contentUrl;
    if (updates.contentData !== undefined) updateData.content_data = updates.contentData;

    const { error } = await supabase
      .from('course_content_items')
      .update(updateData)
      .eq('id', itemId);

    if (error) throw new Error(error.message);
  }

  async deleteContentItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('course_content_items')
      .delete()
      .eq('id', itemId);

    if (error) throw new Error(error.message);
  }

  // Aggregation functions
  async getCourseWithHierarchy(courseId: string): Promise<any> {
    // FIXED: Add early validation before making database calls
    if (!courseId || courseId.trim() === '') {
      throw new Error('Course ID is required');
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(courseId)) {
      throw new Error('Invalid course ID format. Please select a valid course from the database.');
    }

    try {
      const titles = await this.getCourseTitles(courseId);
      
      const titlesWithContent = await Promise.all(
        titles.map(async (title) => {
          const items = await this.getContentItems(title.id);
          return {
            ...title,
            contentItems: items
          };
        })
      );

      return titlesWithContent;
    } catch (error: any) {
      console.error('Error in getCourseWithHierarchy:', error);
      throw new Error(error.message || 'Failed to load course hierarchy');
    }
  }

  // NEW: Helper method to get actual course IDs from database
  async getAvailableCourses(): Promise<{ id: string; title: string; type: string; description: string | null; difficultyLevel: string | null; estimatedDurationMinutes: number | null }[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, course_type, description, difficulty_level, estimated_duration_minutes')
      .eq('is_active', true)
      .order('title', { ascending: true });


    if (error) throw new Error(error.message);

    return (data || []).map(course => ({
      id: course.id,
      title: course.title,
      type: course.course_type,
      description: course.description ?? null,
      difficultyLevel: course.difficulty_level ?? null,
      estimatedDurationMinutes: course.estimated_duration_minutes ?? null
    }));
  }
}

export const courseContentService = new CourseContentService();