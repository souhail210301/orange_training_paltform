import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Sparkles, Loader2 } from 'lucide-react';

const ChatbotAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickOptions, setQuickOptions] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load greeting when chatbot opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadGreeting();
    }
  }, [isOpen]);

  const loadGreeting = async () => {
    try {
      const response = await fetch('/api/chatbot/greeting');
      const data = await response.json();
      
      if (data.success) {
        setMessages([{
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }]);
        setQuickOptions(data.quickOptions || []);
      }
    } catch (error) {
      console.error('Error loading greeting:', error);
      setMessages([{
        role: 'assistant',
        content: "👋 Bonjour ! Je suis votre assistant virtuel ODC. Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history (last 10 messages)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          suggestions: data.suggestions || [],
          fallback: data.fallback,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolé, je rencontre un problème technique. Veuillez réessayer dans un instant. 😓",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickOption = (question) => {
    sendMessage(question);
    setQuickOptions([]); // Hide quick options after use
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 flex items-center gap-2 group"
        >
          <MessageCircle size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium">
            Besoin d'aide ?
          </span>
          <Sparkles size={16} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle size={20} className="text-orange-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">Assistant ODC</h3>
                <p className="text-xs text-orange-100">En ligne • Répond en quelques secondes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-orange-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.fallback && (
                      <p className="text-xs mt-2 opacity-70 italic">
                        💡 Conseil basique (AI non disponible)
                      </p>
                    )}
                  </div>
                  
                  {/* Formation Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Formations suggérées :</p>
                      {message.suggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-orange-200 hover:border-orange-400 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/catalogues/${suggestion.id}`}
                        >
                          <p className="font-semibold text-sm text-gray-800">{suggestion.title}</p>
                          <div className="flex gap-2 mt-1">
                            {suggestion.level && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                {suggestion.level}
                              </span>
                            )}
                            {suggestion.type && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {suggestion.type}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-orange-500" />
                    <span className="text-sm text-gray-600">En train d'écrire...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Options */}
            {quickOptions.length > 0 && messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">Suggestions rapides :</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleQuickOption(option.question)}
                      className="bg-white border border-gray-200 hover:border-orange-400 hover:bg-orange-50 p-3 rounded-lg text-left transition-colors text-sm"
                    >
                      <span className="text-lg">{option.icon}</span>
                      <p className="text-xs text-gray-700 mt-1">{option.question}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 text-sm"
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Propulsé par l'IA • Réponses instantanées
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotAssistant;
