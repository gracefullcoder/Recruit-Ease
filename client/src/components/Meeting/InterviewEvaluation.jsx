import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ParameterRating from './ParameterRating';
import { toastMessage } from "../../helperFunction";

const InterviewEvaluation = ({ interviewId, templates }) => {
    const [evaluation, setEvaluation] = useState({});
    const [overallNote, setOverallNote] = useState('');
    const [time, setTime] = useState(new Map());

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

    console.log(evaluation);

    const handleParameterChange = async (templateId, index, value) => {
        const updatedParameters = evaluation[templateId].parameterValues.map((v, i) => i === index ? value : v)
        const updatedDetails = await axios.post(`${import.meta.env.VITE_SERVER_ENDPOINT}/interview/${interviewId}`, { templateId, parameterValues: updatedParameters })
        console.log(updatedDetails);
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

            console.log(updatedDetails.data);

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

            console.log(updatedDetails.data);

            if (updatedDetails.data.success) {
                toastMessage(updatedDetails.data);
            }
        } catch (error) {
            console.error('Error saving overall note:', error);
            alert('Failed to save overall note');
        }
    };

    const startTimer = async (templateId) => {
        let interval = setInterval(() => {
            const oldTime = evaluation[templateId].time;
            if(oldTime > 0) {
                setEvaluation((prev) => {
                    return { ...prev, [templateId]: { ...prev[templateId], time: oldTime - 1 } }
                })
            }else{
                const intervalId = time.map(templateId);
                clearInterval(intervalId);
            }
            
        }, 1000);

        time.set(templateId,interval);
    }

    const stopTimer = async (templateId) => {
        let interval = setInterval(() => {
            const oldTime = evaluation[templateId].time;
            if(oldTime > 0) {
                setEvaluation((prev) => {
                    return { ...prev, [templateId]: { ...prev[templateId], time: oldTime - 1 } }
                })
            }else{
                const intervalId = time.map(templateId);
                clearInterval(intervalId);
            }
            
        }, 1000);

        time.set(templateId,interval);
    }


    // const handleSubmit = async () => {
    //     try {
    //         await Promise.all(Object.values(evaluation).map(({ templateId, parameterValues }) =>
    //             axios.post(`/api/interview/${interviewId}`, { templateId, parameterValues })
    //         ));
    //         await axios.post(`/api/interview/${interviewId}/overall-note`, { overallNote });
    //         alert('Evaluation submitted successfully');
    //     } catch (error) {
    //         console.error('Error submitting evaluation:', error);
    //         alert('Failed to submit evaluation');
    //     }
    // };

    return (
        <div className="interview-evaluation">
            <h2>Interview Evaluation</h2>
            {templates.map(template => (
                <div key={template._id} className="template-evaluation">
                    <h3>{template.name}</h3>
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
                <textarea
                    placeholder="Overall notes"
                    value={overallNote}
                    onChange={(e) => setOverallNote(e.target.value)}
                />
                <button onClick={handleSaveOverallNote} className="button button--small">Save Overall Note</button>
            </div>
            {/* <button onClick={handleSubmit} className="button button--primary">Submit Evaluation</button> */}
        </div>
    );
};

export default InterviewEvaluation;