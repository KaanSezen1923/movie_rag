import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import Chatbot from "./components/Chatbot";
import Sidebar from "./components/Sidebar";
import "./App.css";

const API_BASE_URL = "https://agentic-movie-recommendation-system-api-7.onrender.com";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Kullanıcı girişini kontrol et
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

  // Kullanıcı giriş yaptığında sohbetleri yükle
  useEffect(() => {
    if (isAuthenticated && username) {
      loadChatsFromFirestore();
    }
  }, [isAuthenticated, username]);

  // Firestore'dan sohbetleri yükle
  const loadChatsFromFirestore = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}/chats`);
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
        
        // Eğer hiç sohbet yoksa yeni bir tane oluştur
        if (data.length === 0) {
          handleNewChat();
        } else {
          // En son güncellenen sohbeti aktif yap
          const sortedChats = [...data].sort((a, b) => {
            const timeA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
            const timeB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
            return timeB - timeA;
          });
          setActiveSessionId(sortedChats[0].id);
        }
      }
    } catch (error) {
      console.error("Sohbetler yüklenirken hata:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Yeni sohbet oluştur
  const handleNewChat = async () => {
    const newSessionId = `chat-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newSession = {
      id: newSessionId,
      title: "Yeni Sohbet",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });

      if (response.ok) {
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSessionId);
      }
    } catch (error) {
      console.error("Yeni sohbet oluşturulurken hata:", error);
    }
  };

  // Sohbet seç
  const handleSelectChat = (sessionId) => {
    setActiveSessionId(sessionId);
  };

  // Sohbet sil
  const handleDeleteChat = async (sessionId) => {
    if (!window.confirm("Bu sohbeti silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${username}/chats/${sessionId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        
        // Silinen sohbet aktif sohbetse, başka bir sohbeti aktif yap
        if (activeSessionId === sessionId) {
          const remaining = sessions.filter((s) => s.id !== sessionId);
          if (remaining.length > 0) {
            setActiveSessionId(remaining[0].id);
          } else {
            handleNewChat();
          }
        }
      }
    } catch (error) {
      console.error("Sohbet silinirken hata:", error);
    }
  };

  // Mesajları güncelle ve Firestore'a kaydet
  const handleUpdateMessages = async (sessionId, updater) => {
    setSessions((prevSessions) => {
      const updatedSessions = prevSessions.map((session) => {
        if (session.id === sessionId) {
          const currentMessages = session.messages || [];
          const newMessages = typeof updater === "function" 
            ? updater(currentMessages) 
            : updater;
          
          return {
            ...session,
            messages: newMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return session;
      });

      // Güncellenmiş sohbeti Firestore'a kaydet
      const updatedSession = updatedSessions.find((s) => s.id === sessionId);
      if (updatedSession) {
        saveSessionToFirestore(updatedSession);
        
        // İlk mesajdan sonra başlığı güncelle
        if (updatedSession.messages.length === 2 && updatedSession.title === "Yeni Sohbet") {
          const firstUserMessage = updatedSession.messages.find((m) => m.role === "user");
          if (firstUserMessage && firstUserMessage.text) {
            const newTitle = firstUserMessage.text.substring(0, 30) + 
              (firstUserMessage.text.length > 30 ? "..." : "");
            updatedSession.title = newTitle;
            saveSessionToFirestore(updatedSession);
          }
        }
      }

      return updatedSessions;
    });
  };

  // Sohbeti Firestore'a kaydet
  const saveSessionToFirestore = async (session) => {
    try {
      await fetch(`${API_BASE_URL}/users/${username}/chats/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
    } catch (error) {
      console.error("Sohbet kaydedilirken hata:", error);
    }
  };

  // Çıkış yap
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setIsAuthenticated(false);
    setUsername("");
    setSessions([]);
    setActiveSessionId(null);
  };

  // Giriş yapılmamışsa AuthForm göster
  if (!isAuthenticated) {
    return (
      <div className="app">
        <AuthForm />
      </div>
    );
  }

  // Sohbetler yükleniyorsa loading göster
  if (isLoadingSessions) {
    return (
      <div className="app">
        <div className="loading-container">
          <p>Sohbetler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const activeMessages = activeSession?.messages || [];

  return (
    <div className="app">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onLogout={handleLogout}
      />
      <main className="app__main">
        <Chatbot
          sessionId={activeSessionId}
          messages={activeMessages}
          onUpdateMessages={handleUpdateMessages}
        />
      </main>
    </div>
  );
}

export default App;