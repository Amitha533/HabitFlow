import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.body.className = isDark ? 'dark' : 'light';
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);