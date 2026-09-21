import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../utils/ThemeContext';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = route.name === 'Home'
            ? focused ? 'home' : 'home-outline'
            : focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}