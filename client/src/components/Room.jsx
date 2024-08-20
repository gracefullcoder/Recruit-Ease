import React, { useState, useEffect, useRef } from 'react';
import { useSocketContext } from '../content/socketContext';
import { usePeer } from '../content/PeerContext';
import { useParams } from 'react-router-dom';

function Room() {
    const userVideo = useRef();
    const { socket } = useSocketContext();
    const { userStream, otherUser, partnerVideo, callUser, handleRecieveCall, handleAnswer, handleNewICECandidateMsg } = usePeer();
    const { roomID } = useParams();
    const [mediaOptions, setMediaOptions] = useState({ mic: true, video: true });

    useEffect(() => {
        const joinMeeting = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            userVideo.current.srcObject = stream;
            userStream.current = stream;

            socket.emit("join room", roomID);

            socket.on('other user', userID => {
                callUser(userID);
                otherUser.current = userID;
            });

            socket.on("user joined", userID => {
                otherUser.current = userID;
            });

            socket.on("offer", handleRecieveCall);

            socket.on("answer", handleAnswer);

            socket.on("ice-candidate", handleNewICECandidateMsg);
        }

        joinMeeting();
    }, [socket, roomID, callUser, handleRecieveCall, handleAnswer, handleNewICECandidateMsg]);

    const toggleMediaOptions = (option) => {
        setMediaOptions(prev => {
            const updatedOptions = { ...prev, [option]: !prev[option] };
            
            if (option === "mic" && userStream.current) {
                userStream.current.getAudioTracks().forEach(track => {
                    track.enabled = updatedOptions.mic;
                });
            }

            if (option === "video" && userStream.current) {
                userStream.current.getVideoTracks().forEach(track => {
                    track.enabled = updatedOptions.video;
                });
            }

            return updatedOptions;
        });
    }

    return (
        <div>
            <div className="room">
                <video autoPlay ref={userVideo} className='video-container' muted />
                <video autoPlay ref={partnerVideo} className='video-container' />
            </div>

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
            </div>
        </div>
    );
}

export default Room;
