import React from 'react';

const YoutubeEmbed = ({ embedId }) => (
    <div className="video-responsive">
        <iframe
            width="auto"
            height="auto"
            src={`https://www.youtube.com/embed/${embedId}?autoplay=0&mute=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
        />
    </div>
);

export default YoutubeEmbed;