import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SORT_OPTIONS } from '../utils/noteSorting';
import { useTheme } from '../utils/ThemeContext';

export default function SortMenu({ visible, selected, onSelect, onClose }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.menu}>
          <Text style={styles.heading}>Sort notes</Text>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity key={option.key} style={styles.option} onPress={() => onSelect(option.key)}>
              <Text style={styles.optionText}>{option.label}</Text>
              {selected === option.key && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    overlay: { alignItems: 'flex-end', backgroundColor: colors.overlay, flex: 1, padding: 18, paddingTop: 90 },
    menu: { backgroundColor: colors.surface, borderColor: colors.divider, borderWidth: 1, padding: 16, width: 220 },
    heading: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8 },
    option: { alignItems: 'center', borderTopColor: colors.divider, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13 },
    optionText: { color: colors.textPrimary, fontSize: 15 },
  });
}