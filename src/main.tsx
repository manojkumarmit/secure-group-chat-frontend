import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * This is the entry point of the application.
 * 
 * The following steps are performed in this file:
 * 1. Import necessary modules and components.
 * 2. Import global CSS styles.
 * 3. Create a root element for rendering the React application.
 * 4. Render the App component within a StrictMode wrapper.
 * 
 * The StrictMode wrapper is used to highlight potential problems in the application.
 * It activates additional checks and warnings for its descendants.
 * 
 * The App component is the root component of the application, which contains the main structure and routing.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
