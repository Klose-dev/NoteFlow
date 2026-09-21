import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTE_COLORS } from './noteColors';

const NOTES_KEY = 'notes';

export async function clearNotes() {
  await AsyncStorage.removeItem(NOTES_KEY);
}

export async function restoreNote(note) {
  await updateNotes((notes) => {
    if (notes.some((item) => item.id === note.id)) return notes;
    return [note, ...notes];
  });
}

export async function saveNotes(notes) {
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

let notesQueue = Promise.resolve();

export async function updateNotes(update) {
  const operation = notesQueue.then(async () => {
    const notes = await loadNotes();
    const updatedNotes = await update(notes);
    await saveNotes(updatedNotes);
    return updatedNotes;
  });

  notesQueue = operation.catch(() => {});
  return operation;
}

export async function loadNotes() {
  const storedNotes = await AsyncStorage.getItem(NOTES_KEY);
  if (!storedNotes) return [];

  let notes;
  try {
    notes = JSON.parse(storedNotes);
  } catch {
    await AsyncStorage.removeItem(NOTES_KEY);
    return [];
  }

  if (!Array.isArray(notes)) return [];

  return notes.map((note) => ({
    ...note,
    id: String(note.id || ''),
    title: typeof note.title === 'string' ? note.title : '',
    body: typeof note.body === 'string' ? note.body : '',
    color: typeof note.color === 'string' ? note.color : NOTE_COLORS[0],
    pinned: Boolean(note.pinned),
    favorite: Boolean(note.favorite),
    createdAt: note.createdAt || new Date().toISOString(),
    editedAt: note.editedAt || note.createdAt || new Date().toISOString(),
  }));
}
