// /src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loginUser: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

/**
 * AuthContext provides authentication state and functions to manage user authentication.
 * 
 * Context Properties:
 * - user: The current authenticated user object or null if not authenticated.
 * - token: The authentication token for API requests or null if not authenticated.
 * - loginUser: Function to log in a user. Takes a user object and a token string as arguments.
 * - logout: Function to log out the current user. Clears the user and token from state and localStorage.
 * 
 * Usage:
 * - Wrap your application with AuthProvider to provide authentication context to your components.
 * - Use the useAuth hook to access authentication state and functions within your components.
 * 
 * Example:
 * 
 * const { user, token, loginUser, logout } = useAuth();
 * 
 * if (user) {
 *   console.log(`Logged in as ${user.name}`);
 * }
 * 
 * loginUser({ id: '1', name: 'John Doe', email: 'john@example.com' }, 'your-token');
 * 
 * logout();
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user);
      setToken(parsed.token);
    }
  }, []);

  const loginUser = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('auth', JSON.stringify({ user, token }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;