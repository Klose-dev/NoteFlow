export const SORT_OPTIONS = [
  { key: 'edited', label: 'Recently edited' },
  { key: 'created', label: 'Newest first' },
  { key: 'title', label: 'Title A-Z' },
];

export function sortNotes(notes, sortBy) {
  return [...notes].sort((first, second) => {
    if (Boolean(first.pinned) !== Boolean(second.pinned)) return first.pinned ? -1 : 1;

    if (sortBy === 'title') {
      return (first.title || 'Untitled note').localeCompare(second.title || 'Untitled note');
    }

    const firstDate = sortBy === 'created' ? first.createdAt : first.editedAt;
    const secondDate = sortBy === 'created' ? second.createdAt : second.editedAt;
    return new Date(secondDate || 0).getTime() - new Date(firstDate || 0).getTime();
  });
}