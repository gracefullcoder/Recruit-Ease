import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ParameterRating from './ParameterRating';
import { toastMessage } from "../../helperFunction";

const InterviewEvaluation = ({ interviewId, templates }) => {
    const [evaluation, setEvaluation] = useState({});
    const [overallNote, setOverallNote] = useState('');

    useEffect(() => {
        if (templates.length > 0) {
            const initialEvaluation = templates.reduce((acc, template) => {
                acc[template._id] = {
                    templateId: template._id,
                    parameterValues: Array(template.parameters.length).fill(0),
                    note: '',
                    time: template.expectedDuration * 60
                };
                return acc;
            }, {});
            setEvaluation(initialEvaluation);
        }
    }, [templates]);

    const handleParameterChange = async (templateId, index, value) => {
        const updatedParameters = evaluation[templateId].parameterValues.map((v, i) => i === index ? value : v)
        const updatedDetails = await axios.post(`${import.meta.env.VITE_SERVER_ENDPOINT}/interview/${interviewId}`, { templateId, parameterValues: updatedParameters })
        toastMessage(updatedDetails.data);

        setEvaluation((prev) => {
            return {
                ...prev,
                [templateId]: {
                    ...prev[templateId],
                    parameterValues: updatedParameters
                }
            }
        });
    };

    const handleNoteChange = (templateId, note) => {
        setEvaluation(prev => ({
            ...prev,
            [templateId]: {
                ...prev[templateId],
                note
            }
        }));
    };

    const handleSaveNote = async (templateId) => {
        try {
            const updatedDetails = await axios.post(`${import.meta.env.VITE_SERVER_ENDPOINT}/interview/${interviewId}`,
                { templateId, parameterValues: evaluation[templateId].note })

            if (updatedDetails.data.success) {
                toastMessage(updatedDetails.data);
            }
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note');
        }
    };

    const handleSaveOverallNote = async () => {
        try {
            const updatedDetails = await axios.post(`${import.meta.env.VITE_SERVER_ENDPOINT}/interview/${interviewId}`,
                { templateId: true, parameterValues: overallNote })

            if (updatedDetails.data.success) {
                toastMessage(updatedDetails.data);
            }
        } catch (error) {
            console.error('Error saving overall note:', error);
            alert('Failed to save overall note');
        }
    };

    const totalParameters = templates.reduce((sum, template) => sum + template.parameters.length, 0);
    const completedRatings = templates.reduce((sum, template) => {
        const ratings = evaluation[template._id]?.parameterValues || [];
        return sum + ratings.filter((value) => value > 0).length;
    }, 0);
    const averageScore = totalParameters > 0
        ? (
            templates.reduce((sum, template) => {
                const ratings = evaluation[template._id]?.parameterValues || [];
                return sum + ratings.reduce((scoreSum, score) => scoreSum + score, 0);
            }, 0) / totalParameters
        ).toFixed(1)
        : '0.0';

    const getTemplateAverage = (templateId) => {
        const ratings = evaluation[templateId]?.parameterValues || [];
        if (ratings.length === 0) {
            return '0.0';
        }

        const total = ratings.reduce((sum, score) => sum + score, 0);
        return (total / ratings.length).toFixed(1);
    };

    return (
        <div className="interview-evaluation">
            <div className="interview-evaluation__intro">
                <span className="panel-label">Live scorecards</span>
                <h3>Interview evaluation</h3>
                <p>Scores save as you rate each parameter, helping you keep a reliable decision trail.</p>
            </div>

            <div className="interview-overview">
                <div className="overview-card">
                    <span>Templates</span>
                    <strong>{templates.length}</strong>
                </div>
                <div className="overview-card">
                    <span>Rated criteria</span>
                    <strong>{completedRatings}/{totalParameters}</strong>
                </div>
                <div className="overview-card">
                    <span>Average score</span>
                    <strong>{averageScore}/10</strong>
                </div>
            </div>

            {templates.map(template => (
                <div key={template._id} className="template-evaluation">
                    <div className="template-evaluation__header">
                        <div>
                            <h3>{template.name}</h3>
                            <p>{template.parameters.length} criteria • {template.expectedDuration} min expected duration</p>
                        </div>
                        <span className="template-score">{getTemplateAverage(template._id)}/10</span>
                    </div>
                    {template.parameters.map((param, index) => (
                        <ParameterRating
                            key={index}
                            question={param.question}
                            value={evaluation[template._id]?.parameterValues[index] || 0}
                            onChange={(value) => handleParameterChange(template._id, index, value)}
                        />
                    ))}
                    <div className="note-container">
                        <textarea
                            placeholder="Notes for this template"
                            value={evaluation[template._id]?.note || ''}
                            onChange={(e) => handleNoteChange(template._id, e.target.value)}
                        />
                        <button onClick={() => handleSaveNote(template._id)} className="button button--small">Save Note</button>
                    </div>
                </div>
            ))}
            <div className="overall-note-container">
                <div className="panel-heading-row">
                    <div>
                        <span className="panel-label">Final summary</span>
                        <h3>Overall decision note</h3>
                    </div>
                </div>
                <textarea
                    placeholder="Overall notes"
                    value={overallNote}
                    onChange={(e) => setOverallNote(e.target.value)}
                />
                <button onClick={handleSaveOverallNote} className="button button--small">Save Overall Note</button>
            </div>
        </div>
    );
};

export default InterviewEvaluation;
