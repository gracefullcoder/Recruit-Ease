import React, { useCallback, useEffect, useState } from 'react'
import { useSocketContext } from '../content/socketContext'
import { usePeer } from '../content/PeerContext';
import { useParams } from 'react-router-dom';
function Room() {

    const { socket } = useSocketContext();
    const { peerConnection, createOffer ,createAnswer,setRemoteAnswer} = usePeer();
    const [joinedUser, setJoinedUser] = useState(useParams().emailId);

    useEffect(() => {
        socket.on("user-joined", handleNewUser);
        socket.on("connect-offer", handleConnectionOffer);
        socket.on("join-video-call",handleOfferAccepted);
        console.log("1");
        return (() => {
            console.log("removed userjoined and connection offer");
            socket.off("user-joined", handleNewUser);
            socket.off("connect-offer", handleConnectionOffer);
            socket.off("join-video-call",handleOfferAccepted);
        })
    }, [socket,createOffer,createAnswer]);

    const handleNewUser = useCallback(async ({ emailId }) => {
        console.log("2");
        const offer = await createOffer();
        console.log("user wants to join with emailId", emailId, offer);
        socket.emit("offer-intrest", { offerFrom: joinedUser, offerTo: emailId, offer });
    }, [])

    const handleConnectionOffer = useCallback(async ({ offerFrom, offer }) => {
        console.log("3");
        console.log("user with email", offerFrom, "intrest to connect", offer);
        const answer = await createAnswer(offer);
        socket.emit("offer-accepted",{offerFrom,answer});
    }, [])

    const handleOfferAccepted = useCallback(async({answer}) => {
        console.log(answer);
        await setRemoteAnswer(answer);
    },[])

    return (
        <div>
            <h1>wELCOME TO THE ROOM {joinedUser}</h1>
        </div>
    )
}

export default Room