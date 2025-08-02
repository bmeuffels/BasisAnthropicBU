import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ChevronDown, Sparkles, Zap, MessageCircle, Trash2, Brain } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CLAUDE_MODELS = [
  { 
    id: 'claude-3-5-sonnet-20241022', 
    name: 'Claude 3.5 Sonnet', 
    description: 'Meest geavanceerde model voor complexe taken', 
    icon: '🎭', 
    color: 'from-orange-500 to-amber-500',
    maxTokens: 8192
  },
  { 
    id: 'claude-3-5-haiku-20241022', 
    name: 'Claude 3.5 Haiku', 
    description: 'Snelste model voor eenvoudige taken', 
    icon: '⚡', 
    color: 'from-blue-500 to-cyan-500',
    maxTokens: 4096
  },
  { 
    id: 'claude-3-opus-20240229', 
    name: 'Claude 3 Opus', 
    description: 'Krachtigste model voor de zwaarste taken', 
    icon: '🚀', 
    color: 'from-purple-500 to-pink-500',
    maxTokens: 4096
  },
  { 
    id: 'claude-3-sonnet-20240229', 
    name: 'Claude 3 Sonnet', 
    description: 'Uitgebalanceerd model voor dagelijks gebruik', 
    icon: '⚖️', 
    color: 'from-green-500 to-emerald-500',
    maxTokens: 4096
  },
  { 
    id: 'claude-3-haiku-20240307', 
    name: 'Claude 3 Haiku', 
    description: 'Snel en efficiënt voor eenvoudige vragen', 
    icon: '🌸', 
    color: 'from-pink-500 to-rose-500',
    maxTokens: 4096
  }
];

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(CLAUDE_MODELS[0].id);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };

    if (isModelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelDropdownOpen]);

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const selectedModelData = CLAUDE_MODELS.find(m => m.id === selectedModel);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: selectedModel,
          max_tokens: selectedModelData?.maxTokens || 4096,
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: input
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content[0].text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Er is een fout opgetreden bij het versturen van je bericht. Controleer de API configuratie en probeer het opnieuw.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const selectedModelData = CLAUDE_MODELS.find(m => m.id === selectedModel);

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-amber-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="text-center py-12 relative z-10 backdrop-blur-sm bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-8 max-w-md mx-4">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
            API Key Vereist
          </h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            Configureer je Anthropic API key in het environment bestand om deze geavanceerde Claude chatbot te gebruiken.
          </p>
          <div className="bg-orange-900/50 rounded-xl p-4 text-left text-sm font-mono text-orange-300 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-400">.env</span>
            </div>
            VITE_ANTHROPIC_API_KEY=your_api_key_here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-xl bg-white/80 border-b border-orange-200/50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Claude AI Chat
                </h1>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  Anthropic's intelligente assistent
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Model Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center space-x-3 px-6 py-3 bg-white/90 hover:bg-white rounded-xl border border-orange-200 hover:border-orange-300 transition-all duration-300 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{selectedModelData?.icon}</span>
                    <div className="text-left">
                      <div className="text-gray-800 font-medium text-sm">{selectedModelData?.name}</div>
                      <div className="text-gray-600 text-xs">{selectedModelData?.description}</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-orange-500 transition-transform duration-300 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isModelDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-200 z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      {CLAUDE_MODELS.map((model, index) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left p-4 rounded-xl transition-all duration-200 group hover:bg-orange-50 ${
                            selectedModel === model.id ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-l-4 border-orange-500' : ''
                          }`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 bg-gradient-to-r ${model.color} rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                              {model.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                                {model.name}
                              </div>
                              <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                                {model.description}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Max tokens: {model.maxTokens.toLocaleString()}
                              </div>
                            </div>
                            {selectedModel === model.id && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-orange-50 rounded-xl transition-all duration-300 border border-orange-200 hover:border-orange-300 backdrop-blur-sm group"
              >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Wis Chat</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Messages */}
        <div className="backdrop-blur-xl bg-white/60 rounded-3xl shadow-lg border border-orange-200/50 mb-8 overflow-hidden relative z-20">
          <div className="h-[500px] overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-8 w-6 h-6 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                  Welkom bij Claude AI
                </h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                  Start een gesprek met Claude, Anthropic's geavanceerde AI-assistent. Stel een vraag of begin een conversatie!
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white border-orange-300 shadow-orange-200'
                        : 'bg-white/90 text-gray-800 border-orange-200 shadow-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-white/20' 
                          : 'bg-gradient-to-r from-orange-500 to-amber-400'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Brain className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            message.role === 'user' ? 'text-white/90' : 'text-gray-700'
                          }`}>
                            {message.role === 'user' ? 'Jij' : selectedModelData?.name || 'Claude'}
                          </span>
                          {message.role === 'assistant' && (
                            <div className="flex items-center space-x-1">
                              <Zap className="w-3 h-3 text-orange-400" />
                              <span className="text-xs text-orange-400">AI</span>
                            </div>
                          )}
                        </div>
                        <div className={`text-xs ${
                          message.role === 'user' ? 'text-white/60' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('nl-NL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white/90 backdrop-blur-sm text-gray-800 max-w-2xl px-6 py-4 rounded-2xl shadow-lg border border-orange-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {selectedModelData?.name || 'Claude'}
                      </span>
                      <div className="text-xs text-gray-500">Aan het denken...</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full animate-bounce delay-300"></div>
                    </div>
                    <span className="text-xs text-gray-500">Claude denkt na...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="backdrop-blur-xl bg-white/60 rounded-3xl shadow-lg border border-orange-200/50 p-6 relative z-20">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Stel een vraag aan Claude..."
                rows={1}
                className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none text-gray-800 placeholder-gray-500 transition-all duration-300 shadow-inner"
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                Enter om te verzenden
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={`p-4 rounded-2xl transition-all duration-300 shadow-xl transform hover:scale-105 ${
                !input.trim() || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500 shadow-orange-200 hover:shadow-orange-300'
              }`}
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;