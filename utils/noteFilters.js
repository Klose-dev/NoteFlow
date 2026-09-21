export function filterNotesByTitle(notes, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return notes;

  return notes.filter((note) => (note.title || '').toLowerCase().includes(normalizedQuery));
}