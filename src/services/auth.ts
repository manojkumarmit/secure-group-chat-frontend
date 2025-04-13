/**
 * Authentication service functions for handling login and registration
 */

const API_URL = '/api';

/**
 * Attempts to log in a user with email and password
 * @param email User's email address
 * @param password User's password
 * @returns Promise resolving to the login response data
 * @throws Error if login request fails
 */
export const login = async (email: string, password: string, role: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) throw new Error('Login failed');
    return response.json();
};

/**
 * Registers a new user account
 * @param name User's display name
 * @param email User's email address  
 * @param password User's password
 * @returns Promise resolving to the registration response data
 * @throws Error if registration request fails
 */
export const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) throw new Error('Registration failed');
    return response.json();
};