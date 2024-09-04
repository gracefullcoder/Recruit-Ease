import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth0 } from "@auth0/auth0-react";
import { LoginButton } from './Authentication';
import axios from 'axios';

function JoinRoom() {
    const navigate = useNavigate();
    const [joinDetails, setJoinDetails] = useState({
        roomId: "",
        joinAs: "",
    });
    const { user, isAuthenticated, isLoading } = useAuth0();

    function handleInputChange(event) {
        setJoinDetails((prevData) => ({ ...prevData, [event.target.name]: event.target.value }));
    }

    function joinRoom(event) {
        event.preventDefault();
        const { roomId, joinAs } = joinDetails;

        if (roomId && joinAs && isAuthenticated) {
            navigate(`/room/${roomId}`, { state: { joinAs } });
        } else if(isAuthenticated){
            toast.error("Please fill in the required details to start the meeting!");
        }
    }

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            function generateRoomId(length = 10) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let roomId = '';
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    roomId += characters[randomIndex];
                }
                return roomId;
            }
            setJoinDetails({
                roomId: generateRoomId(),
            });

        }
    }, [isLoading, isAuthenticated, user]);

    if (isLoading) {
        return <div className="loading">Loading ...</div>;
    }

    return (
        <div className='join-room'>
            <form className='join-form' onSubmit={joinRoom}>
                <div className='form-heading'>
                    <h1 className='headline-2'>Join Videocall</h1> 
                </div>
                <div className='form-input'>
                    <h1 className='headline-4'>Join As:</h1>
                    <div className='radio-group'>
                        <label>
                            <input type="radio" name="joinAs" value="recruiter" onChange={handleInputChange} />
                            Recruiter
                        </label>
                        <label>
                            <input type="radio" name="joinAs" value="candidate" onChange={handleInputChange} />
                            Candidate
                        </label>
                        <label>
                            <input type="radio" name="joinAs" value="normal" onChange={handleInputChange} />
                            Normal Talk
                        </label>
                    </div>

                    <h1 className='headline-4'>Room Id:</h1>
                    <input type="text" name="roomId" value={joinDetails.roomId} onChange={handleInputChange} placeholder='Enter Room ID' />

                    {isAuthenticated ? <button className='btn headline-4'>
                        Join Room
                    </button> :
                        <LoginButton />
                    }
                </div>
            </form>

        </div>
    );
}

export default JoinRoom;
