import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import GroupList from './components/GroupList';
import Chat from './pages/Chat';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Group {
  _id: string;
  name: string;
  creator: string;
  members: User[];
  id: string;
}

/**
 * App component for managing the main application routes and authentication context.
 * 
 * This component sets up the main application structure, including the router and routes for different pages.
 * It also wraps the application with the AuthProvider to provide authentication context to all components.
 * 
 * The App component defines the following routes:
 * - /login: Renders the Login component for user authentication.
 * - /register: Renders the Register component for user registration.
 * - /groups: Renders the GroupListWrapper component for displaying and managing user groups.
 * 
 * The App component uses the following components:
 * - AuthProvider: Provides authentication context to the application.
 * - Router: Sets up the router for handling navigation between different routes.
 * - Routes: Defines the routes for the application.
 * - Route: Defines individual routes and their corresponding components.
 * 
 * The GroupListWrapper component is used to manage the state of the active group and handle navigation between
 * the group list and the chat view. It uses the useAuth hook to access the current user and token from the
 * authentication context.
 * 
 * The GroupListWrapper component defines the following state:
 * - activeGroup: The currently active group object or null if no group is active.
 * 
 * The GroupListWrapper component uses the following effects:
 * - useEffect: Resets the activeGroup state when navigating back to the /groups route.
 * 
 * The GroupListWrapper component renders the following components based on the state:
 * - Navigate: Redirects to the /login route if the user is not authenticated.
 * - Chat: Renders the Chat component if an active group is selected.
 * - GroupList: Renders the GroupList component if no active group is selected.
 * 
 * The GroupListWrapper component uses the following functions:
 * - setActiveGroup: Sets the active group state to the specified group object.
 * - onBack: Callback function to handle back navigation from the chat view to the group list view.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/groups" element={<GroupListWrapper />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function GroupListWrapper() {
  const { user, token } = useAuth();
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Reset activeGroup when navigating back to /groups
    if (location.pathname === '/groups') {
      setActiveGroup(null);
    }
  }, [location.pathname]);

  if (!user || !token) {
    return <Navigate to="/login" />;
  }

  if (activeGroup) {
    return <Chat
      group={activeGroup}
      user={user}
      token={token}
      onBack={() => setActiveGroup(null)}
    />;
  }

  return (
    <GroupList
      user={user}
      token={token}
      onEnterGroup={(group: Group) => setActiveGroup(group)}
    />
  );
}

export default App;