import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Platform, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfirmDialog from '../components/ConfirmDialog';
import { getNoteColor, NOTE_COLORS } from '../utils/noteColors';
import { updateNotes } from '../utils/storage';
import { saveDraft, loadDraft, clearDraft } from '../utils/draftStorage';
import { saveDeletedNote } from '../utils/undoStorage';
import { useTheme } from '../utils/ThemeContext';
import { formatRelativeTime } from '../utils/timeUtils';

export default function NoteEditorScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const existingNote = route.params?.note;
  const [title, setTitle] = useState(existingNote?.title || '');
  const [body, setBody] = useState(existingNote?.body || '');
  const [color, setColor] = useState(getNoteColor(existingNote));
  const [isPinned, setIsPinned] = useState(Boolean(existingNote?.pinned));
  const [isFavorite, setIsFavorite] = useState(Boolean(existingNote?.favorite));
  const [createdAt, setCreatedAt] = useState(existingNote?.createdAt || new Date().toISOString());
  const [wordCount, setWordCount] = useState((existingNote?.body || '').trim().split(/\s+/).filter(Boolean).length);
  const [lastSaved, setLastSaved] = useState(existingNote?.editedAt ? new Date(existingNote.editedAt) : null);
  const [now, setNow] = useState(Date.now());
  const [dialog, setDialog] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(Boolean(existingNote));
  const [baseNote, setBaseNote] = useState(existingNote ? { ...existingNote, favorite: Boolean(existingNote.favorite) } : null);
  const pendingNavigationRef = useRef(null);
  const allowNavigationRef = useRef(false);
  const savingRef = useRef(false);

  const isDirty =
    title !== (baseNote?.title || '') ||
    body !== (baseNote?.body || '') ||
    color !== (baseNote?.color || NOTE_COLORS[0]) ||
    isPinned !== Boolean(baseNote?.pinned) ||
    isFavorite !== Boolean(baseNote?.favorite);

  const currentBaseNote = baseNote || (existingNote ? { ...existingNote, favorite: Boolean(existingNote.favorite) } : null);
  const activeNoteId = existingNote?.id || currentBaseNote?.id;
  const displayedDate = currentBaseNote?.editedAt || createdAt;
  const timeLabel = existingNote ? 'Edited' : lastSaved ? 'Saved' : 'Created';

  useEffect(() => {
    let mounted = true;

    loadDraft()
      .then((draft) => {
        if (!mounted || existingNote || !draft) return;

        setTitle(draft.title || '');
        setBody(draft.body || '');
        setColor(draft.color || NOTE_COLORS[0]);
        setIsPinned(Boolean(draft.pinned));
        setIsFavorite(Boolean(draft.favorite));
        setCreatedAt(draft.createdAt || new Date().toISOString());
      })
      .catch((error) => {
        console.error('Failed to load note draft', error);
      })
      .finally(() => {
        if (mounted) setDraftLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, [existingNote]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!existingNote && draftLoaded) {
        saveDraft({ title, body, color, pinned: isPinned, favorite: isFavorite, createdAt }).catch((error) => {
          console.error('Failed to save note draft', error);
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [body, color, createdAt, draftLoaded, existingNote, isFavorite, isPinned, title]);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(intervalId);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: existingNote ? 'Edit note' : 'New note',
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityRole="button"
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.danger : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            accessibilityLabel="Share note"
            accessibilityRole="button"
            disabled={isSaving}
          >
            <Ionicons name="share-outline" size={22} color={isSaving ? colors.textSecondary : colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone} disabled={isSaving}>
            <Text style={[styles.doneText, isSaving && styles.disabledText]}>{isSaving ? 'Saving...' : 'Done'}</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [activeNoteId, colors, createdAt, color, existingNote, isFavorite, isPinned, isSaving, navigation, title, body]);

  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (!isDirty || allowNavigationRef.current) return;

      event.preventDefault();
      pendingNavigationRef.current = event.data.action;
      setDialog({ title: 'Discard changes?', onConfirm: handleDiscard });
    });
  }, [isDirty, navigation]);

  function updateBody(nextBody) {
    setBody(nextBody);
    setWordCount(nextBody.trim().split(/\s+/).filter(Boolean).length);
  }

  async function saveCurrentNote() {
    if (savingRef.current) return null;

    savingRef.current = true;
    setIsSaving(true);

    try {
      const editedAt = new Date().toISOString();
      const note = {
        id: activeNoteId || Date.now().toString(),
        title: title.trim(),
        body: body.trim(),
        color,
        pinned: isPinned,
        favorite: isFavorite,
        createdAt,
        editedAt,
      };
      const updatedNotes = await updateNotes((notes) => (
        notes.some((item) => item.id === note.id)
          ? notes.map((item) => (item.id === note.id ? note : item))
          : [note, ...notes]
      ));
      const savedNote = updatedNotes.find((item) => item.id === note.id) || note;

      await clearDraft();
      setBaseNote(savedNote);
      setLastSaved(new Date(editedAt));
      return savedNote;
    } catch (error) {
      Alert.alert('Could not save note', error.message || 'Please try again.');
      return null;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  async function handleDone() {
    const note = await saveCurrentNote();
    if (!note) return;

    allowNavigationRef.current = true;
    navigation.goBack();
  }

  async function handleToggleFavorite() {
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);

    if (!activeNoteId) return;

    try {
      const updatedNotes = await updateNotes((notes) => (
        notes.map((item) => (
          item.id === activeNoteId ? { ...item, favorite: nextFavorite } : item
        ))
      ));
      const savedNote = updatedNotes.find((item) => item.id === activeNoteId);
      if (savedNote) setBaseNote(savedNote);
    } catch (error) {
      setIsFavorite(!nextFavorite);
      Alert.alert('Could not update favorite', error.message || 'Please try again.');
    }
  }

  async function handleShare() {
    const message = [title.trim(), body.trim()].filter(Boolean).join('\n\n');
    if (!message) {
      Alert.alert('Nothing to share', 'Write some content before sharing this note.');
      return;
    }

    const note = await saveCurrentNote();
    if (!note) return;

    try {
      await Share.share({
        message,
        title: note.title || 'NoteFlow note',
      });
    } catch (error) {
      Alert.alert('Could not share note', error.message || 'Please try again.');
    }
  }

  function handleDiscard() {
    allowNavigationRef.current = true;
    setDialog(null);

    clearDraft()
      .catch((error) => {
        console.error('Failed to clear note draft', error);
      })
      .finally(() => {
        if (pendingNavigationRef.current) {
          navigation.dispatch(pendingNavigationRef.current);
          pendingNavigationRef.current = null;
        }
      });
  }

  function handleCancelDialog() {
    pendingNavigationRef.current = null;
    setDialog(null);
  }

  async function confirmDelete() {
    try {
      let deletedNoteSnapshot = existingNote;
      await updateNotes((notes) => {
        const storedNote = notes.find((item) => item.id === existingNote.id);
        if (storedNote) deletedNoteSnapshot = storedNote;
        return notes.filter((item) => item.id !== existingNote.id);
      });
      await saveDeletedNote(deletedNoteSnapshot);
      await clearDraft();
      allowNavigationRef.current = true;
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not delete note', error.message || 'Please try again.');
    }
  }

  function handleDelete() {
    setDialog({ title: 'Delete this note?', onConfirm: confirmDelete });
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={colors.textSecondary}
        singleLine
      />
      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={15} color={colors.textSecondary} />
        <Text style={styles.timeText}>{timeLabel} {formatRelativeTime(displayedDate, now)}</Text>
      </View>
      <TextInput
        style={styles.bodyInput}
        value={body}
        onChangeText={updateBody}
        placeholder="Write your note..."
        placeholderTextColor={colors.textSecondary}
        multiline
        textAlignVertical={Platform.select({ android: 'top' })}
      />
      <View style={styles.editorMeta}>
        <Text style={styles.wordCount}>{wordCount} {wordCount === 1 ? 'word' : 'words'}</Text>
        <TouchableOpacity style={styles.pinButton} onPress={() => setIsPinned(!isPinned)}>
          <Ionicons name={isPinned ? 'pin' : 'pin-outline'} size={18} color={isPinned ? colors.primary : colors.textSecondary} />
          <Text style={styles.pinText}>{isPinned ? 'Pinned' : 'Pin note'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.colorRow}>
        {NOTE_COLORS.map((tagColor) => (
          <TouchableOpacity
            key={tagColor}
            style={styles.colorButton}
            onPress={() => setColor(tagColor)}
            accessibilityLabel={`Choose ${tagColor} tag`}
          >
            <View
              style={[
                styles.colorDot,
                { backgroundColor: tagColor },
                color === tagColor && { borderColor: colors.textPrimary, borderWidth: 2 },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
      {existingNote && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      )}
      <ConfirmDialog
        visible={Boolean(dialog)}
        title={dialog?.title || ''}
        onCancel={handleCancelDialog}
        onConfirm={dialog?.onConfirm || (() => {})}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
      padding: 20,
    },
    headerActions: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
      paddingRight: 8,
    },
    doneButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    doneText: {
      color: colors.onPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    disabledText: {
      opacity: 0.6,
    },
    titleInput: {
      backgroundColor: colors.surface,
      borderBottomColor: colors.divider,
      borderBottomWidth: 1,
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '700',
      padding: 14,
    },
    timeRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 5,
      marginTop: 8,
    },
    timeText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    bodyInput: {
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      flex: 1,
      fontSize: 16,
      marginTop: 12,
      padding: 14,
    },
    editorMeta: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    wordCount: { color: colors.textSecondary, fontSize: 12 },
    pinButton: { alignItems: 'center', flexDirection: 'row', paddingVertical: 6 },
    pinText: { color: colors.textSecondary, fontSize: 12, marginLeft: 5 },
    colorRow: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: 12,
    },
    colorButton: {
      padding: 6,
    },
    colorDot: {
      borderRadius: 10,
      height: 20,
      width: 20,
    },
    deleteButton: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderColor: colors.danger,
      borderWidth: 1,
      marginTop: 10,
      padding: 15,
    },
    deleteText: {
      color: colors.danger,
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
