import AsyncStorage from '@react-native-async-storage/async-storage';

const UNDO_KEY = 'lastDeletedNote';

export async function saveDeletedNote(note) {
  await AsyncStorage.setItem(UNDO_KEY, JSON.stringify(note));
}

export async function getDeletedNote() {
  const note = await AsyncStorage.getItem(UNDO_KEY);
  return note ? JSON.parse(note) : null;
}

export async function clearDeletedNote() {
  await AsyncStorage.removeItem(UNDO_KEY);
}