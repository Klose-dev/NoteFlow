import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../components/LoadingSpinner';
import { darkTheme, lightTheme } from './themeColors';

const THEME_KEY = 'themePreference';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system');
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(THEME_KEY)
      .then((storedTheme) => {
        if (!mounted) return;
        if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
          setTheme(storedTheme);
        }
      })
      .catch((error) => {
        console.error('Failed to load theme preference', error);
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => subscription.remove();
  }, []);

  async function changeTheme(nextTheme) {
    setTheme(nextTheme);
    await AsyncStorage.setItem(THEME_KEY, nextTheme);
  }

  const resolvedTheme = theme === 'system' ? systemScheme : theme;
  const colors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const value = useMemo(
    () => ({ theme, setTheme: changeTheme, colors }),
    [colors, theme],
  );

  if (!isReady) return <LoadingSpinner colors={lightTheme} />;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}