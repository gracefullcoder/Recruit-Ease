import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const TemplateSelector = ({ onTemplatesSelected, otherUser }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [pastinterview, setPastInterview] = useState("");

    const { user } = useAuth0();

    useEffect(() => {
        if (user) fetchTemplates();
    }, [user]);

    const fetchTemplates = async () => {
        try {
            const userData = await axios.post(`${import.meta.env.VITE_SERVER_ENDPOINT}/user`, { emailId: user.email });
            console.log(userData);
            setTemplates(userData.data.message.templates);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleTemplateToggle = (template) => {
        setSelectedTemplates(prev =>
            prev.some(selected => selected._id === template._id)
                ? prev.filter(selected => selected._id !== template._id)
                : [...prev, template]
        );
    };

    const handleSubmit = async () => {
        // if (selectedTemplates.length == 0 && pastinterview) {
        //     const pastinterviewDetails = await axios.get(`${import.meta.env.VITE_SERVER_ENDPOINT}/interview/${pastinterview}`);

        //     if(pastinterview.data.message){
        
        //     }
        // } else {
            // onTemplatesSelected(selectedTemplates);
        // }
        onTemplatesSelected(selectedTemplates);
    };

    const selectedQuestionsCount = selectedTemplates.reduce((count, template) => count + template.parameters.length, 0);

    return (
        <div className="template-selector">
            <section className="panel-section panel-section--candidate">
                <span className="panel-label">Candidate details</span>
                {otherUser.current ? (
                    <>
                        <h3>{otherUser.current.userName}</h3>
                        <p>{otherUser.current.emailId}</p>
                        <span className="panel-status is-live">Ready for interview</span>
                    </>
                ) : (
                    <>
                        <h3>Waiting for candidate</h3>
                        <p>The room is ready. Once the candidate joins, you can start the structured interview.</p>
                        <span className="panel-status">Standby</span>
                    </>
                )}
            </section>

            <section className="panel-section">
                <div className="panel-heading-row">
                    <div>
                        <span className="panel-label">Evaluation templates</span>
                        <h3>Select scorecards</h3>
                    </div>
                    <span className="panel-count">{selectedTemplates.length} selected</span>
                </div>

                <ul className="template-selector__list">
                    {templates.map(template => (
                        <li key={template._id}>
                            <label className="template-option">
                            <input
                                type="checkbox"
                                checked={selectedTemplates.some(selected => selected._id === template._id)}
                                onChange={() => handleTemplateToggle(template)}
                            />
                                <div className="template-option__content">
                                    <strong>{template.name}</strong>
                                    <span>{template.parameters.length} criteria • {template.expectedDuration} min expected</span>
                                </div>
                            </label>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="panel-section">
                <span className="panel-label">Previous interview reference</span>
                <input
                    type="text"
                    className='pastinterview'
                    placeholder='Optional interview ID for future reuse'
                    value={pastinterview}
                    onChange={(event) => setPastInterview(event.target.value)}
                />
                <p className="panel-hint">Keep a past interview ID for manual reference while running the session.</p>
            </section>

            <div className="panel-footer">
                <div className="panel-footer__summary">
                    <span>Scoring coverage</span>
                    <strong>{selectedQuestionsCount} total criteria</strong>
                </div>
                <button onClick={handleSubmit}>Start Interview Evaluation</button>
            </div>
        </div>
    );
};

export default TemplateSelector;
