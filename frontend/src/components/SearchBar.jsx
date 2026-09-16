import React from 'react';
import { Search, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

const SearchBar = ({ search, setSearch, category, setCategory, sort, setSort, onReset }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-black/6 shadow-sm mb-8 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="input-apple block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Category Dropdown */}
      <div className="relative min-w-[160px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-apple block w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 cursor-pointer appearance-none"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Dropdown */}
      <div className="relative min-w-[180px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-apple block w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-black/8 rounded-xl text-sm text-gray-900 cursor-pointer appearance-none"
        >
          <option value="">Sort: Featured</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {/* Reset */}
      {(search || category !== 'All' || sort) && (
        <button
          onClick={onReset}
          className="press inline-flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-black/5 rounded-xl transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
