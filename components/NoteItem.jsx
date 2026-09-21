import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { formatRelativeTime } from '../utils/timeUtils';
import { getNoteColor } from '../utils/noteColors';
import { useTheme } from '../utils/ThemeContext';

export default function NoteItem({ note, onPress, onTogglePin, onToggleFavorite, onDelete }) {
  const { colors } = useTheme();
  const [now, setNow] = useState(Date.now());
  const styles = createStyles(colors);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(intervalId);
  }, []);

  function renderActions() {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity style={styles.favoriteAction} onPress={() => onToggleFavorite(note)}>
          <Ionicons name={note.favorite ? 'heart' : 'heart-outline'} size={20} color={colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.pinAction} onPress={() => onTogglePin(note)}>
          <Ionicons name={note.pinned ? 'pin-outline' : 'pin'} size={20} color={colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteAction} onPress={() => onDelete(note)}>
          <Ionicons name="trash-outline" size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Swipeable renderRightActions={renderActions}>
      <TouchableOpacity
        style={[styles.container, { borderLeftColor: getNoteColor(note) }]}
        onPress={onPress}
      >
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>{note.title || 'Untitled note'}</Text>
        <View style={styles.trailingIcons}>
          {note.favorite && <Ionicons name="heart" size={15} color={colors.danger} />}
          {note.pinned && <Ionicons name="pin" size={15} color={colors.primary} />}
        </View>
      </View>
      <Text style={styles.preview} numberOfLines={1}>
        {note.body || 'No content'}
      </Text>
      <Text style={styles.timestamp}>Edited {formatRelativeTime(note.editedAt, now)}</Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.divider,
    borderBottomWidth: 1,
    borderLeftWidth: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  titleRow: { alignItems: 'center', flexDirection: 'row' },
  trailingIcons: { alignItems: 'center', flexDirection: 'row', gap: 5, marginLeft: 'auto', paddingLeft: 8 },
  swipeActions: { flexDirection: 'row' },
  favoriteAction: { alignItems: 'center', backgroundColor: colors.danger, justifyContent: 'center', width: 60 },
  pinAction: { alignItems: 'center', backgroundColor: colors.primary, justifyContent: 'center', width: 60 },
  deleteAction: { alignItems: 'center', backgroundColor: colors.danger, justifyContent: 'center', width: 60 },
  preview: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  });
}