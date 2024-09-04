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

    return (
        <div className="template-selector">
            <div>
                <h2>Candidate Details</h2>
                {otherUser.current ?
                    <>
                        <p>Name : {otherUser.current.userName}</p>
                        <p>Email : {otherUser.current.emailId}</p>
                    </>
                    :
                    <p>No Candidate</p>
                }
            </div>

            <h2>Select Templates</h2>
            <ul>
                {templates.map(template => (
                    <li key={template._id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedTemplates.some(selected => selected._id === template._id)}
                                onChange={() => handleTemplateToggle(template)}
                            />
                            {template.name}
                        </label>
                    </li>
                ))}
            </ul>

            <h2>Previous Interview Id:</h2>
            <input type="text" className='pastinterview' placeholder='Enter Past Interview Id to load previous meet' />
            <button onClick={handleSubmit}>Start Interview</button>
        </div>
    );
};

export default TemplateSelector;
