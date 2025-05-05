/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Loader2,
  Send,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import { getTranscript } from '../utils/speechmatics';
import { isGeminiConfigured } from '../utils/env';
import { generateNotes, generateSummary, getChatResponse, testGeminiAPI } from '../utils/gemini';
import { getVideoById, getMockTranscript } from '../utils/mockData';

interface LearningSidebarProps {
  videoId: string;
  videoTitle: string;
  isVisible: boolean;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  received?: boolean;
  timestamp?: Date;
}

// Add new styles at the top
const MIN_BOTTOM_SHEET_HEIGHT = 100;
const MAX_BOTTOM_SHEET_HEIGHT = window.innerHeight * 0.9;

interface DragState {
  startY: number;
  currentHeight: number;
  isDragging: boolean;
}

const LearningSidebar: React.FC<LearningSidebarProps> = ({ videoId, videoTitle, isVisible }) => {
  // State for the current active tab
  const [activeTab, setActiveTab] = useState<'summary' | 'chat' | 'notes'>('chat');
  
  // State for loading indicators
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  // State for content
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [transcript, setTranscript] = useState('');
  const [apiConfigured] = useState(isGeminiConfigured());
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // State for responsive mode
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(window.innerHeight * 0.8);

  // Add new state for drag handling
  const [dragState, setDragState] = useState<DragState>({
    startY: 0,
    currentHeight: window.innerHeight * 0.7,
    isDragging: false
  });

  // Check for mobile view on resize with cleanup
  useEffect(() => {
    let mounted = true;
    
    const handleResize = () => {
      if (!mounted) return;
      
      const mobileView = window.innerWidth < 768;
      setIsMobileView(mobileView);
      
      // Adjust bottom sheet size when resizing
      if (mobileView) {
        setBottomSheetHeight(Math.min(MAX_BOTTOM_SHEET_HEIGHT, window.innerHeight * 0.7));
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Call initially
    
    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update useEffect to maintain visibility with cleanup
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    
    let animationFrame: number;
    
    const handleTransform = () => {
      animationFrame = requestAnimationFrame(() => {
        if (isVisible) {
          sidebar.style.transform = 'translateX(0)';
        } else {
          sidebar.style.transform = 'translateX(100%)';
        }
      });
    };

    handleTransform();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (sidebar) {
        sidebar.style.transform = '';
      }
    };
  }, [isVisible]);

  // Initialize content when both videoId and title are available
  useEffect(() => {
    let mounted = true;

    const initializeContent = async () => {
      if (!videoId || !videoTitle || !isVisible) return;

      // Show initial loading states
      setIsLoadingSummary(true);
      setIsLoadingNotes(true);

      // Add initial AI message immediately
      const initialMessage: Message = { 
        role: 'ai', 
        content: `<p>Hi there! I'm your learning assistant for <strong>${videoTitle}</strong>. How can I help you understand this content better?</p>
        <p>Try asking me questions about the video content, key concepts, or request clarification on specific topics.</p>`,
        timestamp: new Date()
      };
      setMessages([initialMessage]);

      try {
        // Fetch transcript first
          const transcriptText = await getTranscript(videoId);
          if (!mounted) return;
          setTranscript(transcriptText);
          
        // Generate summary and notes in parallel
        const [summaryPoints, notesContent] = await Promise.all([
          generateSummary(transcriptText, videoTitle, videoId),
          generateNotes(transcriptText, videoTitle, videoId)
        ]);

          if (!mounted) return;

          setSummaryPoints(summaryPoints);
        setNotes(notesContent);
          
        // If API is not configured, show mock data with realistic delays
        if (!apiConfigured) {
          const mockData = getMockData(videoId, videoTitle);
          setTimeout(() => {
          if (!mounted) return;
            setSummaryPoints(mockData.summaryPoints);
            setNotes(mockData.notes);
            setMessages(prev => [...prev, ...mockData.messages]);
          }, 1500);
        }
        } catch (error) {
          console.error('Error initializing content:', error);
          setSummaryPoints(['Failed to generate summary. Please try again later.']);
          setNotes('Failed to generate notes. Please try again later.');
      } finally {
        if (mounted) {
          setIsLoadingSummary(false);
          setIsLoadingNotes(false);
        }
      }
    };

    initializeContent();

    return () => {
      mounted = false;
      // Clear content on unmount
      setTranscript('');
      setSummaryPoints([]);
      setNotes('');
      setMessages([]);
    };
  }, [videoId, videoTitle, isVisible, apiConfigured]);

  // Helper function to get mock data
  const getMockData = (videoId: string, title: string) => {
        const video = getVideoById(videoId);
        const mockTranscript = getMockTranscript(videoId);
        
    const mockMessages: Message[] = [
            { 
              role: 'ai', 
        content: `<p>Hi there! I'm your learning assistant for <strong>${video?.title || title}</strong>. I can help you understand the concepts covered in this tutorial.</p>
        <p>Feel free to ask questions about ${video?.category === 'Web Development' ? 'React components, hooks, state management,' : ''} or any other topics discussed!</p>`,
        timestamp: new Date()
      }
    ];

    return {
      transcript: mockTranscript,
      summaryPoints: [
        "React components are the building blocks of modern web applications",
        "Hooks simplify state management and side effects in functional components",
        "Performance optimization includes memoization and code splitting",
        "Error boundaries provide graceful error handling",
        "Modern JavaScript features enhance code readability"
      ],
      notes: `
        <h2>Modern Web Development with React.js</h2>
        <h3>1. React Fundamentals</h3>
        <ul>
          <li><strong>Components:</strong> Building blocks of React applications</li>
          <li><strong>Hooks:</strong> Modern approach to state management</li>
          <li><strong>Performance:</strong> Optimization techniques and best practices</li>
            </ul>
      `,
      messages: mockMessages
    };
  };
  
  // Fetch summary with realistic educational content
  const fetchSummary = async (transcriptText: string) => {
    setIsLoadingSummary(true);
    setSummaryPoints([]); // Clear existing summary points
    
    try {
      const points = await generateSummary(transcriptText, videoTitle, videoId);
      setSummaryPoints(points);
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // If there's an error or API is not configured, show realistic mock data
      if (!apiConfigured) {
        setTimeout(() => {
          setSummaryPoints([
            "React components are the building blocks of modern web applications",
            "Hooks simplify state management and side effects in functional components",
            "Performance optimization includes memoization and code splitting",
            "Error boundaries provide graceful error handling",
            "Modern JavaScript features enhance code readability"
          ]);
        }, 1500);
      } else {
        // Show error message in the summary points
        setSummaryPoints([
          "Failed to generate summary. Please try again later."
        ]);
      }
    } finally {
        setIsLoadingSummary(false);
    }
  };
  
  // Scroll chat to bottom when messages change with cleanup
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;
    
    let animationFrame: number;
    
    const scrollToBottom = () => {
      animationFrame = requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      });
    };
    
    scrollToBottom();
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [messages]);

  // Update the message bubble content rendering in renderChatMessages
  const renderChatMessages = () => {
    const messageGroups = groupMessagesByDate(messages);

    return Object.entries(messageGroups).map(([date, groupMessages]) => (
      <div key={date} className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-gray-100 dark:bg-[#2b2250] rounded-full px-3 py-1 border border-gray-200/60 dark:border-gray-700/60">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {new Date(date).toLocaleDateString(undefined, { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {groupMessages.map((message, index) => (
          <div key={index} className="flex flex-col space-y-1">
            <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                ${message.role === 'user' 
                  ? 'bg-blue-500 shadow-sm' 
                  : 'bg-gray-100 dark:bg-[#2b2250] border border-gray-200/60 dark:border-gray-700/60'}`}>
                {message.role === 'user' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2M12 17l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
                  </svg>
                )}
              </div>

              {/* Message content */}
              <div className={`relative max-w-[70%] ${message.role === 'user' ? 'ml-auto' : ''}`}>
                <div className={`rounded-2xl px-4 py-2 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-[#2b2250] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700/60'
                }`}>
                  {renderMessageContent(message.content)}
                </div>

                {/* Message metadata */}
                <div className={`flex items-center space-x-1 mt-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                  {message.role === 'user' && message.received && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  // Add a function to safely render HTML content
  const renderMessageContent = (content: string) => {
    // Check if content is HTML
    const isHTML = /<[a-z][\s\S]*>/i.test(content);

    if (isHTML) {
      return (
        <div 
          className="text-sm prose prose-sm dark:prose-invert max-w-none
            prose-p:my-1 prose-ul:my-1 prose-ol:my-1 
            prose-li:my-0.5 prose-pre:my-1
            prose-code:text-inherit
            prose-strong:text-inherit
            prose-headings:text-inherit
            prose-a:text-blue-200 dark:prose-a:text-blue-400
            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // If not HTML, render as before with improved styling
    return (
      <div className="text-sm whitespace-pre-wrap break-words">
        {content.split('\n').map((line, i) => {
          if (line.startsWith('```')) {
            return (
              <pre key={i} className="bg-black/5 dark:bg-black/20 rounded-lg p-2 my-2 overflow-x-auto">
                <code>{line.replace(/```/g, '').trim()}</code>
              </pre>
            );
          }
          
          if (line.startsWith('•') || line.startsWith('-')) {
            return (
              <div key={i} className="flex items-start space-x-2 my-1">
                <span>•</span>
                <span>{line.replace(/^[•-]\s*/, '')}</span>
              </div>
            );
          }
          
          return line ? (
            <p key={i} className="my-1">{line}</p>
          ) : <br key={i} />;
        })}
      </div>
    );
  };

  // Update handleSendMessage to not strip HTML from AI responses
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const newUserMessage: Message = { 
      role: 'user', 
      content: inputValue,
      received: false 
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    
    setIsLoadingChat(true);
    
    try {
      if (apiConfigured) {
        const response = await getChatResponse(inputValue, transcript, videoTitle, videoId);
        
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 ? { ...msg, received: true } : msg
        ));
        
        const newAiMessage: Message = { 
          role: 'ai', 
          content: response, // Keep HTML formatting
          received: true 
        };
        setMessages(prev => [...prev, newAiMessage]);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setMessages(prev => prev.map((msg, idx) => 
          idx === prev.length - 1 ? { ...msg, received: true } : msg
        ));
        
        const userQuestion = inputValue.toLowerCase();
        let mockResponse = '';
        
        if (userQuestion.includes('hello') || userQuestion.includes('hi')) {
          mockResponse = `<p>Hey there! 👋 Ready to dive into web development? I'm here to help!</p>`;
        } else if (userQuestion.includes('explain') || userQuestion.includes('what is')) {
          mockResponse = `<p>Let me break that down for you in simple terms:</p>
            <ul>
              <li>First, think of it like building blocks</li>
              <li>Each piece has a specific purpose</li>
              <li>They all work together to create something amazing</li>
          </ul>
            <p>What specific part would you like me to explain further?</p>`;
        } else if (userQuestion.includes('example')) {
          mockResponse = `<p>Here's a simple example:</p>
            <pre><code>function sayHello() {
  console.log('Hello, developer!');
}</code></pre>
            <p>Want me to explain how this works?</p>`;
        } else {
          mockResponse = `<p>I understand what you're asking about. Let me help you with that!</p>
            <ul>
              <li>This is a common topic in web development</li>
              <li>Many developers face similar challenges</li>
              <li>There are several ways to approach this</li>
          </ul>
            <p>Would you like me to go into more detail about any of these points?</p>`;
        }
        
        const newAiMessage: Message = { 
          role: 'ai', 
          content: mockResponse,
          received: true 
        };
        setMessages(prev => [...prev, newAiMessage]);
      }
    } catch (error) {
      console.error('Error getting chat response:', error);
      
      const errorMessage: Message = { 
        role: 'ai', 
        content: `<p>I'm having trouble processing your request right now. Could you try again?</p>`,
        received: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };
  
  // Handle key press in input field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle copying content
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // Could add a toast notification here
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date();
      const dateKey = date.toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  // Add touch event handlers for bottom sheet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobileView) return;
    
    const touch = e.touches[0];
    setDragState({
      startY: touch.clientY,
      currentHeight: bottomSheetHeight,
      isDragging: true
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.isDragging || !isMobileView) return;
    
    const touch = e.touches[0];
    const deltaY = dragState.startY - touch.clientY;
    const newHeight = Math.max(
      MIN_BOTTOM_SHEET_HEIGHT,
      Math.min(MAX_BOTTOM_SHEET_HEIGHT, dragState.currentHeight + deltaY)
    );
    
    setBottomSheetHeight(newHeight);
  };

  const handleTouchEnd = () => {
    if (!isMobileView) return;
    
    setDragState(prev => ({ ...prev, isDragging: false }));
    
    // Snap to predefined heights
    if (bottomSheetHeight < window.innerHeight * 0.3) {
      setBottomSheetHeight(MIN_BOTTOM_SHEET_HEIGHT);
    } else if (bottomSheetHeight > window.innerHeight * 0.7) {
      setBottomSheetHeight(MAX_BOTTOM_SHEET_HEIGHT);
    } else {
      setBottomSheetHeight(window.innerHeight * 0.5);
    }
  };

  // Update the sidebar styles for better theme support
  const sidebarStyles: React.CSSProperties = {
    position: 'fixed',
    right: 0,
    backgroundColor: 'var(--background)',
    zIndex: 50,
    ...(isMobileView
      ? {
          bottom: 0,
          width: '100%',
          height: `${bottomSheetHeight}px`,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      : {
          top: 0,
          width: '400px',
          height: '100%',
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        })
  };

  // Mobile version
  if (isMobileView) {
    return (
      <div 
        ref={sidebarRef}
        style={sidebarStyles}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex flex-col bg-background dark:bg-background-dark"
      >
        {/* Drag handle for mobile */}
        <div className="w-full flex justify-center p-2 cursor-grab touch-pan-y bg-secondary/10 dark:bg-secondary-dark/10">
          <div className="w-12 h-1.5 bg-secondary/20 dark:bg-secondary-dark/20 rounded-full" />
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-border dark:border-border-dark bg-background dark:bg-background-dark px-2 pt-2">
          {(['chat', 'summary', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 px-4 py-2.5 text-sm font-medium rounded-t-lg mx-1
                transition-colors duration-200
                ${activeTab === tab 
                  ? 'bg-primary dark:bg-primary-dark text-white dark:text-white border-b-2 border-primary dark:border-primary-dark' 
                  : 'text-secondary dark:text-secondary-dark hover:bg-secondary/10 dark:hover:bg-secondary-dark/10'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 bg-background dark:bg-background-dark">
          {activeTab === 'chat' && (
            <div 
              ref={chatContainerRef}
              className="flex flex-col space-y-4 pb-20"
            >
              {renderChatMessages()}
            </div>
          )}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              {isLoadingSummary ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary dark:text-primary-dark" />
                </div>
              ) : (
                summaryPoints.map((point, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-secondary/10 dark:bg-secondary-dark/10 rounded-lg border border-border dark:border-border-dark"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary dark:bg-primary-dark text-white flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <p className="text-primary dark:text-primary-dark">{point}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === 'notes' && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {isLoadingNotes ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary dark:text-primary-dark" />
                </div>
              ) : (
                <div className="bg-secondary/10 dark:bg-secondary-dark/10 rounded-lg border border-border dark:border-border-dark p-4">
                  <div dangerouslySetInnerHTML={{ __html: notes }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat input */}
        {activeTab === 'chat' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background dark:bg-background-dark border-t border-border dark:border-border-dark">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about the video..."
                className="flex-1 px-4 py-3 rounded-full bg-secondary/10 dark:bg-secondary-dark/10 
                  border border-border dark:text-black dark:border-border-dark
                  text-primary dark:text-primary-dark
                  placeholder-secondary dark:placeholder-secondary-dark
                  focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark/20
                  focus:border-primary dark:focus:border-primary-dark"
                disabled={isLoadingChat}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoadingChat || !inputValue.trim()}
                className={`
                  p-3 rounded-full flex items-center justify-center
                  ${isLoadingChat || !inputValue.trim() 
                    ? 'bg-secondary/20 dark:bg-secondary-dark/20 cursor-not-allowed' 
                    : 'bg-primary dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary'}
                  transition-colors duration-200
                `}
              >
                {isLoadingChat ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-b from-white to-gray-50/50 
      dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700
      shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm border-b 
        border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <Brain size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            Learning Assistant
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-4 bg-gray-50/50 dark:bg-gray-900">
        {['summary', 'chat', 'notes'].map((tab) => (
        <button 
            key={tab}
            onClick={() => setActiveTab(tab as 'summary' | 'chat' | 'notes')}
            className={`flex-1 py-3 px-4 text-sm font-medium capitalize rounded-t-lg
              transition-colors duration-200 ${
              activeTab === tab 
                ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 shadow-sm border-t border-x border-gray-100 dark:border-gray-700' 
                : 'text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
        >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 bg-white dark:bg-gray-800 overflow-hidden rounded-t-xl shadow-inner">
        <div className="h-full overflow-y-auto px-6 py-4">
          {/* API warning */}
        {!apiConfigured && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm p-3 rounded-lg mb-3 flex items-start">
            <AlertTriangle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Gemini API key not configured</p>
              <p className="mt-1 text-xs">Please add your Gemini API key in the settings to use the learning features.</p>
              <button 
                  onClick={testGeminiAPI} 
                className="mt-2 px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded text-xs font-medium inline-flex items-center"
                >
                  Test API Connection
              </button>
            </div>
          </div>
        )}

          {/* Dynamic content based on active tab */}
          <div className="h-full overflow-y-auto">
        {activeTab === 'summary' && (
          <div className="h-full overflow-y-auto pb-16">
            {isLoadingSummary ? (
              <div className="flex flex-col items-center justify-center h-40">
                <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Generating summary...</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Key Points:</h3>
                  <button 
                    onClick={() => fetchSummary(transcript)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                    </svg>
                    Refresh
                  </button>
                </div>
                
                <div className="space-y-3">
                  {summaryPoints.length > 0 ? (
                    summaryPoints.map((point, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start p-3 rounded-lg ${
                          point.includes("Failed to generate summary")
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                            : 'bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                        }`}
                      >
                        {point.includes("Failed to generate summary") ? (
                          <div className="flex items-start">
                            <AlertTriangle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{point}</p>
                          </div>
                        ) : (
                          <>
                        <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{point}</p>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                      No summary available yet. Click refresh to generate a new summary.
                    </div>
                  )}
                </div>
                
                {summaryPoints.length > 0 && !summaryPoints[0].includes("Failed to generate summary") && (
                  <button 
                    onClick={() => handleCopy(summaryPoints.join('\n\n'))}
                    className="mt-4 w-full flex items-center justify-center py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <Copy size={14} className="mr-2" />
                    Copy Summary
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-full flex flex-col relative">
            <div 
              ref={chatContainerRef}
                  className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                >
                  {renderChatMessages()}
                  </div>
                
                {/* Chat input */}
                <div className="w-full sticky bottom-0 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md pt-3 pb-4 px-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="relative flex items-center">
                    {/* Emoji button - can be implemented later */}
                    <button 
                      className="absolute left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      onClick={() => {/* Add emoji picker later */}}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                        <line x1="9" y1="9" x2="9.01" y2="9"/>
                        <line x1="15" y1="9" x2="15.01" y2="9"/>
                      </svg>
                    </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about the video..."
                      className="w-full pl-12 pr-24 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl
                        border border-gray-200 dark:border-gray-700
                        focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-400 dark:focus:border-blue-400
                        placeholder-gray-500 dark:placeholder-gray-400
                        transition-all duration-200"
                  disabled={isLoadingChat}
                />

                    <div className="absolute right-2 flex items-center gap-2">
                      {/* Character count */}
                      {inputValue.length > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">
                          {inputValue.length}/500
                        </span>
                      )}

                      {/* Send button */}
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoadingChat}
                        className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2
                          ${inputValue.trim() && !isLoadingChat
                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/25'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        {isLoadingChat ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-sm font-medium">Thinking...</span>
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            <span className="text-sm font-medium">Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick suggestions */}
                  <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    <button 
                      className="flex-shrink-0 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 
                        rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200/60 dark:border-gray-700"
                      onClick={() => setInputValue("Can you explain this in simpler terms?")}
                    >
                      🤔 Explain simpler
                    </button>
                    <button 
                      className="flex-shrink-0 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 
                        rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200/60 dark:border-gray-700"
                      onClick={() => setInputValue("Can you show me an example?")}
                    >
                      💡 Show example
                    </button>
                    <button 
                      className="flex-shrink-0 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 
                        rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200/60 dark:border-gray-700"
                      onClick={() => setInputValue("What are the best practices for this?")}
                    >
                      ✨ Best practices
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
              <div className="h-full overflow-y-auto">
            {isLoadingNotes ? (
              <div className="flex flex-col items-center justify-center h-40">
                <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Generating notes...</p>
              </div>
            ) : (
              <div className="mb-20">
                <h3 className="text-sm font-semibold mb-3 mt-3 text-gray-800 dark:text-white">Study Notes:</h3>
                
                {notes ? (
                  <div 
                        className={`prose prose-sm max-w-none dark:prose-invert 
                          bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700
                          prose-headings:mt-4 prose-headings:mb-2 
                          prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1
                          prose-headings:text-gray-900 dark:prose-headings:text-white
                          prose-p:text-gray-800 dark:prose-p:text-gray-200
                          prose-strong:text-blue-700 dark:prose-strong:text-blue-300
                          prose-code:text-purple-700 dark:prose-code:text-purple-300
                          prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800/50`}
                    dangerouslySetInnerHTML={{ __html: notes }}
                  />
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                    No notes available yet. Try refreshing.
                  </p>
                )}
                
                {notes && (
                  <button 
                    onClick={() => handleCopy(notes.replace(/<[^>]*>/g, ''))}
                    className="mt-4 w-full flex items-center justify-center py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <Copy size={14} className="mr-2" />
                    Copy Notes
                  </button>
                )}
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningSidebar;