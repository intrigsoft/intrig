'use client'

import { useCallback, useState } from 'react';
import { SearchResult } from '@/services/flexIndex';
import axios from 'axios';
import { init, NetworkState, success } from '@/services/network-state';

export function useSearch(): [NetworkState<SearchResult[]>, (query: string) => void, () => void] {
  const [result, setResult] = useState<NetworkState<SearchResult[]>>(init());

  const dispatch = useCallback((query: string) => {
    axios.get('/api/search', {
      params: {
        q: query,
      }
    }).then(r => {
      setResult(success(r.data));
    })
  }, []);

  const clear = useCallback(() => {
    setResult(init());
  }, []);

  return [result, dispatch, clear]
}
