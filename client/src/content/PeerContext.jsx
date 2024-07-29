import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react";

const PeerContext = createContext(null);

export const PeerProvider = ({ children }) => {
    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
    const peerConnection = useMemo(() => (new RTCPeerConnection(configuration)), []); //ye single object leta hai and calls the the constructor which  is must to create perr
    //ye peer connection mai respective peer ka poora details hai
    //aab ye baan gaya tho fir offer and answer create karna rahega and then signalling the SDP offer or answer
    //signalling means ek baar offer yaa answer baan gaya tho usse doosre remote peer ko bheja i.e sdp wala part 
    //call aya tho abb apan offer create karenge calling side ko apna details signal kardenge 
    //createOffer -> peerDescription banadega jisko localdescriptionset kardenge using setLocalDescription
    //aab call karne wale ko apna peer mil gaya aab wo answer karega usko listen karna hai
    const createOffer = async () => {
        const offer = await peerConnection.createOffer();
        const peerDescription = await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
        // signalingChannel.send({ 'offer': offer });
        return offer;
    }

    const createAnswer = async (offer) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        console.log(answer);
        await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
        return answer;
    }

    const setRemoteAnswer = async (answer) => {
        console.log("got the answer and it setting it", answer);
        await peerConnection.setRemoteDescription(answer);
    }


    //ye function apne stream ke tracks ko extract karke peer mai daldega
    const sendStream = async (stream) => {
        const tracks = stream.getTracks();
        console.log(tracks)
        for (let track of tracks) {
            const data = peerConnection.addTrack(track, stream);
            console.log(data)
        }
    }

    const [remoteStreams, setRemoteStreams] = useState(null);

    const handleRemoteMedia = useCallback(
        async (event) => {
            const remoteStream = event.streams;
            console.log("got tracks", remoteStream);
            setRemoteStreams(remoteStream[0]);
        },
        [],
    )

    useEffect(() => {
        peerConnection.addEventListener('track',(event) => (handleRemoteMedia(event)));

        return (() => (peerConnection.removeEventListener('track', (handleRemoteMedia))))
    }, [peerConnection, handleRemoteMedia])

    return (<PeerContext.Provider value={{ peerConnection, createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStreams }}>
        {children}
    </PeerContext.Provider>)
}



// export const incommingCall = () = {}

export const usePeer = () => (useContext(PeerContext));