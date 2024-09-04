import React, { memo, useCallback, useState } from 'react';
import { usePeer } from '../content/PeerContext';

function Chat({ userName }) {
  const [newMessage, setNewMessage] = useState('');
  const { messages, setMessages, sendMessage } = usePeer();
  console.log(messages);
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        name: userName,
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      sendMessage(messageData);
      setMessages(prevMessages => [...prevMessages, messageData]);
      setNewMessage('');
    }
  }


  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className="chat-message">
            <div className="chat-message-header">
              <span className="chat-user-name">{message.name}</span>
              <span className="chat-timestamp">{message.timestamp}</span>
            </div>
            <div className="chat-message-content">{message.content}</div>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="chat-input"
        />
        <button onClick={handleSendMessage} className="chat-send-button">
          Send
        </button>
      </div>
    </div>
  );
}

export default memo(Chat);
