'use client';
import { useEffect, useMemo, useState } from 'react';
import TreeView, { buildHierarchy } from '@/components/TreeView';
import { useSearch } from '@/services/flexIndex.client';
import { isSuccess } from '@/services/network-state';
import { Input } from '@/catalyst/input';

export function HierarchyView({ filter }: { filter: string }) {
  const [searchTerm, setSearchTerm] = useState('');

  const [result, search, clear] = useSearch();

  useEffect(() => {
    search(filter);
    return clear;
  }, []);

  const filteredNodes = useMemo(() => {
    if (isSuccess(result)) {
      const searchResults = result.data.filter((a) =>
        a.url.startsWith(filter + '/')
      );
      return buildHierarchy(searchResults, filter.split('/').length - 1);
    } else {
      return buildHierarchy([]);
    }
  }, [result]);

  useEffect(() => {
    search(searchTerm.trim().length > 0 ? searchTerm.trim() : filter);
  }, [searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Input onChange={handleSearch} value={searchTerm} placeholder="Filter" />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 stext-gray-400 hover:text-white focus:outline-none"
          >
            ✕
          </button>
        )}
      </div>
      <TreeView nodes={filteredNodes} />
    </div>
  );
}
