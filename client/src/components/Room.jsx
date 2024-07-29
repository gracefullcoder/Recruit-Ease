import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSocketContext } from '../content/socketContext';
import ReactPlayer from 'react-player';
import { usePeer } from '../content/PeerContext';
import { useParams } from 'react-router-dom';

function Room() {
    const { socket } = useSocketContext();
    const { peerConnection, createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStreams } = usePeer();
    const [joinedUser, setJoinedUser] = useState(useParams().emailId);
    const [remoteUser, setRemoteUser] = useState("");
    const [myStream, setMyStream] = useState(null);
    const remoteUserRef = useRef(remoteUser);

    useEffect(() => {
        remoteUserRef.current = remoteUser;
    }, [remoteUser]);

    useEffect(() => {
        socket.on("user-joined", handleNewUser);
        socket.on("connect-offer", handleConnectionOffer);
        socket.on("join-video-call", handleOfferAccepted);
        console.log("1");
        return () => {
            console.log(`removed ${joinedUser} and connection offer`);
            socket.off("user-joined", handleNewUser);
            socket.off("connect-offer", handleConnectionOffer);
            socket.off("join-video-call", handleOfferAccepted);
        };
    }, [socket, createOffer, createAnswer, setRemoteAnswer]);

    const getUserMediaStream = useCallback(async function getuserMedia() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);
    }, []);

    const handleNewUser = useCallback(async ({ emailId }) => {
        setRemoteUser(emailId);
        console.log(remoteUser);
        const offer = await createOffer();
        console.log("user wants to join with emailId", emailId);
        console.log("i created a offer for him/her ", offer);
        socket.emit("offer-intrest", { offerFrom: joinedUser, offerTo: emailId, offer });
    }, [createOffer, joinedUser, socket]);

    const handleConnectionOffer = useCallback(async ({ offerFrom, offer }) => {
        setRemoteUser(offerFrom);
        console.log("user with email", offerFrom, "intrest to connect", offer);
        const answer = await createAnswer(offer);
        console.log("i created a answer for the offer ", answer);
        socket.emit("offer-accepted", { offerFrom, answer });
    }, [createAnswer, socket]);

    const handleOfferAccepted = useCallback(async ({ answer }) => {
        await setRemoteAnswer(answer);
    }, [setRemoteAnswer]);

    useEffect(() => {
        getUserMediaStream();
    }, [getUserMediaStream]);

    const handleNegotiation = useCallback(
        async () => {
            let ru = remoteUserRef.current;
            console.log("oops negotiation", ru);
            const localOffer = peerConnection.localDescription;
            console.log(localOffer, joinedUser, ru);
            socket.emit("offer-intrest", { offerFrom: joinedUser, offerTo: ru, offer: localOffer });
        },
        [joinedUser, peerConnection, socket],
    );

    useEffect(() => {
        peerConnection.addEventListener("negotiationneeded", handleNegotiation);
        return () => {
            peerConnection.removeEventListener("negotiationneeded", handleNegotiation);
        };
    }, [handleNegotiation, peerConnection]);

    return (
        <div>
            <h1 className='headline-2'>Welcome TO THE ROOM {joinedUser} , Remote User is {remoteUser}</h1>
            <ReactPlayer url={myStream} playing muted />
            {console.log(remoteStreams)}
            <ReactPlayer url={remoteStreams} playing />
            <br />
            <button className='headline-2' onClick={(event) => (sendStream(myStream))}>Join the stream</button>

        </div>
    )
}

export default Room;