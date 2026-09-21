import * as DocumentPicker from 'expo-document-picker';

export async function importNotesFromJson() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    base64: false,
  });

  if (result.canceled) return null;
  if (!result.assets?.[0]?.uri) throw new Error('No file was selected.');

  const response = await fetch(result.assets[0].uri);
  const parsedNotes = JSON.parse(await response.text());
  if (!Array.isArray(parsedNotes)) throw new Error('The selected file is not a notes JSON array.');
  return parsedNotes;
}