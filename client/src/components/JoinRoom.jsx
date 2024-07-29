import React, { Component, useEffect, useState } from 'react'
import { useSocketContext } from '../content/socketContext';
import { useNavigate } from 'react-router-dom';

function JoinRoom() {
    const { socket } = useSocketContext();
    const navigate = useNavigate();
    const [joinDetails, setJoinDetails] = useState({
        roomId: "",
        emailId: ""
    });

    useEffect(() => {
        function handleJoining({ roomId ,emailId}) {
            navigate(`/room/${roomId}/${emailId}`)
        }

        socket.on("joined-room", (data) => (handleJoining(data)));

        return (() => {
            console.log("user ", joinDetails.emailId," leaved" );
            socket.off("joined-room",handleJoining
            )});
    }, [])

    function handleInputChange(event) {
        setJoinDetails((prevData) => ({ ...prevData, [event.target.name]: event.target.value }));
    }

    function joinRoom(event) {
        event.preventDefault();
        socket.emit("join-it", joinDetails);
        setJoinDetails({
            roomId: "",
            emailId: ""
        })
    }

    return (
        <div className='join-room'>
            <form className='join-form' onSubmit={joinRoom}>
                <div className='form-heading'>
                    <h1 className='headline-2'>Join Videocall</h1>
                </div>
                <div className='form-input'>
                    <h1 className='headline-4'>Room Id:</h1>
                    <input type="text" name="roomId" value={joinDetails.roomId} onChange={handleInputChange} placeholder='Enter Room ID' />
                    <h1 className='headline-4'>Email Id:</h1>
                    <input type="text" name='emailId' value={joinDetails.emailId} onChange={handleInputChange} placeholder='Enter Email ID' />
                    <button className='btn headline-4'>
                        Join Room
                    </button>
                </div>
            </form>
        </div>
    )
}

export default JoinRoom;