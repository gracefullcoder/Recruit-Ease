import React, { useState, useEffect } from 'react';
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
      <div className={`recruiter-options ${!evalToggler && "remove"}`}>
        {!interviewId && (
          <TemplateSelector onTemplatesSelected={handleTemplatesSelected} otherUser={otherUser} />
        )}

        {interviewId && (
          <InterviewEvaluation interviewId={interviewId} templates={selectedTemplates} />
        )}

        {evalToggler && <i className="uil uil-times toggle-eval" onClick={(e) => setEvalToggler(prev => !prev)}></i>}

      </div>

      {!evalToggler && <i className="uil uil-bars toggle-eval" onClick={(e) => setEvalToggler(prev => !prev)}></i>}
    </>
  )
}

export default RecruiterFeatures;