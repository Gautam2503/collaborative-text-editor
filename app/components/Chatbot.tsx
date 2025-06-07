'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ChatBot component with no SSR
const ChatBot = dynamic(
  () => import('react-chatbotify').then((mod) => mod.default),
  { ssr: false }
);

// Create a wrapper component that handles the chat logic
const ChatbotClient = () => {
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [flow, setFlow] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client side
    setIsClient(true);
    
    const initializeChatbot = async () => {
      try {
        // Dynamically import required modules
        const [
          { getDefaultSettings },
          { default: LlmConnector },
          { GeminiProvider }
        ] = await Promise.all([
          import('react-chatbotify'),
          import('@rcb-plugins/llm-connector'),
          import('@rcb-plugins/llm-connector')
        ]);

        // Get the API key from environment variables
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
        
        // Initialize settings
        const defaultSettings = getDefaultSettings();
        if (defaultSettings?.header) {
          defaultSettings.header.title = "AI Assistant";
        }
        
        // Initialize plugins
        const connector = LlmConnector();
        
        // Set up the conversation flow
        const chatFlow = {
          start: {
            message: "Hello! I'm your AI assistant. How can I help you today?",
            options: ["I'm ready!"],
            chatDisabled: true,
            path: async (params: any) => {
              if (!apiKey) {
                await params.simulateStreamMessage("API key is not configured!");
                return "start";
              }
              await params.simulateStreamMessage("How can I assist you today?");
              return "gemini";
            },
          },
          gemini: {
            llmConnector: {
              provider: new GeminiProvider({
                mode: 'direct',
                model: 'gemini-1.5-flash',
                responseFormat: 'stream',
                apiKey: apiKey,
              }),
              outputType: 'character',
            },
          },
        };

        setSettings(defaultSettings);
        setPlugins([connector]);
        setFlow(chatFlow);
      } catch (err) {
        console.error('Error initializing chatbot:', err);
        setError('Failed to initialize chatbot. Please try again later.');
      }
    };

    initializeChatbot();
  }, []);

  // Don't render anything on the server
  if (!isClient) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[500px] text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  if (!settings || !flow) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px' }}>
      <ChatBot
        settings={settings}
        plugins={plugins}
        flow={flow}
      />
    </div>
  );
};

// Export the component
export default ChatbotClient;
