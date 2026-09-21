import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NoteItem from '../components/NoteItem';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { loadNotes, updateNotes } from '../utils/storage';
import { filterNotesByTitle } from '../utils/noteFilters';
import { sortNotes } from '../utils/noteSorting';
import SortMenu from '../components/SortMenu';
import { useTheme } from '../utils/ThemeContext';
import { clearDeletedNote, getDeletedNote, saveDeletedNote } from '../utils/undoStorage';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('edited');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [deletedNote, setDeletedNote] = useState(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadNotes(), getDeletedNote()])
        .then(([loadedNotes, lastDeletedNote]) => {
          setNotes(loadedNotes);
          setDeletedNote(lastDeletedNote);
        })
        .catch((error) => {
          console.error('Failed to load home data', error);
        });
    }, []),
  );

  const visibleNotes = sortNotes(filterNotesByTitle(notes, searchQuery), sortBy);

  async function handleUndo() {
    if (!deletedNote) return;

    try {
      const restoredNote = deletedNote;
      const updatedNotes = await updateNotes((currentNotes) => (
        currentNotes.some((item) => item.id === restoredNote.id)
          ? currentNotes
          : [restoredNote, ...currentNotes]
      ));
      await clearDeletedNote();
      setNotes(updatedNotes);
      setDeletedNote(null);
    } catch (error) {
      console.error('Failed to undo note deletion', error);
    }
  }

  async function handleTogglePin(note) {
    try {
      const updatedNotes = await updateNotes((currentNotes) => (
        currentNotes.map((item) => (
          item.id === note.id ? { ...item, pinned: !item.pinned } : item
        ))
      ));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Failed to update note pin state', error);
    }
  }

  async function handleToggleFavorite(note) {
    try {
      const updatedNotes = await updateNotes((currentNotes) => (
        currentNotes.map((item) => (
          item.id === note.id ? { ...item, favorite: !item.favorite } : item
        ))
      ));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Failed to update note favorite state', error);
    }
  }

  async function handleDelete(note) {
    let deletedNoteSnapshot = null;

    try {
      const updatedNotes = await updateNotes((currentNotes) => {
        deletedNoteSnapshot = currentNotes.find((item) => item.id === note.id) || null;
        return currentNotes.filter((item) => item.id !== note.id);
      });

      if (deletedNoteSnapshot) {
        await saveDeletedNote(deletedNoteSnapshot);
        setDeletedNote(deletedNoteSnapshot);
      }
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.noteCount}>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</Text>
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortMenu(true)} accessibilityLabel="Sort notes">
          <Ionicons name="swap-vertical-outline" size={18} color={colors.primary} />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>
      <SearchBar onSearchChange={setSearchQuery} />
      {visibleNotes.length === 0 ? (
        <EmptyState filtered={notes.length > 0 && searchQuery.trim().length > 0} />
      ) : (
        <FlatList
          data={visibleNotes}
          keyExtractor={(note) => note.id}
          renderItem={({ item }) => (
            <NoteItem
              note={item}
              onPress={() => navigation.navigate('Editor', { note: item })}
              onTogglePin={handleTogglePin}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
            />
          )}
        />
      )}

      {deletedNote && (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>Note deleted</Text>
          <TouchableOpacity onPress={handleUndo}><Text style={styles.undoAction}>Undo</Text></TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Editor')}
        accessibilityLabel="Add note"
      >
        <Ionicons name="add-circle" size={64} color={colors.primary} />
      </TouchableOpacity>
      <SortMenu
        visible={showSortMenu}
        selected={sortBy}
        onSelect={(option) => { setSortBy(option); setShowSortMenu(false); }}
        onClose={() => setShowSortMenu(false)}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  addButton: {
    bottom: 24,
    position: 'absolute',
    right: 20,
  },
  toolbar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10 },
  noteCount: { color: colors.textSecondary, fontSize: 13 },
  sortButton: { alignItems: 'center', flexDirection: 'row', padding: 4 },
  sortText: { color: colors.primary, fontSize: 13, marginLeft: 5 },
  undoBar: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.divider, borderWidth: 1, bottom: 90, flexDirection: 'row', justifyContent: 'space-between', left: 16, padding: 12, position: 'absolute', right: 16 },
  undoText: { color: colors.textPrimary, fontSize: 14 },
  undoAction: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  });
}