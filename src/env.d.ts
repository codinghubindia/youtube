/// <reference types="vite/client" />

interface ImportMetaEnv {
  // YouTube API Keys
  readonly VITE_YOUTUBE_API_KEY: string;
  readonly VITE_YOUTUBE_API_KEY_1: string;
  readonly VITE_YOUTUBE_API_KEY_2: string;
  readonly VITE_YOUTUBE_API_KEY_3: string;
  readonly VITE_YOUTUBE_API_KEY_4: string;
  
  // Gemini API Keys
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GEMINI_API_KEY_1: string;
  readonly VITE_GEMINI_API_KEY_2: string;
  readonly VITE_GEMINI_API_KEY_3: string;
  
  // Allow other variables
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 