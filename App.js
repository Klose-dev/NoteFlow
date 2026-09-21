import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import { ThemeProvider } from './utils/ThemeContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <ThemeProvider>
        <NavigationContainer>
          <BottomTabNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
