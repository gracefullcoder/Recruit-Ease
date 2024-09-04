import React, { createContext, useContext, useRef, useState } from "react";
import { useSocketContext } from "./socketContext";
import { toast } from "react-toastify";

const PeerContext = createContext(null);

export const PeerProvider = ({ children }) => {
    const peerRef = useRef();
    const userStream = useRef();
    const otherUser = useRef();
    const partnerVideo = useRef();
    const sendChannel = useRef();
    const [messages, setMessages] = useState([]);

    const { socket } = useSocketContext();

    function callUser(userId) {
        peerRef.current = createPeer(userId);
        userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
        sendChannel.current = peerRef.current.createDataChannel("message");
        sendChannel.current.onmessage = handleRecieveMessage;
    }

    function createPeer(userId) {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "Stun:stun.l.google.com:19302"
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
            ]
        });

        peer.onicecandidate = handleICECandidateEvent;
        peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userId);

        return peer;
    }

    function handleNegotiationNeededEvent(userId) {
        peerRef.current.createOffer().then(offer => {
            return peerRef.current.setLocalDescription(offer);
        }).then(() => {
            const payload = {
                target: userId,
                caller: socket.id,
                sdp: peerRef.current.localDescription
            };
            socket.emit("offer", payload);
        }).catch(e => console.log(e));
    }

    function handleRecieveCall(incoming) {
        peerRef.current = createPeer();
        peerRef.current.ondatachannel = (e) => {
            sendChannel.current = e.channel;
            sendChannel.current.onmessage = handleRecieveMessage;
        }

        const desc = new RTCSessionDescription(incoming.sdp);
        peerRef.current.setRemoteDescription(desc).then(() => {
            userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
        }).then(() => {
            return peerRef.current.createAnswer();
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socket.id,
                sdp: peerRef.current.localDescription
            }
            socket.emit("answer", payload);
        })
    }

    function handleRecieveMessage(e) {
        const message = JSON.parse(e.data);
        console.log(message);
        setMessages(prevMessages => [...prevMessages, message]);
        toast(`${message.name}
            ${message.content}`, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
        });
    }

    function sendMessage(data) {
        sendChannel.current.send(JSON.stringify(data));
    }

    function handleAnswer(message) {
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
    }

    function handleICECandidateEvent(e) {
        if (e.candidate) {
            const payload = {
                target: otherUser.current.userId,
                candidate: e.candidate,
            }
            socket.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log(e));
    }

    function handleTrackEvent(e) {
        partnerVideo.current.srcObject = e.streams[0];
    };

    async function shareScreen() {
        const stream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
        const screenTrack = stream.getTracks()[0];

        const senders = peerRef.current.getSenders();
        const videoSender = senders.find(sender => sender.track.kind === 'video');
        if (videoSender) {
            videoSender.replaceTrack(screenTrack);
        }

        return { screenTrack, stream };
    }

    async function stopScreenShare() {
        const senders = await peerRef.current.getSenders();
        const videoSender = await senders.find(sender => sender.track.kind === "video");
        if (videoSender) {
            const originalVideoTrack = userStream.current.getTracks().find(track => track.kind === 'video');
            if (originalVideoTrack) {
                videoSender.replaceTrack(originalVideoTrack);
            }
        }
    };

    return (
        <PeerContext.Provider value={{peerRef, userStream, otherUser, partnerVideo, callUser, handleRecieveCall, handleAnswer, handleNewICECandidateMsg, shareScreen, stopScreenShare, messages, setMessages, sendMessage }}>
            {children}
        </PeerContext.Provider>
    )
}

export const usePeer = () => (useContext(PeerContext));