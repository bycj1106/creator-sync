export const EMPTY_DATA = {
  plans: [],
  tasks: [],
  inspirations: [],
};

const TYPE_MAP = {
  plan: 'plans',
  plans: 'plans',
  task: 'tasks',
  tasks: 'tasks',
  inspiration: 'inspirations',
  inspirations: 'inspirations',
};

export function normalizeEntityType(type) {
  return TYPE_MAP[type] || type;
}

function sortByCreatedAtDesc(items) {
  return [...items].sort((left, right) => {
    const leftTime = left?.createdAt ? Date.parse(left.createdAt) : 0;
    const rightTime = right?.createdAt ? Date.parse(right.createdAt) : 0;
    return rightTime - leftTime;
  });
}

function applyCreate(items, item) {
  const nextItems = items.filter((entry) => entry.id !== item.id);
  nextItems.unshift(item);
  return sortByCreatedAtDesc(nextItems);
}

function applyUpdate(items, item) {
  const exists = items.some((entry) => entry.id === item.id);
  if (!exists) {
    return applyCreate(items, item);
  }

  // Keep the existing creation timestamp stable so updates do not reorder
  // records when the incoming payload omits or mutates createdAt.
  return sortByCreatedAtDesc(
    items.map((entry) => (
      entry.id === item.id
        ? { ...entry, ...item, createdAt: item.createdAt || entry.createdAt }
        : entry
    ))
  );
}

function applyDelete(items, item) {
  return items.filter((entry) => entry.id !== item.id);
}

export function applyEntityChange(currentData, type, action, item) {
  const normalizedType = normalizeEntityType(type);
  if (!EMPTY_DATA[normalizedType]) {
    return currentData;
  }

  // Local mode and socket sync both flow through the same reducer so their
  // merge, dedupe, and ordering rules stay identical.
  const items = currentData[normalizedType] || [];
  let nextItems = items;

  if (action === 'create') {
    nextItems = applyCreate(items, item);
  } else if (action === 'update') {
    nextItems = applyUpdate(items, item);
  } else if (action === 'delete') {
    nextItems = applyDelete(items, item);
  }

  if (nextItems === items) {
    return currentData;
  }

  return {
    ...currentData,
    [normalizedType]: nextItems,
  };
}
