import { createClient } from "@/utils/supabase/client";
import { ChatMessage } from "@/types/chat";

export const supabase = createClient();

export async function supaUserDetails() {
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return error;
  return data.claims;
}

export async function getSupaChats() {
  const { data, error } = await supabase.from("Chats").select();
  if (error || data == null) return; // This is a hotfix
  return data;
}

export async function getSupaMessages(chat_id: string) {
  const { data, error } = await supabase.from("Messages")
                                          .select()
                                          .eq("chats_id", chat_id)
                                          .order("created_at", {ascending: true});
  // console.log(data);
  if (error || data == null) {console.log(error); return;} // This is a hotfix
  return data;
}

export async function insertSupaChats(title: string = "New Chat 1") {
  const { data, error } = await supabase.from("Chats")
                                    .insert({title: title})
                                    .select();
  if (error || data == null) return; // This is a hotfix
  return data;
}

export async function insertSupaMessages(message: ChatMessage, chat_id: string) {
  const { data, error } = await supabase.from("Messages")
                                          .insert({role: message.role, content: message.content, chats_id: chat_id});
                                          

  if (error || data == null) {console.log(error); return}; // This is a hotfix
  console.log(data);
  return data;
}