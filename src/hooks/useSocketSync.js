import { useEffect, useRef, useCallback } from 'react';
import { initSocket, disconnectSocket } from '../services/socket';

export function useSocketSync(data, setData) {
  const socketInitialized = useRef(false);
  const pendingUpdates = useRef(new Set());

  useEffect(() => {
    if (socketInitialized.current) return;
    socketInitialized.current = true;
    
    const currentPendingUpdates = pendingUpdates.current;

    initSocket((change) => {
      const updateKey = `${change.type}_${change.action}_${change.data?.id}`;
      if (currentPendingUpdates.has(updateKey)) {
        currentPendingUpdates.delete(updateKey);
        return;
      }

      setData(prev => {
        const { type, action, data: item } = change;
        if (type === 'plan') {
          if (action === 'create') {
            if (prev.plans?.some(p => p.id === item.id)) return prev;
            return { ...prev, plans: [...(prev.plans || []), item] };
          } else if (action === 'update') {
            return { ...prev, plans: (prev.plans || []).map(p => p.id === item.id ? item : p) };
          } else if (action === 'delete') {
            return { ...prev, plans: (prev.plans || []).filter(p => p.id !== item.id) };
          }
        } else if (type === 'task') {
          if (action === 'create') {
            if (prev.tasks?.some(t => t.id === item.id)) return prev;
            return { ...prev, tasks: [...(prev.tasks || []), item] };
          } else if (action === 'update') {
            return { ...prev, tasks: (prev.tasks || []).map(t => t.id === item.id ? item : t) };
          } else if (action === 'delete') {
            return { ...prev, tasks: (prev.tasks || []).filter(t => t.id !== item.id) };
          }
        } else if (type === 'inspiration') {
          if (action === 'create') {
            if (prev.inspirations?.some(i => i.id === item.id)) return prev;
            return { ...prev, inspirations: [...(prev.inspirations || []), item] };
          } else if (action === 'update') {
            return { ...prev, inspirations: (prev.inspirations || []).map(i => i.id === item.id ? item : i) };
          } else if (action === 'delete') {
            return { ...prev, inspirations: (prev.inspirations || []).filter(i => i.id !== item.id) };
          }
        }
        return prev;
      });
    });

    return () => {
      socketInitialized.current = false;
      currentPendingUpdates.clear();
      disconnectSocket();
    };
  }, [setData]);

  const updateData = useCallback((type, action, item) => {
    const normalizedType = type.replace(/s$/, '');
    const updateKey = `${normalizedType}_${action}_${item.id}`;
    pendingUpdates.current.add(updateKey);

    setData(prev => {
      if (type === 'plans') {
        if (action === 'create') return { ...prev, plans: [...(prev.plans || []), item] };
        if (action === 'update') return { ...prev, plans: (prev.plans || []).map(p => p.id === item.id ? item : p) };
        if (action === 'delete') return { ...prev, plans: (prev.plans || []).filter(p => p.id !== item.id) };
      } else if (type === 'tasks') {
        if (action === 'create') return { ...prev, tasks: [...(prev.tasks || []), item] };
        if (action === 'update') return { ...prev, tasks: (prev.tasks || []).map(t => t.id === item.id ? item : t) };
        if (action === 'delete') return { ...prev, tasks: (prev.tasks || []).filter(t => t.id !== item.id) };
      } else if (type === 'inspirations') {
        if (action === 'create') return { ...prev, inspirations: [...(prev.inspirations || []), item] };
        if (action === 'update') return { ...prev, inspirations: (prev.inspirations || []).map(i => i.id === item.id ? item : i) };
        if (action === 'delete') return { ...prev, inspirations: (prev.inspirations || []).filter(i => i.id !== item.id) };
      }
      return prev;
    });
  }, [setData]);

  const resetSocket = useCallback(() => {
    socketInitialized.current = false;
    pendingUpdates.current.clear();
  }, []);

  return { updateData, resetSocket };
}
