import React, { createContext, useContext, useMemo } from "react";

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
        const peerDescription = await peerConnection.setLocalDescription(offer);
        // signalingChannel.send({ 'offer': offer });
        return offer;
    }

    const createAnswer = async (offer) => {
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        console.log(answer);
        await peerConnection.setLocalDescription(answer);
        return answer;
    }

    const setRemoteAnswer = async (answer) => {
        console.log(answer);
        await peerConnection.setRemoteDescription(answer);
    }

    return (<PeerContext.Provider value={{ peerConnection, createOffer, createAnswer, setRemoteAnswer }}>
        {children}
    </PeerContext.Provider>)
}



// export const incommingCall = () = {}

export const usePeer = () => (useContext(PeerContext));