import React, { useState } from 'react'
import './ChatbotWidget.css'


function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot', content: "Hi 👋 I'm your Resume Assistant! What can i help you?"
        }
    ]);
    const [input, setInput] = useState("");
    const sendMessage = async () => {
        if (!input.trim()) return;          

        setMessages([...messages, { role: "user", content: input }]);

        try {
            const res = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });
            const data = await res.json();

            setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: "bot", content: "Server not responding" }]);
        }

        setInput("");
    }

    return (
        <div className="chatbot-widget">
            {
                !isOpen && (
                    <button className='chatbot-btn' onClick={() => setIsOpen(true)}>💬</button>
                )
            }

            {
                isOpen && (
                    <div className="chatbot">
                        <div className="chatbot-header">
                            <span>Resume Assistant</span>
                            <button onClick={() => setIsOpen(false)}>❎</button>
                        </div>

                        <div className="chatbot-body">
                            {messages.map((msg, i) => (
                                <div key={i} className={msg.role === "bot" ? "bot" : "user"}>
                                    {msg.content}
                                </div>
                            ))}
                        </div>

                        <div className="chatbot-input">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => { setInput(e.target.value) }} 
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder='Type your question...' />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    </div>
                )
            }

        </div>
    );

}

export default ChatbotWidget;