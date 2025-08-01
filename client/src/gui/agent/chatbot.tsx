// chatbot.tsx

/*
"""
this script should handle the chatbot's logic, including:
+ handling user's request
+ reading the scenario when it is needed
+ changing the state of the game via automated function calls (assuming user stops time running and recording)

NOT DONE

"""
Note: non-hooks (interface, class) does not go well together with hooks in a class
separate them, use import type (...) blah


*/

// Imports
import type { ChatMessage } from './chatbot.types';
import { useState } from 'react';
import {GoogleGenAI, FunctionCallingConfigMode, FunctionDeclaration, Type} from '@google/genai';


// Main

// This is your custom hook
export const useChatbot = () => {
  // Move all chatbot-related state inside the hook
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, text: "Welcome! How can I help you plan your scenario?", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Gemini AI
  const initializeGemini = () => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('VITE_GEMINI_API_KEY not found in environment variables');
      return null;
    }
    return new GoogleGenAI({ apiKey:GEMINI_API_KEY });
  };

  // Generate response using Gemini API
  const generateBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const ai = initializeGemini();
      if (!ai) {
        return "Sorry, I'm having trouble connecting to my AI service. Please check your API key configuration.";
      }

      // TODO: Create conversation context from recent messages (last 10 for efficiency)
      const recentMessages = messages.slice(-10);
      const conversationHistory = recentMessages
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');

      const prompt = `You are a helpful and respectful AI assistant for scenario planning. Here's our conversation history:

${conversationHistory}

User: ${userMessage}

Be short, concise and clear in your responses. If you need to perform an action, use the available tools.
Do not make up information if a tool is available to get it.`;

/*
You are a helpful and respectful AI assistant for a project.
Your role is to assist users with their questions, provide information, and perform tasks.
Be concise and clear in your responses. If you need to perform an action, use the available tools.
Do not make up information if a tool is available to get it.
*/

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });

      return response.text || "I apologize, but I couldn't generate a response. Please try again.";
      
    } catch (error) {
      console.error('Error generating response:', error);
      return "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.";
    }
  };

  // Move the handler logic inside the hook
  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };

    // Add user message and loading bot message
    const loadingBotMessage: ChatMessage = {
      id: Date.now() + 1,
      text: "Thinking...",
      sender: "bot",
      isLoading: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage, loadingBotMessage]);
    setInputValue(""); // Clear the input field immediately
    setIsLoading(true);

    try {
      // Generate bot response using Gemini
      const botResponseText = await generateBotResponse(inputValue);
      
      const botResponse: ChatMessage = {
        id: Date.now() + 2,
        text: botResponseText,
        sender: "bot",
      };

      // Replace loading message with actual response
      setMessages((prevMessages) => {
        const messagesWithoutLoading = prevMessages.filter(msg => !msg.isLoading);
        return [...messagesWithoutLoading, botResponse];
      });
      
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now() + 2,
        text: "Sorry, I encountered an error while processing your message. Please try again.",
        sender: "bot",
      };

      setMessages((prevMessages) => {
        const messagesWithoutLoading = prevMessages.filter(msg => !msg.isLoading);
        return [...messagesWithoutLoading, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Return the state and functions that the UI component will need
  return {
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    isLoading,
  };
};