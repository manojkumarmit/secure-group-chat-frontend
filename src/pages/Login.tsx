import React, { useState } from 'react';
import { login } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Login component handles the user login functionality.
 * 
 * This component maintains the state for email and password input fields,
 * and uses the AuthContext to log in the user upon form submission.
 * 
 * The component consists of:
 * - State variables for email and password.
 * - A handleSubmit function that handles the form submission.
 * - A form with input fields for email and password, and a submit button.
 * 
 * The handleSubmit function:
 * - Prevents the default form submission behavior.
 * - Calls the login function with the email, password, and role.
 * - If login is successful, it calls loginUser from AuthContext with the user and token,
 *   and navigates to the '/groups' page.
 * - If login fails, it displays an alert with an error message.
 * 
 * The form includes:
 * - An email input field with validation and autoComplete set to "username".
 * - A password input field with validation and autoComplete set to "current-password".
 * - A submit button that triggers the handleSubmit function.
 */
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role] = useState('user');
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await login(email, password, role);
            loginUser(res.user, res.token);
            navigate('/groups');
        } catch {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Sign in to Chat</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Sign In
                    </button>
                </form>
                <p className="text-center mt-4 text-sm text-gray-500">
                    Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
                </p>
            </div>
        </div>
    );
};

export default Login;