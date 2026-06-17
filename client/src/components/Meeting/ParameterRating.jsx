import React from 'react';

const ParameterRating = ({ question, value, onChange }) => {
    return (
        <div className="parameter-rating">
            <div className="parameter-rating__header">
                <p>{question}</p>
                <span>{value}<small>/10</small></span>
            </div>
            <input
                type="range"
                min="0"
                max="10"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            />
            <div className="parameter-rating__scale">
                <span>Low</span>
                <span>Strong</span>
            </div>
        </div>
    );
};

export default ParameterRating;
