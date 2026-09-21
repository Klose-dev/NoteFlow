import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = 'noteDraft';

export async function saveDraft(draft) {
  await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export async function loadDraft() {
  const draft = await AsyncStorage.getItem(DRAFT_KEY);
  return draft ? JSON.parse(draft) : null;
}

export async function clearDraft() {
  await AsyncStorage.removeItem(DRAFT_KEY);
}