import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import { useTheme } from '../utils/ThemeContext';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Notes' }} />
      <Stack.Screen
        name="Editor"
        component={NoteEditorScreen}
        options={{
          title: 'Note',
          headerBackImage: () => (
            <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
          ),
        }}
      />
    </Stack.Navigator>
  );
}