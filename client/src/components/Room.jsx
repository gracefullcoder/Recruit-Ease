import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useSocketContext } from '../content/socketContext';
import { usePeer } from '../content/PeerContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Chat from './Chat';
import { useAuth0 } from '@auth0/auth0-react';
import RecruiterFeatures from './Meeting/RecruiterFeatures';
import { toastMessage } from '../helperFunction';

function Room() {
    const userVideo = useRef();
    const screenRef = useRef();
    const { socket } = useSocketContext();
    const { peerRef, userStream, otherUser, partnerVideo, callUser, handleRecieveCall, handleAnswer, handleNewICECandidateMsg, shareScreen, stopScreenShare } = usePeer();
    const { roomId } = useParams();
    const [mediaOptions, setMediaOptions] = useState({ mic: true, video: true, screen: false, chat: false });
    const [isRemoteUser, setIsRemoteUser] = useState(false);
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();
    const emailId = isAuthenticated ? user?.email : '';
    const userName = isAuthenticated ? user?.name : 'You';
    const location = useLocation();
    const joinAs = useRef(location.state?.joinAs || 'candidate');

    useEffect(() => {
        const joinMeeting = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            userVideo.current.srcObject = stream;
            userStream.current = stream;
            userVideo.current.onloadedmetadata = () => {
                userVideo.current.play();
            };

            socket.emit("join room", { roomId, emailId, userName });

            socket.on("room filled",(data) => {
                toastMessage(data);
                navigate("/");
            })

            socket.on('other user', ({ userId, emailId, userName }) => {
                callUser(userId);
                otherUser.current = { userId, emailId, userName };
                setIsRemoteUser(true);
            });

            socket.on("user joined", ({ userId, emailId, userName }) => {
                otherUser.current = { userId, emailId, userName };
                setIsRemoteUser(true);
            });

            socket.on("offer", handleRecieveCall);

            socket.on("answer", handleAnswer);

            socket.on("ice-candidate", handleNewICECandidateMsg);

            socket.on("user leaved", () => setIsRemoteUser(false));
        }

        joinMeeting();

        return () => {
            if (userStream.current) {
                userStream.current.getTracks().forEach(track => track.stop());
            }
            if (peerRef.current) {
                peerRef.current.close();
                peerRef.current = null;
            }
            socket.disconnect();
        }
    }, []);

    const toggleMediaOptions = useCallback(async (option) => {
        let updatedOptions = {};
        if (option == "chat") {
            updatedOptions.chat = !mediaOptions.chat;
        }
        else if (option === "mic" && userStream.current) {
            const micEnabled = !mediaOptions.mic;
            userStream.current.getAudioTracks().forEach(track => {
                track.enabled = micEnabled;
            });
            updatedOptions.mic = micEnabled;
        }

        else if (option === "video" && userStream.current) {
            const videoEnabled = !mediaOptions.video;
            userStream.current.getVideoTracks().forEach(track => {
                track.enabled = videoEnabled;
            });
            updatedOptions.video = videoEnabled;
        }

        else if (option === "screen" && userStream.current) {
            if (!mediaOptions.screen) {
                const { screenTrack, stream } = await shareScreen();
                screenRef.current = screenTrack;
                userVideo.current.srcObject = stream;
                screenRef.current.onended = async function () {
                    await stopScreenShare();
                    userVideo.current.srcObject = userStream.current;
                    setMediaOptions(prev => ({ ...prev, screen: false }));
                };
                updatedOptions.screen = true;
            }
            else {
                screenRef.current.stop();
                stopScreenShare();
                userVideo.current.srcObject = userStream.current;
                updatedOptions.screen = false;
            }
        }

        setMediaOptions(prev => ({ ...prev, ...updatedOptions }));
    }, [mediaOptions]);

    const remoteParticipant = otherUser.current;
    const controlButtons = [
        {
            key: 'mic',
            icon: mediaOptions.mic ? 'uil-microphone' : 'uil-microphone-slash',
            label: mediaOptions.mic ? 'Mute mic' : 'Unmute mic',
            active: mediaOptions.mic
        },
        {
            key: 'video',
            icon: mediaOptions.video ? 'uil-video' : 'uil-video-slash',
            label: mediaOptions.video ? 'Stop camera' : 'Start camera',
            active: mediaOptions.video
        },
        {
            key: 'screen',
            icon: mediaOptions.screen ? 'uil-airplay' : 'uil-desktop-slash',
            label: mediaOptions.screen ? 'Stop share' : 'Share screen',
            active: mediaOptions.screen
        },
        {
            key: 'chat',
            icon: 'uil-comment-alt',
            label: mediaOptions.chat ? 'Hide chat' : 'Open chat',
            active: mediaOptions.chat
        }
    ];

    return (
        <>
            <div className="room-shell">
                <header className="room-header">
                    <div className="room-header__content">
                        <span className="room-badge">{joinAs.current === 'recruiter' ? 'Recruiter mode' : 'Candidate mode'}</span>
                        <h1 className="room-title">Live interview workspace</h1>
                        <p className="room-subtitle">
                            Room ID <strong>{roomId}</strong> with {isRemoteUser ? remoteParticipant?.userName : 'waiting participant'}
                        </p>
                    </div>

                    <div className="room-header__meta">
                        <div className="room-stat">
                            <span>Status</span>
                            <strong>{isRemoteUser ? 'Connected' : 'Waiting to join'}</strong>
                        </div>
                        <div className="room-stat">
                            <span>Workflow</span>
                            <strong>{joinAs.current === 'recruiter' ? 'Structured evaluation' : 'Candidate interview'}</strong>
                        </div>
                    </div>
                </header>

                <div className={`room-stage ${joinAs.current === 'recruiter' ? 'room-stage--recruiter' : ''}`}>
                    <section className="room-grid">
                        <article className={`user user--remote ${!isRemoteUser ? 'user--placeholder' : ''}`}>
                            <div className="user__meta">
                                <div>
                                    <span className="user__role">Candidate / Recruiter</span>
                                    <h2>{isRemoteUser ? remoteParticipant?.userName : 'Waiting for participant'}</h2>
                                </div>
                                <span className={`user__status ${isRemoteUser ? 'is-live' : ''}`}>{isRemoteUser ? 'Live' : 'Standby'}</span>
                            </div>

                            {isRemoteUser ? (
                                <video autoPlay controls ref={partnerVideo} className='video-container' />
                            ) : (
                                <div className="video-placeholder">
                                    <i className="uil uil-user-circle"></i>
                                    <p>The second participant appears here once they join the room.</p>
                                </div>
                            )}
                        </article>

                        <article className='user user--local'>
                            <div className="user__meta">
                                <div>
                                    <span className="user__role">You</span>
                                    <h2>{userName}</h2>
                                </div>
                                <span className="user__status is-live">Connected</span>
                            </div>
                            <video autoPlay ref={userVideo} muted className='video-container' />
                        </article>
                    </section>

                    {mediaOptions.chat && (
                        <aside className="room-chat-panel">
                            <div className="room-chat-panel__header">
                                <div>
                                    <span>Interview chat</span>
                                    <h3>Candidate communication</h3>
                                </div>
                            </div>
                            <Chat userName={emailId} />
                        </aside>
                    )}
                </div>

                <div className="meeting-options">
                    {controlButtons.map(({ key, icon, label, active }) => (
                        <button
                            key={key}
                            type="button"
                            className={`media-button ${active ? 'is-active' : ''}`}
                            onClick={() => toggleMediaOptions(key)}
                        >
                            <i className={`uil ${icon}`}></i>
                            <span>{label}</span>
                        </button>
                    ))}

                    <button type="button" className="media-button media-button--danger" onClick={() => navigate("/")}>
                        <i className="uil uil-phone-slash"></i>
                        <span>Leave room</span>
                    </button>
                </div>
            </div>

            {joinAs.current === "recruiter" && <RecruiterFeatures user={user} otherUser={otherUser}/>}
        </>
    );
}

export default memo(Room);
