'use client'
import { SearchResult } from '@/services/flexIndex';
import { useEffect, useMemo, useState } from 'react';
import TreeView, { buildHierarchy } from '@/components/TreeView';
import { useSearch } from '@/services/flexIndex.client';
import { isSuccess } from '@/services/network-state';
import { Text } from '@/catalyst/text';
import { Input } from '@/catalyst/input';

export function HierarchyView({ filter }: { filter: string }) {

  const [searchTerm, setSearchTerm] = useState("");

  let [result, search, clear] = useSearch();

  useEffect(() => {
    search(filter)
    return clear
  }, [])

  let filteredNodes = useMemo(() => {
    if (isSuccess(result)) {
      let searchResults = result.data.filter(a => a.url.startsWith(filter + '/'));
      return buildHierarchy(searchResults, filter.split('/').length - 1)
    } else {
      return buildHierarchy([])
    }
  }, [result])

  useEffect(() => {
    search(searchTerm.trim().length > 0 ? searchTerm.trim() : filter)
  }, [searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const clearSearch = () => {
    setSearchTerm("");

  };

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Input onChange={handleSearch} />
        {/*<input*/}
        {/*  type="text"*/}
        {/*  value={searchTerm}*/}
        {/*  onChange={handleSearch}*/}
        {/*  placeholder="Search..."*/}
        {/*  className="px-4 py-2 border rounded w-full bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-600"*/}
        {/*/>*/}
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
          >
            ✕
          </button>
        )}
      </div>
      <TreeView nodes={filteredNodes} />
    </div>
  );
}
