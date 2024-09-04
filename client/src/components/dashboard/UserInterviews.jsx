import React from 'react'
import { useOutletContext } from 'react-router-dom'
function UserInterviews() {
    const { userData } = useOutletContext()
    return (
        <section className="section">
            <h2 className="section-title">Your Interviews</h2>
            <div className="card-grid">
                {userData.interviews.map(interview => (
                    <div key={interview._id} className="card">
                        <h3 className="card-title">{interview.candidateName}</h3>
                        <p className="card-text">Email: {interview.candidateEmail}</p>
                        <p className="card-text">Date: {new Date(interview.createdAt).toLocaleDateString()}</p>

                        <section className="interview-results">
                            <h2 className="section-title">Interview Results</h2>
                            {interview.result.map((result, index) => (
                                <div key={index} className="result-card">
                                    <h3 className="template-name">{result.template.name}</h3>
                                    <ul className="parameter-list">
                                        {result.template.parameters.map((parameter, paramIndex) => (
                                            <li key={parameter._id} className="parameter-item">
                                                <span className="parameter-question">{parameter.question}:</span>
                                                <span className="parameter-value">{result.parameterValues[paramIndex]}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {
                                        result.note &&
                                        <>
                                            <hr />
                                            <div className="template-note">
                                                <h3>Template Note : </h3>
                                                <p>{result.note}</p>
                                            </div>
                                        </>
                                    }
                                </div>
                            ))}
                        </section>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default UserInterviews