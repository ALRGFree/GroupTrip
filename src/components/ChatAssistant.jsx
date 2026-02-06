import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Sparkles,
  User,
  Bot,
  Loader2,
  MapPin,
  Utensils,
  Camera,
  Calendar,
  Lightbulb,
  ChevronDown,
} from 'lucide-react';
import { useClaude } from '../hooks/useClaude';
import { useGroup } from '../context/GroupContext';
import { Avatar } from './Avatar';

const QUICK_PROMPTS = [
  { icon: Utensils, text: 'Suggest restaurants', prompt: 'Recommend some restaurants for our group' },
  { icon: Camera, text: 'Things to do', prompt: 'What are the top attractions and activities?' },
  { icon: Calendar, text: 'Day plan', prompt: 'Create a sample day itinerary' },
  { icon: Lightbulb, text: 'Travel tips', prompt: 'What travel tips should we know?' },
];

export function ChatAssistant({ isOpen, onClose }) {
  const { currentGroup } = useGroup();
  const { chatWithAssistant, loading, isAvailable } = useClaude();

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hi! I'm your trip planning assistant. ${
        currentGroup?.destination
          ? `I see you're planning a trip to ${currentGroup.destination}. `
          : ''
      }How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithAssistant(input.trim(), {
        destination: currentGroup?.destination,
        dates: currentGroup?.startDate
          ? `${currentGroup.startDate} to ${currentGroup.endDate}`
          : null,
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:inset-auto lg:right-6 lg:bottom-6 lg:w-96 lg:h-[600px] flex flex-col bg-white lg:rounded-2xl lg:shadow-2xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Trip Assistant</h3>
            <p className="text-xs text-white/80">Powered by Claude AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {message.role === 'assistant' ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : message.isError
                  ? 'bg-danger-100 text-danger-800 rounded-bl-md'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 py-3 border-t bg-white">
          <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, index) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors"
                >
                  <Icon className="w-3 h-3" />
                  {prompt.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your trip..."
              rows={1}
              className="w-full px-4 py-2.5 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        {!isAvailable && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Running in demo mode
          </p>
        )}
      </div>
    </div>
  );
}

// Floating Chat Button
export function ChatButton({ onClick, hasUnread = false }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-6 bottom-6 w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center z-40 lg:bottom-6"
      title="Trip Assistant"
    >
      <MessageCircle className="w-6 h-6" />
      {hasUnread && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-danger-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
}

// Chat Provider for global state
export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {children}
      <ChatButton onClick={() => setIsOpen(true)} />
      <ChatAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default ChatAssistant;
