import React from "react";
import "../styles/MovieCard.css";

const MovieCard = ({
    title,
    director,
    starCast,
    genre,
    overview,
    reason,
    image,
    trailer,
}) => {
    return (
        <article className="movie-card">

            <div className="movie-card__content">
                {title && <h3 className="movie-card__title">{title}</h3>}
                {director && (
                    <p className="movie-card__meta"><strong>Director:</strong> {director}</p>
                )}
                {starCast && (
                    <p className="movie-card__meta"><strong>Star Cast:</strong> {starCast}</p>
                )}
                {genre && (
                    <p className="movie-card__meta"><strong>Genre:</strong> {genre}</p>
                )}
                {overview && (
                    <p className="movie-card__overview">{overview}</p>
                )}
                {reason && (
                    <p className="movie-card__reason">{reason}</p>
                )}
                            {image && (
                <div className="movie-card__image-wrapper">
                    <img
                        src={image}
                        alt={title ? `Poster for ${title}` : "Movie poster"}
                        className="movie-card__image"
                    />
                </div>
            )}
            {trailer && (
                <p className="movie-card__trailer">
                    <strong>Trailer:</strong>{" "}
                    <a href={trailer} target="_blank" rel="noopener noreferrer">
                        Watch here
                    </a>
                </p>
            )}

            </div>
        </article>
    );
};

export default MovieCard;