import { useState, useEffect } from 'react';
import { Search, Book, Video, File, Code, Music, Calculator, Beaker, Globe, Palette } from 'lucide-react';
import { cn } from '@/utils/cn';
import Icon from '../../../components/AppIcon';


type ViewMode = 'tool' | 'subject';

interface Category {
  id: string;
  name: string;
  icon: any;
  count: number;
  color: string;
}

const TOOL_CATEGORIES: Category[] = [
  { id: 'audio', name: 'Audio', icon: Music, count: 3, color: 'text-purple-600' },
  { id: 'video', name: 'Video', icon: Video, count: 5, color: 'text-red-600' },
  { id: 'notes', name: 'Notes', icon: Book, count: 8, color: 'text-blue-600' },
  { id: 'assignments', name: 'Assignments', icon: File, count: 2, color: 'text-green-600' },
  { id: 'code', name: 'Code', icon: Code, count: 6, color: 'text-indigo-600' },
  { id: 'templates', name: 'Templates', icon: File, count: 4, color: 'text-yellow-600' },
];

const SUBJECT_CATEGORIES: Category[] = [
  { id: 'math', name: 'Mathematics', icon: Calculator, count: 2, color: 'text-orange-600' },
  { id: 'amharic', name: 'Amharic', icon: Globe, count: 3, color: 'text-teal-600' },
  { id: 'science', name: 'Science', icon: Beaker, count: 4, color: 'text-sky-600' },
  { id: 'english', name: 'English', icon: Book, count: 5, color: 'text-violet-600' },
  { id: 'technology', name: 'Technology', icon: Code, count: 5, color: 'text-pink-600' },
  { id: 'art', name: 'Art', icon: Palette, count: 3, color: 'text-rose-600' },
];

export default function MarketplaceGrid() {
  const [viewMode, setViewMode] = useState<ViewMode>('tool');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const categories = viewMode === 'tool' ? TOOL_CATEGORIES : SUBJECT_CATEGORIES;

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="mt-8">
      {/* Header: Toggle + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold">Marketplace</h3>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('tool')}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                viewMode === 'tool' ?'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' :'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              By Tool
            </button>
            <button
              onClick={() => setViewMode('subject')}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                viewMode === 'subject' ?'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' :'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              By Subject
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search by ${viewMode}...`}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm w-full md:w-auto min-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No items found matching "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg transition-all hover:border-orange-500 dark:hover:border-orange-500 text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={cn('h-6 w-6', cat.color)} />
                  <span className="text-2xl font-bold text-orange-600">{cat.count}</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">items available</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Items Modal */}
      {selectedCategory && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedCategory(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {categories.find(c => c.id === selectedCategory)?.name} Items
              </h3>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Mock items - replace with real API call */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">
                    Sample Item {i + 1}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Description for this item
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-600">$4.99</span>
                    <button className="rounded-lg bg-orange-500 px-4 py-2 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}