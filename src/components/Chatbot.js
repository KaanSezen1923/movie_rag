import { useEffect, useRef, useState } from "react";
import MovieCard from "./MovieCard";
import "../styles/Chatbot.css";

const Chatbot = () => {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmedQuery = query.trim();
        if (!trimmedQuery || isLoading) return;

        const timestamp = Date.now();
        const userMessage = {
            id: `${timestamp}-user`,
            role: "user",
            text: trimmedQuery,
        };
        const pendingBotMessageId = `${timestamp}-bot`;

        setMessages((prevMessages) => [
            ...prevMessages,
            userMessage,
            {
                id: pendingBotMessageId,
                role: "bot",
                text: "",
                recommendations: [],
                isLoading: true,
                isError: false,
            },
        ]);

        setQuery("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `https://agentic-movie-recommendation-system-api-2.onrender.com/process_query/${encodeURIComponent(trimmedQuery)}`
            );

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data = await response.json();
            const recommendations = Array.isArray(data?.recommendations)
                ? data.recommendations
                : [];

            const recommendationsWithTrailers = await Promise.all(
                recommendations.map(async (movie) => {
                    const firstTitle = movie?.Title ?? movie?.title;
                    if (!firstTitle) return movie;

                    try {
                        const trailerRes = await fetch(
                            `https://agentic-movie-recommendation-system-api-2.onrender.com/get_trailer/${encodeURIComponent(firstTitle)}`
                        );

                        const imageRes = await fetch(
                            `https://agentic-movie-recommendation-system-api-2.onrender.com/get_image/${encodeURIComponent(firstTitle)}`
                        );

                        if (imageRes.ok) {
                            const imageData = await imageRes.json();
                            movie.image = imageData?.image_url ?? "";
                        }

                        if (trailerRes.ok) {
                            const trailerData = await trailerRes.json();
                            return { ...movie, trailer: trailerData?.trailer_url ?? "" };
                        } else {
                            return movie;
                        }
                    } catch (err) {
                        console.error(`Trailer fetch failed for ${firstTitle}:`, err);
                        return movie;
                    }
                })
            );



            let botText = "";
            if (typeof data === "string") {
                botText = data;
            } else {
                botText =
                    data?.message ??
                    data?.response ??
                    data?.emotion_response ??
                    "";

                if (!botText && recommendations.length === 0) {
                    botText = JSON.stringify(data);
                }
            }


            setMessages((prevMessages) =>
                prevMessages.map((message) =>
                    message.id === pendingBotMessageId
                        ? {
                              ...message,
                              text: botText,
                              recommendations: recommendationsWithTrailers,
                              isLoading: false,
                              isError: false,
                          }
                        : message
                )
            );
        }catch (error) {
            console.error("Error fetching response:", error);
            setMessages((prevMessages) =>
                prevMessages.map((message) =>
                    message.id === pendingBotMessageId
                        ? {
                              ...message,
                              text: "Sorry, we could not fetch recommendations. Please try again later.",
                              recommendations: [],
                              isLoading: false,
                              isError: true,
                          }
                        : message
                )
            );
        } finally {
            setIsLoading(false);
        }
    };



    const normalizeMovie = (movie = {}, fallbackIndex = 0) => ({
        key: (movie && (movie.Title || movie.title || movie.id)) ?? `movie-${fallbackIndex}`,
        title: movie?.Title ?? movie?.title ?? "Untitled",
        director: movie?.Director ?? movie?.director ?? "",
        starCast: movie?.Star_Cast ?? movie?.star_cast ?? movie?.cast ?? "",
        genre: movie?.Genre ?? movie?.genre ?? "",
        overview: movie?.Overview ?? movie?.overview ?? movie?.description ?? "",
        reason: movie?.Reason ?? movie?.reason ?? "",
        image: movie?.Image_URL ?? movie?.image ?? "",
        trailer: movie?.trailer ?? "",
    });

    return (
        <section className="chatbot">
            <div className="chatbot__window">
                <div className="chatbot__messages" ref={chatContainerRef}>
                    {messages.length === 0 && (
                        <div className="chatbot__empty-state">
                            <h2>Hos geldin!</h2>
                            <p>Film zevkini paylas, sana ozel oneriler gelsin.</p>
                        </div>
                    )}

                    {messages.map((message) => {
                        const messageClasses = [
                            "chatbot__message",
                            `chatbot__message--${message.role}`,
                        ];

                        if (message.isError) {
                            messageClasses.push("chatbot__message--error");
                        }

                        return (
                            <div key={message.id} className={messageClasses.join(" ")}>
                                <div className="chatbot__bubble">
                                    {message.isLoading ? (
                                        <span className="chatbot__loader">Bot dusunuyor...</span>
                                    ) : (
                                        <>
                                            {message.text && <p>{message.text}</p>}
                                            {message.role === "bot" &&
                                                message.recommendations &&
                                                message.recommendations.length > 0 && (
                                                    <div className="chatbot__recommendations">
                                                        <div className="movie-card-list">
                                                            {message.recommendations.map((movie, movieIndex) => {
                                                                const normalized = normalizeMovie(movie, movieIndex);
                                                                return (
                                                                    <MovieCard
                                                                        key={normalized.key}
                                                                        title={normalized.title}
                                                                        director={normalized.director}
                                                                        starCast={normalized.starCast}
                                                                        genre={normalized.genre}
                                                                        overview={normalized.overview}
                                                                        reason={normalized.reason}
                                                                        image={normalized.image}
                                                                        trailer={normalized.trailer}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <form className="chatbot__form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Bir filmi ya da turu sor..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    disabled={isLoading}
                    className="chatbot__input"
                />
                <button type="submit" className="chatbot__submit" disabled={isLoading}>
                    {isLoading ? "Gonderiliyor..." : "Gonder"}
                </button>
            </form>
        </section>
    );
};

export default Chatbot;
