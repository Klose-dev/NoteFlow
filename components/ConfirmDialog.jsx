import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

export default function ConfirmDialog({ visible, title, onCancel, onConfirm }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: colors.surface,
    padding: 22,
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    borderColor: colors.divider,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  confirmText: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  });
}