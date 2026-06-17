import React, { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import InterviewEvaluation from './InterviewEvaluation';
import axios from 'axios';
import { toastMessage } from '../../helperFunction';

function RecruiterFeatures({ user, otherUser }) {
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [evalToggler, setEvalToggler] = useState(true);


  const handleTemplatesSelected = async (templates) => {
    try {
      if (otherUser.current) {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_ENDPOINT}/interview`, {
          name: otherUser.current?.userName,
          emailId: otherUser.current?.emailId,
          templatesUsed: templates.map(temp => temp._id),
          interviewerMail: user.email
        });
        setInterviewId(response.data.message.interviewId);
        setSelectedTemplates(templates);
      } else {
        toastMessage({ success: false, message: "Interview will start after candiate Joins" });
      }

    } catch (error) {
      console.error('Error creating interview:', error);
    }
  };


  return (
    <>
      <aside className={`recruiter-options ${!evalToggler && "remove"}`}>
        <div className="recruiter-options__header">
          <div>
            <span className="panel-eyebrow">Recruiter workspace</span>
            <h2>{interviewId ? 'Live evaluation panel' : 'Prepare this interview'}</h2>
            <p>Run structured scoring, centralize notes, and make post-interview decisions faster.</p>
          </div>

          {evalToggler && (
            <button type="button" className="toggle-eval" onClick={() => setEvalToggler(prev => !prev)}>
              <i className="uil uil-times"></i>
            </button>
          )}
        </div>

        <div className="recruiter-options__stats">
          <div className="workspace-stat">
            <span>Candidate</span>
            <strong>{otherUser.current ? 'Connected' : 'Waiting'}</strong>
          </div>
          <div className="workspace-stat">
            <span>Templates</span>
            <strong>{selectedTemplates.length}</strong>
          </div>
        </div>

        {!interviewId && (
          <TemplateSelector onTemplatesSelected={handleTemplatesSelected} otherUser={otherUser} />
        )}

        {interviewId && (
          <InterviewEvaluation interviewId={interviewId} templates={selectedTemplates} />
        )}
      </aside>

      {!evalToggler && (
        <button type="button" className="toggle-eval toggle-eval--open" onClick={() => setEvalToggler(prev => !prev)}>
          <i className="uil uil-briefcase-alt"></i>
        </button>
      )}
    </>
  )
}

export default RecruiterFeatures;
