import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportNotes } from '../utils/ExportNotes';
import { importNotesFromJson } from '../utils/ImportNotes';
import { clearNotes, loadNotes, updateNotes } from '../utils/storage';
import { getNoteColor } from '../utils/noteColors';
import { useTheme } from '../utils/ThemeContext';

export default function SettingsScreen() {
  const { theme, setTheme, colors } = useTheme();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const styles = createStyles(colors);

  async function handleExport(format) {
    const notes = await loadNotes();
    await exportNotes(notes, format);
  }

  async function handleClear() {
    await clearNotes();
    setShowClearDialog(false);
    Alert.alert('Notes cleared', 'All notes have been removed.');
  }

  async function handleImport() {
    try {
      const importedNotes = await importNotesFromJson();
      if (!importedNotes) return;

      const importedAt = new Date().toISOString();
      const normalizedNotes = importedNotes
        .filter((note) => note && typeof note === 'object')
        .map((note, index) => ({
          ...note,
          id: note.id == null ? `${Date.now()}-${index}` : String(note.id),
          title: typeof note.title === 'string' ? note.title : '',
          body: typeof note.body === 'string' ? note.body : '',
          color: getNoteColor(note),
          pinned: Boolean(note.pinned),
          favorite: Boolean(note.favorite),
          createdAt: note.createdAt || importedAt,
          editedAt: note.editedAt || note.createdAt || importedAt,
        }));
      let addedNotes = [];

      const updatedNotes = await updateNotes((currentNotes) => {
        const existingIds = new Set(currentNotes.map((note) => note.id));
        addedNotes = normalizedNotes.filter((note) => !existingIds.has(note.id));
        return [...addedNotes, ...currentNotes];
      });

      Alert.alert('Notes imported', `${addedNotes.length} note${addedNotes.length === 1 ? '' : 's'} added.`);
    } catch (error) {
      Alert.alert('Import failed', error.message || 'Choose a valid JSON export file.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.selector}>
        {['system', 'light', 'dark'].map((option) => (
          <TouchableOpacity key={option} style={styles.option} onPress={() => setTheme(option)}>
            <Ionicons
              name={theme === option ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={theme === option ? colors.primary : colors.textSecondary}
            />
            <Text style={styles.optionText}>{option[0].toUpperCase() + option.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Data</Text>
      <TouchableOpacity style={styles.actionButton} onPress={() => handleExport('text')}>
        <Text style={styles.actionText}>Export all notes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => handleExport('json')}>
        <Text style={styles.secondaryText}>Export as JSON</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={handleImport}>
        <Text style={styles.secondaryText}>Import JSON notes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dangerButton} onPress={() => setShowClearDialog(true)}>
        <Text style={styles.dangerText}>Clear all notes</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.about}>
        <View style={styles.aboutHeader}>
          <View style={styles.logoMark}>
            <Ionicons name="document-text" size={28} color={colors.onPrimary} />
          </View>
          <View style={styles.aboutHeadingBlock}>
            <Text style={styles.aboutTitle}>NoteFlow</Text>
            <Text style={styles.versionText}>Version 3.0.0  •  Local-first</Text>
          </View>
        </View>
        <Text style={styles.aboutDescription}>
          A calm space for ideas, built to keep your notes close and your thinking clear.
        </Text>
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Ionicons name="flash-outline" size={18} color={colors.primary} />
            <Text style={styles.featureText}>Fast</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
            <Text style={styles.featureText}>Private</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="color-palette-outline" size={18} color={colors.primary} />
            <Text style={styles.featureText}>Yours</Text>
          </View>
        </View>
        <View style={styles.creditRow}>
          <Ionicons name="heart" size={16} color={colors.danger} />
          <Text style={styles.creditText}>Developed by Akongseh Klose</Text>
        </View>
      </View>
      <ConfirmDialog
        visible={showClearDialog}
        title="Clear all notes?"
        onCancel={() => setShowClearDialog(false)}
        onConfirm={handleClear}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { backgroundColor: colors.background, flex: 1, padding: 20 },
    heading: { color: colors.textPrimary, fontSize: 28, fontWeight: '700', marginBottom: 24 },
    sectionTitle: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 20 },
    selector: { backgroundColor: colors.surface, borderColor: colors.divider, borderWidth: 1 },
    option: { alignItems: 'center', borderBottomColor: colors.divider, borderBottomWidth: 1, flexDirection: 'row', padding: 14 },
    optionText: { color: colors.textPrimary, fontSize: 16, marginLeft: 10 },
    actionButton: { alignItems: 'center', backgroundColor: colors.primary, padding: 15 },
    actionText: { color: colors.onPrimary, fontWeight: '700' },
    secondaryButton: { alignItems: 'center', borderColor: colors.primary, borderWidth: 1, marginTop: 10, padding: 15 },
    secondaryText: { color: colors.primary, fontWeight: '700' },
    dangerButton: { alignItems: 'center', borderColor: colors.danger, borderWidth: 1, marginTop: 10, padding: 15 },
    dangerText: { color: colors.danger, fontWeight: '700' },
    about: {
      backgroundColor: colors.surface,
      borderColor: colors.divider,
      borderWidth: 1,
      padding: 18,
    },
    aboutHeader: { alignItems: 'center', flexDirection: 'row' },
    logoMark: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      height: 52,
      justifyContent: 'center',
      width: 52,
    },
    aboutHeadingBlock: { marginLeft: 14 },
    aboutTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
    versionText: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
    aboutDescription: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 18 },
    featureRow: { borderBottomColor: colors.divider, borderBottomWidth: 1, borderTopColor: colors.divider, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, paddingVertical: 14 },
    featureItem: { alignItems: 'center', flexDirection: 'row' },
    featureText: { color: colors.textPrimary, fontSize: 12, marginLeft: 5 },
    creditRow: { alignItems: 'center', flexDirection: 'row', marginTop: 16 },
    creditText: { color: colors.textSecondary, fontSize: 13, marginLeft: 7 },
  });
}