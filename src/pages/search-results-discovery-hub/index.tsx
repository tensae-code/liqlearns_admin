import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, Package, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  language: string;
  xp_reward: number;
}

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  payment_method: string;
  preview_image_url: string;
  rating_average: number;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<{ courses: Course[]; items: MarketplaceItem[] }>({ 
    courses: [], 
    items: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchContent = async () => {
      if (!query.trim()) {
        setResults({ courses: [], items: [] });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Search courses
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, description, difficulty_level, language, xp_reward')
          .eq('is_active', true)
          .ilike('title', `%${query}%`);

        if (coursesError) throw coursesError;

        // Search marketplace products
        const { data: items, error: itemsError } = await supabase
          .from('marketplace_products')
          .select('id, title, description, price, category, payment_method, preview_image_url, rating_average')
          .eq('status', 'active')
          .ilike('title', `%${query}%`);

        if (itemsError) throw itemsError;

        setResults({ 
          courses: courses || [], 
          items: items || [] 
        });
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'Failed to search');
      } finally {
        setLoading(false);
      }
    };

    searchContent();
  }, [query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Searching...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for "{query}"
        </h2>
        <p className="text-sm text-gray-600">
          Found {results.courses.length} courses and {results.items.length} marketplace items
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Courses Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-orange-500" />
            Courses ({results.courses.length})
          </h3>
          {results.courses.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No courses found matching "{query}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.courses.map(course => (
                <div 
                  key={course.id} 
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {course.difficulty_level}
                    </span>
                    <span className="font-medium text-orange-600">
                      +{course.xp_reward} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Marketplace Items Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-500" />
            Marketplace ({results.items.length})
          </h3>
          {results.items.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No marketplace items found matching "{query}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.items.map(item => (
                <div 
                  key={item.id} 
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer"
                >
                  {item.preview_image_url && (
                    <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
                      <img 
                        src={item.preview_image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-600">
                      {item.payment_method === 'aura_points' 
                        ? `${item.price} Points` 
                        : `$${item.price}`}
                    </span>
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}