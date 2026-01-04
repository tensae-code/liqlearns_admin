import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search-results-discovery-hub?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search courses, marketplace..."
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
    </form>
  );
}