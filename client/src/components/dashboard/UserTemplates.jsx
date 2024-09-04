import React from 'react'
import { useOutletContext } from 'react-router-dom'

function UserTemplates() {
    const { handleAddTemplate, handleUseTemplate, userData } = useOutletContext();

    return (
        <section className="section">
            <h2 className="section-title">Your Templates</h2>
            <div className="card-grid">
                {userData.templates.map(template => (
                    <div key={template._id} className="card">
                        <h3 className="card-title">{template.name}</h3>
                        <ul className="card-list">
                            {template.parameters.map((parameter, index) => (
                                <li key={index}>{parameter.question}</li>
                            ))}
                        </ul>
                        <h3 className="card-title">Expected Duration : {template.expectedDuration}</h3>
                        <button className="button" onClick={() => handleUseTemplate(template)}>Use Template</button>
                    </div>
                ))}
            </div>
            <button className="button button-add" onClick={handleAddTemplate}>Add New Template</button>
        </section>
    )
}

export default UserTemplates