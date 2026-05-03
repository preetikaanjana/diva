import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { generateNlpResponse } from '../utils/chatbotNlp';

const botName = 'Sakhi';
const initialMessage = {
  text: `Hi! I'm ${botName}. I am your companion for legal rights, health, safety, and career guidance. How can I empower you today?`,
  user: false,
};

const suggestedPrompts = [
  "Know my Legal Rights",
  "Emergency Helplines",
  "Mental Health Tips",
  "Career Guidance"
];

function chatApiBaseUrl() {
  const raw = process.env.REACT_APP_API_URL;
  if (raw != null && String(raw).trim() !== '') {
    return `${String(raw).replace(/\/$/, '')}/api`;
  }
  return '/api';
}

function Chat() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  useEffect(() => {
    if (loading) setShowTyping(true);
    else setShowTyping(false);
  }, [loading]);

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    // Slight delay to allow state update before sending
    setTimeout(() => handleSend(prompt), 100);
  };

  const handleSend = async (customMessage = null) => {
    const userMessage = customMessage || input.trim();
    if (userMessage) {
      // 1. Add User Message
      const nextMessages = [...messages, { text: userMessage, user: true }];
      setMessages(nextMessages);
      setInput('');
      setLoading(true);

      try {
        const history = nextMessages
          .slice(-8)
          .filter((m) => m.text && m.text.trim())
          .map((m) => ({
            role: m.user ? 'user' : 'assistant',
            content: m.text
          }));

        const response = await fetch(`${chatApiBaseUrl()}/chat/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, history })
        });

        if (!response.ok) {
          throw new Error(`AI request failed (${response.status})`);
        }

        const data = await response.json();
        const responseText = (data?.reply || '').trim();
        if (!responseText) {
          throw new Error('AI returned empty response');
        }

        setMessages((prev) => [...prev, { text: responseText, user: false }]);
      } catch (error) {
        const fallbackText = generateNlpResponse(userMessage);
        setMessages((prev) => [
          ...prev,
          {
            text:
              `${fallbackText}\n\n(Using local NLP fallback right now because the AI service is unavailable.)`,
            user: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => setInput(e.target.value);
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSend(); };

  // Logic to show prompts only when chat is empty (start)
  const showPrompts = messages.length === 1 && !loading;

  return (
    <div className="chat-container">
      <div className="chat-box">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-header-avatar">👩‍⚖️</div> {/* Changed Icon */}
            <div className="chat-header-info">
              <h3>{botName}</h3>
              <p style={{ fontSize: '10px', margin: 0, opacity: 0.8 }}>Women Empowerment Bot</p>
            </div>
          </div>
          <div className="chat-header-right">
            <div className="online-status">
              <span className="status-dot"></span>
              <span>Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.user ? 'user' : 'bot'}`}>
              {!msg.user && <div className="message-avatar">👩‍⚖️</div>}
              
              <div className={`message ${msg.user ? 'user' : 'bot'}`}>
                {/* Render newlines properly */}
                {msg.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>

              {msg.user && <div className="message-avatar">👤</div>}
            </div>
          ))}

          {showTyping && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          {showPrompts && (
            <div className="suggested-prompts">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="prompt-chip"
                  onClick={() => handlePromptClick(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          
          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask Sakhi regarding your rights..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;