import { useState } from "react";
import "../styles/Sidebar.css";

const Sidebar = ({
    sessions,
    activeSessionId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    onLogout,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const sortedSessions = [...sessions].sort((a, b) => {
        const timeA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const timeB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return timeB - timeA;
    });

    return (
        <>
            {/* Mobil menü butonu */}
            <button
                className="sidebar__toggle-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>

            <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
                <div className="sidebar__controls">
                    <button type="button" className="sidebar__control-button" onClick={onNewChat}>
                        Yeni Sohbet
                    </button>
                    <button
                        type="button"
                        className="sidebar__control-button sidebar__control-button--secondary"
                        onClick={onLogout}
                    >
                        Çıkış
                    </button>
                </div>

                <div className="sidebar__history">
                    {sortedSessions.length === 0 && <p className="sidebar__empty">Henüz sohbet yok</p>}

                    {sortedSessions.map((session) => {
                        const isActive = session.id === activeSessionId;
                        return (
                            <div
                                key={session.id}
                                className={`sidebar__session ${isActive ? "sidebar__session--active" : ""}`}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    onSelectChat(session.id);
                                    setIsOpen(false); // mobilde otomatik kapat
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        onSelectChat(session.id);
                                        setIsOpen(false);
                                    }
                                }}
                            >
                                <div className="sidebar__session-info">
                                    <h3 className="sidebar__session-title">
                                        {session.title || "Adsız sohbet"}
                                    </h3>
                                    <p className="sidebar__session-date">
                                        {new Date(session.updatedAt ?? session.createdAt).toLocaleString("tr-TR")}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="sidebar__delete"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onDeleteChat(session.id);
                                    }}
                                    aria-label="Sohbeti sil"
                                >
                                    x
                                </button>
                            </div>
                        );
                    })}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
