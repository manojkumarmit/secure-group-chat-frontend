# Secure Group Chat Application

## Overview

The Secure Group Chat Application is a web-based platform that allows users to create, join, and participate in group chats securely. The application ensures secure communication through the use of signed URLs for media files and encrypted messages. It also provides user authentication and authorization features.

## Features

- **User Registration and Authentication**: Users can register for an account and log in using their email and password.
- **Group Management**: Users can create new groups, join existing groups, leave groups, and transfer group ownership.
- **Real-time Messaging**: Users can send and receive messages in real-time within their groups.
- **File Sharing**: Users can share files securely within the chat using signed URLs.
- **Smart Replies**: The application provides smart reply suggestions to enhance the user experience.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Authentication**: JSON Web Tokens (JWT)
- **Database**: MongoDB
- **Real-time Communication**: Socket.io

## Project Structure

- `src/components`: Contains reusable React components such as `GroupList`.
- `src/pages`: Contains page components such as `Register` and `Chat`.
- `src/services`: Contains service functions for handling authentication and other API requests.
- `src/hooks`: Contains custom React hooks such as `useSignedURLs`.
- `src/context`: Contains context providers such as `AuthContext`.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/manojkumarmit/secure-group-chat-frontend.git
   cd secure-group-chat-frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:
   ```env
   VITE_OPENAI_API_KEY=your_vite_openai_api_key
   VITE_SOCKET_URL=your_vite_socket_url
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## Usage

### User Registration

1. Navigate to the registration page.
2. Fill in the required fields (name, email, password).
3. Submit the form to create a new account.

### User Login

1. Navigate to the login page.
2. Enter your email and password.
3. Submit the form to log in.

### Group Management

- **Create a Group**: Enter a group name and click the "Create Group" button.
- **Join a Group**: Select a group from the list and click the "Join Group" button.
- **Leave a Group**: Click the "Leave Group" button next to the group you want to leave.
- **Transfer Ownership**: Select a new owner from the group members and click the "Transfer Ownership" button.

### Messaging

- **Send a Message**: Type your message in the input field and press Enter or click the "Send" button.
- **Share a File**: Click the "Attach File" button, select a file, and click the "Send" button.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push the branch to your fork.
4. Create a pull request with a detailed description of your changes.

## Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io](https://socket.io/)
- [MongoDB](https://www.mongodb.com/)

## Contact

For any questions or inquiries, please contact [manojkumar29it@gmail.com].
