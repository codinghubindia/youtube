import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Loader2,
  Send,
  Copy,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Check
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
}

const LearningSidebar: React.FC<LearningSidebarProps> = ({ videoId, videoTitle, isVisible }) => {
  // State for the current active tab
  const [activeTab, setActiveTab] = useState<'summary' | 'chat' | 'notes'>('summary');
  
  // State for loading indicators
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{success: boolean; message: string} | null>(null);
  
  // State for content
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [transcript, setTranscript] = useState('');
  const [apiConfigured, setApiConfigured] = useState(isGeminiConfigured());
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // State for responsive mode
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isExpanded, setIsExpanded] = useState(true);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(500); // Default height for bottom sheet
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check for mobile view on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      
      // Adjust bottom sheet size when resizing
      if (window.innerWidth < 768) {
        setBottomSheetHeight(Math.min(500, window.innerHeight * 0.7));
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize content
  useEffect(() => {
    if (videoId && isVisible) {
      fetchTranscript();
    }
  }, [videoId, isVisible]);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch transcript
  const fetchTranscript = async () => {
    try {
      const transcriptText = await getTranscript(videoId);
      setTranscript(transcriptText);
      
      // After getting transcript, fetch summary and notes
      fetchSummary(transcriptText);
      fetchNotes(transcriptText);
      
      // Add initial AI message in chat
      setMessages([
        { 
          role: 'ai', 
          content: `<p>Hi there! I'm your learning assistant for <strong>${videoTitle}</strong>. How can I help you understand this content better?</p>
          <p>Try asking me questions about the video content, key concepts, or request clarification on specific topics.</p>` 
        }
      ]);

      // If API is not configured, add some sample messages to showcase the UI
      if (!apiConfigured) {
        const video = getVideoById(videoId);
        const mockTranscript = getMockTranscript(videoId);
        
        setTranscript(mockTranscript);
        fetchSummary(mockTranscript);
        fetchNotes(mockTranscript);
        
        // Add initial AI message in chat with real video content
        setTimeout(() => {
          setMessages([
            { 
              role: 'ai', 
              content: `<p>Hi there! I'm your learning assistant for <strong>${video?.title || videoTitle}</strong>. I can help you understand the concepts covered in this tutorial.</p>
              <p>Feel free to ask questions about ${video?.category === 'Web Development' ? 'React components, hooks, state management,' : ''} or any other topics discussed!</p>` 
            },
            { 
              role: 'user', 
              content: video?.category === 'Web Development' ? 
                'What are the main benefits of using React hooks?' : 
                'Can you explain the key concepts covered in this video?' 
            },
            { 
              role: 'ai', 
              content: video?.category === 'Web Development' ? 
                `<p>Great question! React hooks offer several key advantages:</p>
                <ul>
                  <li><strong>Simplified State Management:</strong> useState makes it easy to handle component state without classes</li>
                  <li><strong>Side Effect Control:</strong> useEffect provides a clear way to manage lifecycle events and side effects</li>
                  <li><strong>Code Reusability:</strong> Custom hooks allow you to extract and share stateful logic between components</li>
                  <li><strong>Reduced Boilerplate:</strong> Hooks eliminate the need for complex class syntax and lifecycle methods</li>
                </ul>
                <p>Would you like to see some practical examples of how these hooks work?</p>` :
                `<p>Here are the main concepts covered in the video:</p>
                <ul>
                  <li><strong>Fundamentals:</strong> Core principles and basic concepts</li>
                  <li><strong>Best Practices:</strong> Industry-standard approaches and patterns</li>
                  <li><strong>Practical Examples:</strong> Real-world applications and use cases</li>
                  <li><strong>Advanced Topics:</strong> In-depth exploration of complex scenarios</li>
                </ul>
                <p>Which of these areas would you like to explore further?</p>`
            }
          ]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
      
      // If there's an error or API is not configured, show realistic mock data
      if (!apiConfigured) {
        // Mock transcript data for a real educational video
        const mockTranscript = `Welcome to this comprehensive tutorial on modern web development. Today we'll explore React.js fundamentals and best practices.

We'll start with component architecture, understanding how to structure your applications for scalability. Then we'll dive into hooks like useState and useEffect, seeing how they revolutionize state management.

Key topics we'll cover include:
1. Component lifecycle and hooks
2. State management patterns
3. Performance optimization techniques
4. Error boundaries and debugging

By the end of this video, you'll have a solid foundation in React development and modern JavaScript practices.`;
        
        setTranscript(mockTranscript);
        fetchSummary(mockTranscript);
        fetchNotes(mockTranscript);
        
        // Add initial AI message in chat with real educational content
        setMessages([
          { 
            role: 'ai', 
            content: `<p>Hi there! I'm your learning assistant for <strong>${videoTitle || "React.js Fundamentals"}</strong>. I can help you understand the concepts covered in this tutorial.</p>
            <p>Feel free to ask questions about React components, hooks, state management, or any other topics discussed!</p>` 
          },
          { 
            role: 'user', 
            content: 'What are the main benefits of using React hooks?' 
          },
          { 
            role: 'ai', 
            content: `<p>Great question! React hooks offer several key advantages:</p>
            <ul>
              <li><strong>Simplified State Management:</strong> useState makes it easy to handle component state without classes</li>
              <li><strong>Side Effect Control:</strong> useEffect provides a clear way to manage lifecycle events and side effects</li>
              <li><strong>Code Reusability:</strong> Custom hooks allow you to extract and share stateful logic between components</li>
              <li><strong>Reduced Boilerplate:</strong> Hooks eliminate the need for complex class syntax and lifecycle methods</li>
            </ul>
            <p>Would you like to see some practical examples of how these hooks work?</p>` 
          }
        ]);
      }
    }
  };
  
  // Fetch summary with realistic educational content
  const fetchSummary = async (transcriptText: string) => {
    setIsLoadingSummary(true);
    try {
      const points = await generateSummary(transcriptText, videoTitle, videoId);
      setSummaryPoints(points);
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // If there's an error or API is not configured, show realistic mock data
      if (!apiConfigured) {
        setTimeout(() => {
          setSummaryPoints([
            "React components are the building blocks of modern web applications, enabling reusable and maintainable UI development",
            "Hooks like useState and useEffect simplify state management and side effects in functional components",
            "Performance optimization techniques include memoization, code splitting, and proper key usage in lists",
            "Error boundaries provide a way to gracefully handle runtime errors and improve application reliability",
            "Modern JavaScript features like async/await and destructuring enhance code readability and maintainability",
            "Best practices include proper component composition, state management patterns, and testing strategies"
          ]);
          setIsLoadingSummary(false);
        }, 1500);
        return;
      }
    } finally {
      if (apiConfigured) {
        setIsLoadingSummary(false);
      }
    }
  };
  
  // Fetch notes with comprehensive educational content
  const fetchNotes = async (transcriptText: string) => {
    setIsLoadingNotes(true);
    try {
      const notesContent = await generateNotes(transcriptText, videoTitle, videoId);
      setNotes(notesContent);
    } catch (error) {
      console.error('Error generating notes:', error);
      
      // If there's an error or API is not configured, show realistic mock data
      if (!apiConfigured) {
        setTimeout(() => {
          setNotes(`
          <h2>Modern Web Development with React.js</h2>

          <h3>1. React Fundamentals</h3>
          <ul>
            <li><strong>Components:</strong> Building blocks of React applications
              <ul>
                <li>Functional components vs Class components</li>
                <li>Props and state management</li>
                <li>Component lifecycle and side effects</li>
              </ul>
            </li>
            <li><strong>JSX:</strong> Declarative UI development
              <ul>
                <li>Syntax and expressions</li>
                <li>Conditional rendering</li>
                <li>List rendering and keys</li>
              </ul>
            </li>
          </ul>
          
          <h3>2. React Hooks</h3>
          <p>Modern approach to state management and side effects:</p>
          <ul>
            <li><strong>useState:</strong> Managing component state
              <pre><code>const [count, setCount] = useState(0);</code></pre>
            </li>
            <li><strong>useEffect:</strong> Handling side effects
              <pre><code>useEffect(() => {
  // Side effect code
  return () => {
    // Cleanup code
  };
}, [dependencies]);</code></pre>
          </li>
          <li><strong>Custom Hooks:</strong> Reusable stateful logic</li>
        </ul>
        
        <h3>3. Performance Optimization</h3>
        <p>Key techniques for improving React application performance:</p>
        <ul>
          <li>Memoization with useMemo and useCallback</li>
          <li>Code splitting and lazy loading</li>
          <li>Virtual DOM and reconciliation</li>
          <li>Proper key usage in lists</li>
        </ul>
        
        <h3>4. Best Practices</h3>
        <p>Essential guidelines for React development:</p>
        <ol>
          <li>Component composition and reusability</li>
          <li>State management patterns</li>
          <li>Error handling and debugging</li>
          <li>Testing strategies</li>
          <li>Code organization and project structure</li>
        </ol>
        
        <h3>5. Additional Resources</h3>
        <p>Recommended resources for further learning:</p>
        <ul>
          <li>Official React documentation</li>
          <li>React Developer Tools</li>
          <li>Community tutorials and courses</li>
          <li>Popular React libraries and tools</li>
        </ul>
        `);
          setIsLoadingNotes(false);
        }, 2000);
        return;
      }
    } finally {
      if (apiConfigured) {
        setIsLoadingNotes(false);
      }
    }
  };
  
  // Handle sending a chat message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const newUserMessage: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    
    // Show typing indicator
    setIsLoadingChat(true);
    
    try {
      if (apiConfigured) {
        // Get AI response from API if configured
        const response = await getChatResponse(inputValue, transcript, videoTitle, videoId);
        
        // Add AI response to chat
        const newAiMessage: Message = { role: 'ai', content: response };
        setMessages(prev => [...prev, newAiMessage]);
      } else {
        // If API is not configured, provide mock responses with a delay
        const userQuestion = inputValue.toLowerCase();
        
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let mockResponse = '';
        
        // Generate different responses based on the user's question
        if (userQuestion.includes('explain') || userQuestion.includes('what is')) {
          mockResponse = `<p>Great question! Let me explain that in more detail.</p>
          <p>This concept is a fundamental part of the topic being discussed in the video. It involves understanding how different elements interact with each other to produce the desired outcome.</p>
          <p>Here's a breakdown:</p>
          <ul>
            <li><strong>Component 1:</strong> Handles the initial processing and validation</li>
            <li><strong>Component 2:</strong> Manages the transformation of data</li>
            <li><strong>Component 3:</strong> Ensures proper output and error handling</li>
          </ul>
          <p>Does that help clarify things for you?</p>`;
        } else if (userQuestion.includes('example') || userQuestion.includes('show me')) {
          mockResponse = `<p>I'd be happy to provide an example!</p>
          <p>Here's a practical example from the video:</p>
          <pre><code>
          function demonstrateProcess(input) {
            // Step 1: Initialize the components
            const result = processInput(input);
            
            // Step 2: Apply the transformation
            const transformed = transform(result);
            
            // Step 3: Validate and return
            return validate(transformed);
          }
          </code></pre>
          <p>In this example, you can see how the three main steps work together to process the input and produce a validated output.</p>
          <p>Would you like me to elaborate on any specific part of this example?</p>`;
        } else if (userQuestion.includes('difference') || userQuestion.includes('compare')) {
          mockResponse = `<p>Let me explain the key differences:</p>
          <table>
            <tr>
              <th>Feature</th>
              <th>Approach A</th>
              <th>Approach B</th>
            </tr>
            <tr>
              <td>Performance</td>
              <td>Faster for small datasets</td>
              <td>More efficient with large datasets</td>
            </tr>
            <tr>
              <td>Complexity</td>
              <td>Simpler implementation</td>
              <td>More complex but more powerful</td>
            </tr>
            <tr>
              <td>Use cases</td>
              <td>Quick prototyping</td>
              <td>Production systems</td>
            </tr>
          </table>
          <p>The video recommends using Approach A when you're just getting started, and then transitioning to Approach B as your needs grow more complex.</p>`;
        } else if (userQuestion.includes('best practice') || userQuestion.includes('should i')) {
          mockResponse = `<p>According to best practices mentioned in the video:</p>
          <ol>
            <li><strong>Always validate your inputs</strong> - This prevents many common errors</li>
            <li><strong>Use proper error handling</strong> - Don't just catch errors, handle them appropriately</li>
            <li><strong>Document your code</strong> - This makes maintenance much easier</li>
            <li><strong>Follow the principle of least privilege</strong> - Only provide access to what's necessary</li>
            <li><strong>Test thoroughly</strong> - Cover both normal usage and edge cases</li>
          </ol>
          <p>The presenter specifically emphasized that following these practices can save you a lot of troubleshooting time later in the development process.</p>`;
        } else {
          mockResponse = `<p>Thanks for your question about "${inputValue}".</p>
          <p>Based on the video content, this topic relates to the core principles discussed around the 15-minute mark. The presenter emphasized the importance of understanding the underlying concepts before moving on to more advanced applications.</p>
          <p>Key insights from the video on this topic include:</p>
          <ul>
            <li>The foundational principles that guide the implementation</li>
            <li>How different components interact with each other</li>
            <li>Common pitfalls to avoid during development</li>
          </ul>
          <p>Would you like me to elaborate on any specific aspect of this topic?</p>`;
        }
        
        // Add AI response to chat
        const newAiMessage: Message = { role: 'ai', content: mockResponse };
        setMessages(prev => [...prev, newAiMessage]);
      }
    } catch (error) {
      console.error('Error getting chat response:', error);
      
      // Add error message to chat
      const errorMessage: Message = { 
        role: 'ai', 
        content: '<p>Sorry, I encountered an error processing your request. Please try again.</p>' 
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

  // Toggle expand/collapse for mobile bottom sheet
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Function to handle drag on the bottom sheet
  const startDrag = (e: React.TouchEvent | React.MouseEvent) => {
    // For direct mouse events
    const startY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    const startHeight = bottomSheetHeight;
    
    const doDrag = (e: MouseEvent | TouchEvent) => {
      const currentY = 'clientY' in e ? e.clientY : (e as TouchEvent).touches[0].clientY;
      const newHeight = Math.max(100, startHeight + startY - currentY);
      setBottomSheetHeight(newHeight);
    };
    
    const stopDrag = () => {
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('touchmove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchend', stopDrag);
      
      // Set fully expanded or collapsed based on height thresholds
      if (bottomSheetHeight < 150) {
        setBottomSheetHeight(100);
        setIsExpanded(false);
      } else if (bottomSheetHeight > window.innerHeight / 2) {
        setBottomSheetHeight(window.innerHeight * 0.8);
        setIsExpanded(true);
      }
    };
    
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('touchmove', doDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
  };

  // Test the Gemini API connection
  const handleTestApi = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    
    try {
      const result = await testGeminiAPI();
      setApiTestResult(result);
    } catch (error) {
      setApiTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Create a different UI for mobile vs desktop
  if (isMobileView) {
    return (
      <div 
        ref={sidebarRef}
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-50 transition-all duration-300 rounded-t-2xl
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ 
          height: isExpanded ? `${bottomSheetHeight}px` : '100px',
          maxHeight: '85vh'
        }}
      >
        {/* Drag handle */}
        <div 
          className="w-full h-6 flex justify-center items-center cursor-grab active:cursor-grabbing"
          onTouchStart={startDrag}
          onMouseDown={startDrag}
        >
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 pb-2">
          <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
            <Brain size={18} className="mr-2 text-blue-600 dark:text-blue-400" />
            Learning Assistant
          </h3>
          <button 
            onClick={toggleExpand}
            className="p-1 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
        
        {/* Content - only show if expanded */}
        {isExpanded && (
          <div className="flex flex-col h-[calc(100%-50px)] overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
              {['summary', 'chat', 'notes'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as 'summary' | 'chat' | 'notes')}
                  className={`flex-1 py-2 text-sm font-medium capitalize ${
                    activeTab === tab 
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Content area */}
            <div className="flex-1 overflow-hidden">
              {/* API warning - sticky at top */}
              {!apiConfigured && (
                <div className="sticky top-0 z-10 px-4 py-2 bg-white dark:bg-gray-900">
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm p-3 rounded-lg">
                    <AlertTriangle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Gemini API key not configured</p>
                      <p className="mt-1 text-xs">Please add your Gemini API key in the settings.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Scrollable content */}
              <div className="h-full overflow-y-auto px-4 pb-safe">
                {/* Dynamic content based on active tab */}
                <div className="space-y-4 pb-20">
                  {/* Content rendering based on activeTab */}
                  {activeTab === 'summary' && (
                    <div className="space-y-4 pb-20">
                      {isLoadingSummary ? (
                        <div className="flex flex-col items-center justify-center h-40">
                          <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Generating summary...</p>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-sm font-semibold sticky top-0 py-2 bg-white dark:bg-gray-900 z-10">Key Points:</h3>
                          <ul className="space-y-3">
                            {summaryPoints.length > 0 ? (
                              summaryPoints.map((point, index) => (
                                <li 
                                  key={index} 
                                  className="flex items-start bg-gray-50 dark:bg-gray-800 p-3 rounded-lg transform transition-transform active:scale-98"
                                >
                                  <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0 mt-0.5">
                                    {index + 1}
                                  </span>
                                  <p className="text-sm text-gray-800 dark:text-gray-200">{point}</p>
                                </li>
                              ))
                            ) : (
                              <li className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                                No summary available yet. Try refreshing.
                              </li>
                            )}
                          </ul>
                          
                          {summaryPoints.length > 0 && (
                            <div className="sticky bottom-0 pt-4 pb-2 bg-white dark:bg-gray-900">
                              <button 
                                onClick={() => handleCopy(summaryPoints.join('\n\n'))}
                                className="w-full flex items-center justify-center py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-lg"
                              >
                                <Copy size={14} className="mr-2" />
                                Copy Summary
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="flex flex-col h-full pb-20">
                      <div 
                        ref={chatContainerRef}
                        className="flex-1 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                      >
                        {messages.map((message, index) => (
                          <div 
                            key={index} 
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} transform transition-transform active:scale-98`}
                          >
                            <div 
                              className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                                message.role === 'user' 
                                  ? 'bg-blue-600 text-white rounded-br-none' 
                                  : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                              }`}
                            >
                              <div 
                                className="text-sm"
                                dangerouslySetInnerHTML={{ __html: message.content }}
                              />
                            </div>
                          </div>
                        ))}
                        
                        {isLoadingChat && (
                          <div className="flex justify-start">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-w-[85%] rounded-bl-none">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Fixed input at bottom */}
                      <div className="sticky bottom-0 px-4 pt-2 pb-4 bg-white dark:bg-gray-900 shadow-lg">
                        <div className="relative">
                          <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask a question..."
                            className="w-full p-3 pr-12 bg-gray-100 dark:bg-gray-800 rounded-full focus:ring-2 focus:ring-blue-500"
                            disabled={isLoadingChat}
                          />
                          <button 
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoadingChat}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all
                              ${inputValue.trim() && !isLoadingChat
                                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'notes' && (
                    <div className="space-y-4 pb-20">
                      {isLoadingNotes ? (
                        <div className="flex flex-col items-center justify-center h-40">
                          <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Generating notes...</p>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-sm font-semibold sticky top-0 py-2 bg-white dark:bg-gray-900 z-10">Study Notes:</h3>
                          
                          {notes ? (
                            <div 
                              className="prose prose-sm max-w-none dark:prose-invert bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm
                                prose-headings:mt-4 prose-headings:mb-2 
                                prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1
                                prose-headings:text-gray-900 dark:prose-headings:text-white
                                prose-p:text-gray-800 dark:prose-p:text-gray-200
                                prose-strong:text-blue-700 dark:prose-strong:text-blue-300
                                prose-code:text-purple-700 dark:prose-code:text-purple-300
                                prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800/50"
                              dangerouslySetInnerHTML={{ __html: notes }}
                            />
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                              No notes available yet. Try refreshing.
                            </p>
                          )}
                          
                          {notes && (
                            <div className="sticky bottom-0 pt-4 pb-2 bg-white dark:bg-gray-900">
                              <button 
                                onClick={() => handleCopy(notes.replace(/<[^>]*>/g, ''))}
                                className="w-full flex items-center justify-center py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-lg"
                              >
                                <Copy size={14} className="mr-2" />
                                Copy Notes
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900 rounded-xl">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'summary' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          Summary
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'chat' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          Chat
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'notes' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          Notes
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden p-4">
        {/* API not configured warning */}
        {!apiConfigured && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm p-3 rounded-lg mb-3 flex items-start">
            <AlertTriangle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Gemini API key not configured</p>
              <p className="mt-1 text-xs">Please add your Gemini API key in the settings to use the learning features.</p>
              <button 
                onClick={handleTestApi} 
                className="mt-2 px-3 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded text-xs font-medium inline-flex items-center"
                disabled={isTestingApi}
              >
                {isTestingApi ? (
                  <>
                    <Loader2 size={12} className="mr-1 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test API Connection'
                )}
              </button>
              
              {apiTestResult && (
                <div className={`mt-2 p-2 rounded text-xs ${apiTestResult.success ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
                  <div className="flex items-start">
                    {apiTestResult.success ? (
                      <Check size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{apiTestResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="h-full overflow-y-auto pb-16">
            {isLoadingSummary ? (
              <div className="flex flex-col items-center justify-center h-40">
                <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Generating summary...</p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-white">Key Points:</h3>
                <ul className="space-y-3">
                  {summaryPoints.length > 0 ? (
                    summaryPoints.map((point, index) => (
                      <li 
                        key={index} 
                        className="flex items-start bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                      >
                        <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{point}</p>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                      No summary available yet. Try refreshing.
                    </li>
                  )}
                </ul>
                
                {summaryPoints.length > 0 && (
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

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col relative">
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto mb-16 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
            >
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  </div>
                </div>
              ))}
              
              {isLoadingChat && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-w-[85%] rounded-bl-none">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Fixed input at bottom for desktop */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about this video..."
                  className="w-full p-3 pr-12 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
                  disabled={isLoadingChat}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoadingChat}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full ${
                    inputValue.trim() && !isLoadingChat
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="h-full overflow-y-auto pb-4">
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
                    className="prose prose-sm max-w-none dark:prose-invert bg-gray-50 dark:bg-gray-800 p-4 rounded-lg prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1"
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
  );
};

export default LearningSidebar;