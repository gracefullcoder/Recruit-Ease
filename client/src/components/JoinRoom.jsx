import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth0 } from "@auth0/auth0-react";
import { LoginButton } from './Authentication';

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
        } else if (isAuthenticated) {
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
            <section className='join-hero'>
                <div className='join-hero__content'>
                    <span className='join-hero__eyebrow'>Smart interview workspace</span>
                    <h1 className='headline-2'>Run structured video interviews with confidence.</h1>
                    <p className='join-hero__text'>
                        Recruit Ease helps recruiters conduct live WebRTC interviews, evaluate candidates with built-in scorecards,
                        and replace scattered notes with a faster, more consistent hiring workflow.
                    </p>

                    <div className='join-hero__benefits'>
                        <div className='benefit-card'>
                            <h2>For recruiters</h2>
                            <p>Standardized templates, quick scoring, and cleaner final decisions after every interview.</p>
                        </div>
                        <div className='benefit-card'>
                            <h2>For candidates</h2>
                            <p>A simple interview flow with reliable video meetings and less friction before joining.</p>
                        </div>
                        <div className='benefit-card'>
                            <h2>Why it helps</h2>
                            <p>Reduces manual paperwork, improves fairness, and gives teams a shared evaluation trail.</p>
                        </div>
                    </div>
                </div>
            </section>

            <form className='join-form' onSubmit={joinRoom}>
                <div className='form-heading'>
                    <span className='form-heading__kicker'>Start or join a session</span>
                    <h2 className='headline-4'>Interview access</h2>
                    <p>Choose your role, confirm the room ID, and join the call in seconds.</p>
                </div>

                <div className='form-input'>
                    <div className='form-group'>
                        <h3 className='headline-4'>Join as</h3>
                        <div className='radio-group'>
                            <label>
                                <input type="radio" name="joinAs" value="recruiter" onChange={handleInputChange} />
                                Recruiter
                            </label>
                            <label>
                                <input type="radio" name="joinAs" value="candidate" onChange={handleInputChange} />
                                Candidate
                            </label>
                        </div>
                    </div>

                    <div className='form-group'>
                        <h3 className='headline-4'>Room ID</h3>
                        <input type="text" name="roomId" value={joinDetails.roomId} onChange={handleInputChange} placeholder='Enter room ID' />
                        <p className='input-hint'>Use a generated room for a fresh interview or paste an existing meeting ID.</p>
                    </div>

                    <div className='feature-points'>
                        <span>Free WebRTC video calls</span>
                        <span>Built-in interviewer scorecards</span>
                        <span>Faster post-interview decisions</span>
                    </div>

                    {isAuthenticated ? <button className='btn headline-4 join-submit'>
                        Join Interview Room
                    </button> :
                        <LoginButton />
                    }
                </div>
            </form>

        </div>
    );
}

export default JoinRoom;
