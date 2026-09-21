import { Share } from 'react-native';

function notesAsText(notes) {
  return notes
    .map((note) => `${note.title || 'Untitled note'}\n${note.body || ''}`)
    .join('\n\n');
}

export async function exportNotes(notes, format = 'text') {
  const message = format === 'json' ? JSON.stringify(notes, null, 2) : notesAsText(notes);
  return Share.share({ message });
}

export async function exportNotesAsJson(notes) {
  return exportNotes(notes, 'json');
}