import React, { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { toastMessage } from "../../helperFunction";

function TemplateForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const [templateName, setTemplateName] = useState(location.state?.template?.name || '');
    const [parameters, setParameters] = useState(location.state?.template?.parameters.map(p => p.question) || ['']);
    const [expectedDuration, setExpectedDuration] = useState(0);
    const { user } = useAuth0();
    const { setUserData } = useOutletContext();

    const handleParameterChange = (index, event) => {
        const newParameters = [...parameters];
        newParameters[index] = event.target.value;
        setParameters(newParameters);
    };

    const handleAddParameter = () => {
        setParameters([...parameters, '']);
    };

    const handleRemoveParameter = (index) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const updateDuration = (e) => {
        const time = e.target.value;
        if (!time.includes(".")) {
            setExpectedDuration(parseInt(time))
        }
        else {
            toastMessage({ success: false, message: "Time should be a integer Value" })
        }

    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const userId = user.email;
        const data = {
            name: templateName,
            parameters,
            expectedDuration
        };
        const response = await axios.post(`${import.meta.env.VITE_SERVER_ENDPOINT}/template/${userId}`, data);

        console.log(response);
        if (response.data.success) {
            setUserData((prev) => ({ ...prev, templates: [...prev.templates, response.data.message] }))
        }
        navigate('/dashboard/templates');
    };

    return (
        <div className="template-form">
            <h1 className="template-form__title">Create or Edit Template</h1>
            <form onSubmit={handleSubmit} className="template-form__form">
                <label className="template-form__label">
                    <h2 className="template-form__subtitle">Template Name:</h2>
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        required
                        className="template-form__input"
                    />
                    <h2 className="template-form__subtitle">Template Duration (In Minutes):</h2>
                    <input
                        type="number"
                        value={expectedDuration}
                        onChange={updateDuration}
                        required
                        className="template-form__input"
                    />
                </label>

                <h2 className="template-form__subtitle">Parameters:</h2>
                {parameters.map((parameter, index) => (
                    <div key={index} className="template-form__parameter">
                        <input
                            type="text"
                            value={parameter}
                            onChange={(e) => handleParameterChange(index, e)}
                            required
                            className="template-form__input"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveParameter(index)}
                            className="template-form__button template-form__button--remove"
                        >
                            Remove
                        </button>
                    </div>
                ))}

                <div className='template-buttons'>
                    <button
                        type="button"
                        onClick={handleAddParameter}
                        className="template-form__button template-form__button--add"
                    >
                        Add Parameter
                    </button>
                    <button
                        type="submit"
                        className="template-form__button template-form__button--submit"
                    >
                        Save Template
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TemplateForm;