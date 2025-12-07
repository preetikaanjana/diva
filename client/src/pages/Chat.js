import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

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

  // --- THE BRAIN OF THE BOT (Internal Logic) ---
  const generateResponse = (message) => {
    const lowerMsg = message.toLowerCase();

    // 1. Safety & Emergency
    if (lowerMsg.includes('safety') || lowerMsg.includes('emergency') || lowerMsg.includes('police') || lowerMsg.includes('help')) {
      return "🚨 **Emergency Contacts:**\n\n• **Women Helpline:** 1091\n• **Domestic Abuse:** 181\n• **Police:** 100\n• **Cyber Crime:** 1930\n\nPlease stay safe. Share your live location with a trusted contact if you feel unsafe.";
    }

    // 2. Legal Rights
    if (lowerMsg.includes('legal') || lowerMsg.includes('right') || lowerMsg.includes('law') || lowerMsg.includes('harassment')) {
      return "⚖️ **Your Legal Rights:**\n\n1. **Zero FIR:** You can file an FIR at any police station, regardless of jurisdiction.\n2. **Workplace Harassment:** The POSH Act protects you against sexual harassment at work.\n3. **Domestic Violence Act:** Protects women from physical, emotional, and economic abuse at home.\n\nWould you like details on a specific law?";
    }

    // 3. Mental Health
    if (lowerMsg.includes('mental') || lowerMsg.includes('sad') || lowerMsg.includes('depress') || lowerMsg.includes('anxiety') || lowerMsg.includes('stress')) {
      return "🧠 **Mental Health Matters:**\n\nIt's okay not to be okay. \n• Try the 5-4-3-2-1 grounding technique.\n• Reach out to a friend or the **Vandrevala Foundation Helpline: 1860-266-2345**.\n\nYou are strong, but you don't have to carry everything alone.";
    }

    // 4. Career & Financial Independence
    if (lowerMsg.includes('career') || lowerMsg.includes('job') || lowerMsg.includes('money') || lowerMsg.includes('finance')) {
      return "💼 **Career & Finance:**\n\n• **Upskilling:** Check out free courses on Swayam or Google Digital Garage.\n• **Schemes:** Look into the 'Mahila E-Haat' for entrepreneurs.\n• **Tip:** Financial independence is the first step to true freedom. Start saving a small amount every month.";
    }

    // 5. Greetings & Default
    if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
      return "Hello! I am Sakhi, here to support you. You can ask me about safety, laws, or health.";
    }

    if (lowerMsg.includes('thank')) {
      return "You're welcome! Remember, you are capable of amazing things. ✨";
    }

    return "I'm not sure about that, but I'm learning! You can ask me about **Safety**, **Legal Rights**, **Health**, or **Career**.";
  };

  const handleSend = async (customMessage = null) => {
    const userMessage = customMessage || input.trim();
    if (userMessage) {
      // 1. Add User Message
      setMessages(prev => [...prev, { text: userMessage, user: true }]);
      setInput('');
      setLoading(true);

      // 2. Simulate Network Delay for Realism
      setTimeout(() => {
        // 3. Generate Response Locally (No Backend Needed)
        const responseText = generateResponse(userMessage);
        
        setMessages(prev => [...prev, { text: responseText, user: false }]);
        setLoading(false);
      }, 1000); // 1 second delay
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