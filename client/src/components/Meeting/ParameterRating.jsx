import React from 'react';

const ParameterRating = ({ question, value, onChange }) => {
    return (
        <div className="parameter-rating">
            <p>{question}</p>
            <input
                type="range"
                min="0"
                max="10"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            />
            <span>{value}/10</span>
        </div>
    );
};

export default ParameterRating;