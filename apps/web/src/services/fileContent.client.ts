'use client'

import { useCallback, useState } from 'react';
import axios from 'axios';
import { init, NetworkState, success } from '@/services/network-state';

export function useFileContent(): [NetworkState<{content: string}>, (query: string) => void, () => void] {
  const [result, setResult] = useState<NetworkState<{content: string}>>(init());

  const dispatch = useCallback((path: string) => {
    axios.get(`/api/file/${encodeURIComponent(path)}`, {
    }).then(r => {
      setResult(success(r.data.content));
    })
  }, []);

  const clear = useCallback(() => {
    setResult(init());
  }, []);

  return [result, dispatch, clear]
}
