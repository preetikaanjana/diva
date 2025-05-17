import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const botName = 'Sakhi';
const initialMessage = {
  text: `Hi! I'm ${botName}. I can help you understand your rights and guide you. How can I assist you today?`,
  user: false,
};

function Chat() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const userMessage = input.trim();
    if (userMessage) {
      // Add user message to chat immediately
      setMessages(prevMessages => [...prevMessages, { text: userMessage, user: true }]);
      setInput('');
      setLoading(true); // Start loading indicator

      try {
        const response = await fetch('http://127.0.0.1:5000/chatbot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Add bot response to chat
        setMessages(prevMessages => [...prevMessages, { text: data.response, user: false }]);

      } catch (error) {
        console.error('Error sending message to backend:', error);
        // Add an error message to the chat with error flag
        setMessages(prevMessages => [...prevMessages, { text: 'Error: Could not connect to the chatbot.', user: false, isError: true }]);
      } finally {
        setLoading(false); // Stop loading indicator
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <div className="chat-header">
          <h3>{botName}</h3>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.user ? 'user' : 'bot'} ${msg.isError ? 'error' : ''}`}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="message bot typing-indicator">
              Sakhi is typing...
            </div>
          )}
          <div ref={messagesEndRef} /> { /* Dummy div for scrolling */}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={loading} // Disable input while loading
          />
          <button onClick={handleSend} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chat; 