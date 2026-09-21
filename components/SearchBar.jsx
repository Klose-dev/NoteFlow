import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

export default function SearchBar({ onSearchChange }) {
  const { colors } = useTheme();
  const [text, setText] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => onSearchChange(text), 250);
    return () => clearTimeout(timeoutId);
  }, [onSearchChange, text]);

  function handleClear() {
    setText('');
    onSearchChange('');
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
      <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        value={text}
        onChangeText={setText}
        placeholder="Search notes"
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
      />
      {text.length > 0 && (
        <TouchableOpacity onPress={handleClear} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    margin: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
});