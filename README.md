# RecruitEase  [Live Demo](https://recruit-ease.onrender.com/)

RecruitEase is a platform that enables recruiters to conduct and efficiently evaluate candidate interviews via video calls in real-time. Interviewers can create or select custom evaluation templates, allowing them to rate candidates, assign scores, and add notes directly during the interview. This real-time evaluation streamlines the interview process, eliminating the inefficiency of traditional pen-and-paper methods, while storing all data in the user's dashboard for easy access and future reference.
## Features

### For Interviewers:
- **Custom Evaluation Templates**: Create or select templates to evaluate candidates on various criteria.
- **Scoring and Feedback**: Rate candidates on a scale of 1-10 and add notes during the interview.
- **User Dashboard**: Provides access to interview data, performance metrics, and past templates. Users can create new or updated templates based on previous ones.

### For Candidates:
- **Video Interviews**: Participate in live video interviews.
- **Screen Sharing**: Share screen for code reviews or presentations.
- **Chat, Toggle Video/Mic**: Real-time chat and control over video/audio.

### Technical Highlights:
- **WebRTC from Scratch**: Video calling, screen sharing, and media controls implemented with WebRTC.
- **Custom Signaling Server**: A custom signaling server built with **Express.js** facilitates real-time communication between clients for WebRTC connections.
- **Auth0 Authentication**: Secure login and session management.
- **MongoDB**: Stores user data, interview data, and custom templates for interview evaluation.

## Tech Stack

RecruitEase is built using the **MERN** stack:

- **MongoDB**: For storing user data, interview records, and custom templates.
- **Express.js**: Backend framework used for building REST APIs and the custom signaling server for WebRTC.
- **React.js**: Frontend framework for building the user interface and handling client-side routing.
- **Node.js**: Server-side runtime for executing JavaScript code and handling backend logic.

