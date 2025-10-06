import "../styles/Sidebar.css";

const formatTimestamp = (isoDate) => {
    if (!isoDate) return "Yeni sohbet";
    try {
        const date = new Date(isoDate);
        return date.toLocaleString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        return "Yeni sohbet";
    }
};

const Sidebar = ({
    sessions,
    activeSessionId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    onLogout,
}) => {
    const sortedSessions = [...sessions].sort((a, b) => {
        const timeA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const timeB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return timeB - timeA;
    });

    return (
        <aside className="sidebar">
            <div className="sidebar__controls">
                <button type="button" className="sidebar__control-button" onClick={onNewChat}>
                    Yeni Sohbet
                </button>
                <button
                    type="button"
                    className="sidebar__control-button sidebar__control-button--secondary"
                    onClick={onLogout}
                >
                    Cikis
                </button>
            </div>

            <div className="sidebar__history">
                {sortedSessions.length === 0 && <p className="sidebar__empty">Henuz sohbet yok</p>}

                {sortedSessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    return (
                        <div
                            key={session.id}
                            className={`sidebar__session ${isActive ? "sidebar__session--active" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelectChat(session.id)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    onSelectChat(session.id);
                                }
                            }}
                        >
                            <div className="sidebar__session-info">
                                <h3 className="sidebar__session-title">{session.title || "Adsiz sohbet"}</h3>
                                <p className="sidebar__session-date">
                                    {formatTimestamp(session.updatedAt ?? session.createdAt)}
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
    );
};

export default Sidebar;