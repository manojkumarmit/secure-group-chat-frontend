import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import socket from "../services/socket";
import { encryptMessage, decryptMessage } from '../util/encrypt';
import useSignedURLs from '../hooks/useSignedURLs';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  user: User;
  text: string;
  time: string;
  mediaUrl?: string;
  mediaType?: string;
  readBy?: string[]; // usernames
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Group {
  _id: string;
  id: string;
  name: string;
  members: User[];
}

interface ChatProps {
  group: Group;
  user: User;
  token: string;
  onBack: () => void;
}

/**
 * Chat component for displaying and managing group chat messages.
 * 
 * Props:
 * - group: The group object containing group details and members.
 * - user: The current user object.
 * - token: The authentication token for API requests.
 * - onBack: Callback function to handle back navigation.
 * 
 * State:
 * - messages: Array of message objects representing the chat messages.
 * - newMessage: String representing the new message input by the user.
 * - typingUser: String representing the user who is currently typing.
 * - file: File object representing the file to be sent in the chat.
 * - processedMessages: Set of message IDs that have been processed to avoid duplicates.
 * - smartReplies: Array of smart reply suggestions.
 * 
 * Refs:
 * - messagesEndRef: Ref to the end of the messages container for scrolling.
 * 
 * Functions:
 * - fetchMessages: Fetches messages for the current group from the API.
 * - isMe: Checks if a message was sent by the current user.
 * 
 * Effects:
 * - useEffect to fetch messages when the component mounts or the group changes.
 * - useEffect to handle socket connection and events.
 */
const Chat: React.FC<ChatProps> = ({ group, user, token, onBack }) => {
  const { logout } = useAuth();
  const currentUser = user?.name || 'anonymous';
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [processedMessages] = useState(new Set<string>());
  const isMe = (msg: Message) => msg.user && msg.user.id === user?.id;
  const [smartReplies, setSmartReplies] = useState([]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups/${group._id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [group._id, token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    socket.auth = { token };
    socket.connect();

    socket.on("connect", () => {
      socket.emit("joinGroup", group._id);
    });

    socket.on("chat message", async (msg: Message & { groupId: string }) => {
      if (msg.groupId === group._id && !processedMessages.has(msg.id)) {
        processedMessages.add(msg.id);
        const decryptedText = decryptMessage(msg.text);
        setMessages((prev) => [...prev, { ...msg, text: decryptedText }]);
        scrollToBottom();

        // Call handleIncomingMessage to fetch smart replies
        const replies = await fetchSmartReplies(msg.text);
        setSmartReplies(replies);
      }
    });

    socket.on("user typing", ({ user: typingUser, groupId }) => {
      if (groupId === group._id) {
        setTypingUser(typingUser);
        setTimeout(() => setTypingUser(""), 3000);
      }
    });

    socket.on("messageRead", ({ messageId, user: readByUser, groupId }) => {
      if (groupId === group._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId && !msg.readBy?.includes(readByUser)
              ? { ...msg, readBy: [...(msg.readBy || []), readByUser] }
              : msg
          )
        );
      }
    });

    return () => {
      socket.emit("leaveGroup", group._id);
      socket.off("chat message");
      socket.off("user typing");
      socket.off("messageRead");
      socket.disconnect();
    };
  }, [group._id, token, processedMessages]);

  useEffect(() => {
    const unreadMessages = messages.filter(msg =>
      msg.user && msg.user.id !== user.id && !msg.readBy?.includes(currentUser)
    );

    unreadMessages.forEach(msg => {
      socket.emit('read receipt', {
        messageId: msg.id,
        user: currentUser,
        groupId: group._id
      });
    });
  }, [messages, currentUser, group._id, user.id]);

  const mediaUrls = useMemo(() => messages.map(msg => msg.mediaUrl), [messages]);
  const signedUrls = useSignedURLs(mediaUrls);

  const sendMessage = async (messageText: string) => {
    if (messageText.trim()) {
      let mediaUrl: string | undefined;
      let mediaType: string | undefined;
      if (file) {
        const { url, type } = await uploadMediaToS3(file);
        mediaUrl = url;
        mediaType = type;
      }
      const encryptedText = encryptMessage(messageText);
      const message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        text: encryptedText,
        time: new Date().toLocaleTimeString(),
        mediaUrl,
        mediaType,
        groupId: group._id
      };

      if (socket.connected) {
        setMessages(prev => [...prev, { ...message, text: messageText }]);
        processedMessages.add(message.id);

        socket.emit("chat message", message);
        setNewMessage("");
        setFile(null);
        setSmartReplies([]);
        scrollToBottom();
      } else {
        console.error("Socket not connected. Reconnecting...");
        socket.connect();
      }
    }
  };

  const uploadMediaToS3 = async (file: File): Promise<{ url: string; type: string }> => {
    const res = await fetch(`/api/upload/presigned-upload-url?fileType=${file.type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const { uploadURL, fileURL } = await res.json();

    const putResponse = await fetch(uploadURL, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!putResponse.ok) {
      const errorText = await putResponse.text();
      console.error("Upload failed:", errorText);
      throw new Error('Failed to upload media to S3');
    }

    return { url: fileURL, type: file.type };
  };

  const handleTyping = () => {
    setSmartReplies([]);
    socket.emit("user typing", {
      user: user.name,
      groupId: group._id
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    socket.disconnect();
    logout();
  };

  const fetchSmartReplies = async (messageText: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`, // Ensure your API key is set up correctly
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Analyze the content of below message using NLP and suggest potential replies in less than 5 words without a hifen upfront' },
            { role: 'user', content: decryptMessage(messageText) }
          ],
          max_tokens: 60,
          n: 3, // Number of replies to generate
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices.map((choice: { message: { content: string } }) => choice.message.content.trim());
    } catch (error) {
      console.error('Error fetching smart replies:', error);
      return [];
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-md">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Groups
        </button>
        <h2 className="text-xl font-semibold">{group.name}</h2>
        <div className="flex items-center">
          <span className="text-gray-700 font-semibold mr-4 bg-blue-100 px-3 py-1 shadow">
            {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {Array.isArray(messages) && messages.map((msg, index) => {
          const signedUrl = signedUrls[msg.mediaUrl || ''];
          const isImage = msg.mediaType?.startsWith("image/");
          const isMine = isMe(msg);

          return (
            <div key={msg.id || index} className="mb-2">
              <div className={`mb-2 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded p-2 shadow ${isMine ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${isMine ? 'text-blue-50' : 'text-gray-600'}`}>
                    <strong>{msg.user ? msg.user.name : 'Unknown User'}</strong> <span className="text-xs">{msg.time}</span>
                  </div>
                  <div>{decryptMessage(msg.text)}</div>
                  {signedUrl && isImage ? (
                    <div className="mt-2">
                      <img src={signedUrl} alt="Media" className="w-full rounded" />
                    </div>
                  ) : signedUrl ? (
                    <div className="mt-2">
                      <a href={signedUrl} target="_blank" rel="noopener noreferrer" className={`${isMine ? 'text-blue-50' : 'text-blue-600'} underline`}>
                        Download File
                      </a>
                    </div>
                  ) : null}
                  {isMine && msg.readBy && msg.readBy.length > 0 && (
                    <div className="text-xs text-blue-50 italic">
                      Seen by {[...new Set(msg.readBy)].join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingUser && (
        <div className="text-sm text-gray-500 px-4 pb-2 italic">
          {typingUser} is typing...
        </div>
      )}

      <div className="smart-replies flex justify-center p-2">
        {smartReplies.map((reply, index) => (
          <button key={index} onClick={() => sendMessage(reply)} className="smart-reply-button mx-1 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1">
            {reply}
          </button>
        ))}
      </div>

      <div className="flex items-center p-4 border-t bg-white">
        {file && (
          <div className="flex items-center text-sm text-gray-700 mr-2">
            Selected: {file.name}
            <button
              onClick={() => setFile(null)}
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        )}
        <label className="cursor-pointer mr-2 flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600">
          <span>+</span>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            onKeyDown={() => handleTyping()}
            className="hidden"
          />
        </label>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            handleTyping();
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage((e.target as HTMLInputElement).value);
            }
          }}
          placeholder="Type a message"
          className="flex-grow border rounded px-3 py-2 mr-2"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            sendMessage(newMessage);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;