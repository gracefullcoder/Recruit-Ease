import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
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
    const { emailId, userName } = useMemo(() => (isAuthenticated && { emailId: user.email, userName: user.name }), [user]);
    const location = useLocation();
    const joinAs = useRef(location.state?.joinAs || 'candidate');
    console.log(joinAs,otherUser);

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

    return (
        <>
            <div className="room">
                {isRemoteUser &&
                    <div className='user'>
                        <video autoPlay controls ref={partnerVideo} className='video-container' />
                        <p>{otherUser.current.userName}</p>
                    </div>}
                <div className='user'>
                    <video autoPlay ref={userVideo} muted className='video-container' />
                    <p>{userName}</p>
                </div>
            </div>

            {joinAs.current === "recruiter" && <RecruiterFeatures user={user} otherUser={otherUser}/>}

            <div className="meeting-options">
                {mediaOptions.mic ?
                    <i className="uil uil-microphone media-button" onClick={() => toggleMediaOptions("mic")}></i>
                    :
                    <i className="uil uil-microphone-slash media-button" onClick={() => toggleMediaOptions("mic")}></i>
                }
                {mediaOptions.video ?
                    <i className="uil uil-video media-button" onClick={() => toggleMediaOptions("video")}></i>
                    :
                    <i className="uil uil-video-slash media-button" onClick={() => toggleMediaOptions("video")}></i>
                }

                {mediaOptions.screen ?
                    <i className="uil uil-airplay media-button" onClick={() => toggleMediaOptions("screen")}></i>
                    :
                    <i className="uil uil-desktop-slash media-button" onClick={() => toggleMediaOptions("screen")}></i>
                }

                <i className="uil uil-comment-alt media-button" onClick={() => toggleMediaOptions("chat")}></i>

                <i className="uil uil-phone-slash media-button" onClick={() => navigate("/")}></i>

                {mediaOptions.chat && <Chat userName={emailId} />}

            </div>
        </>
    );
}

export default memo(Room);
