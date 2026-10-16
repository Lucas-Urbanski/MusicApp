export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  audioUrl?: string;
  attachmentName?: string;
  attachmentType?: "audio" | "video";
}

export interface ChatsTable {
  id: string | undefined;
  title: string;
  isArchived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GeminiComposition {
  title: string;
  keySignature: string;
  tempoBpm: number;
  chords: { chordName: string; durationBars: number }[];
}

export type MediaType = "audio" | "video";

export type GenerationResponse =
  | { provider: "gemini"; data: GeminiComposition }
  | { provider: "suno"; taskId: string };

export interface SunoTaskStatus {
  status: string;
  audioUrl?: string;
  title?: string;
}

export interface MediaUpload {
  path: string;
  url: string;
  type: MediaType;
}

export interface ChatMessageProps {
  message: ChatMessage;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOldChat: (chatId: string | undefined) => void;
  onNewChat: () => void;
  allChats: ChatsTable[];
}

export interface WelcomeHeroProps {
  userName?: string;
}

export interface ChatInputProps {
  prompt: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  mediaFile: File | null;
  onMediaChange: (file: File | null) => void;
  isLoading: boolean;
}

export interface MusicChatViewProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  mediaFile: File | null;
  mediaError: string | null;
  onMediaChange: (file: File | null) => void;
  messages: ChatMessage[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  onSidebarChange: (isOpen: boolean) => void;
  userName: string;
  chats: ChatsTable[];
  isSupaLoading: boolean;
  onSubmit: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string | undefined) => void;
}

export interface SignUpFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInFormValues {
  email: string;
  password: string;
}
