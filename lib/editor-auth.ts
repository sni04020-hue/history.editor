import { getChatGPTUser } from "../app/chatgpt-auth";

const EDITOR_EMAIL = "bucaner0914@gmail.com";

export async function getAuthorizedEditor() {
  const user = await getChatGPTUser();
  if (!user || user.email.toLowerCase() !== EDITOR_EMAIL) return null;
  return user;
}
