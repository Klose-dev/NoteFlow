import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

export default function EmptyState({ filtered = false }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Ionicons
        name={filtered ? 'search-outline' : 'document-text-outline'}
        size={64}
        color={colors.textSecondary}
      />
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {filtered ? 'No notes match your search' : 'No notes yet tap + to add one'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  message: {
    fontSize: 16,
    marginTop: 12,
  },
});