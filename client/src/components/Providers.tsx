"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { NotificationProvider } from "@/context/NotificationContext";
import { ChatProvider } from "@/context/ChatContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";


export default function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = "325997258384-sh787sh787sh787sh787.apps.googleusercontent.com"; // From .env

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <ThemeProvider>
          <NotificationProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </NotificationProvider>
        </ThemeProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}



