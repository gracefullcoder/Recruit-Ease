import React, { useState } from 'react'

function JoinRoom() {
    const [joinDetails, setJoinDetails] = useState({
        roomId: "",
        emailId: ""
    })

    function handleInputChange(event){
        setJoinDetails((prevData) => ({...prevData,[event.target.name]:event.target.values}));
    }

    return (
        <div className='join-room'>
            <form className='join-form'>
                <div className='form-heading'>
                    <h1 className='headline-2'>Join Videocall</h1>
                </div>
                <div className='form-input'>
                    <h1 className='headline-4'>Room Id:</h1>
                    <input type="text" name="roomId" value={joinDetails.roomId} onChange={handleInputChange} placeholder='Enter Room ID' />
                    <h1 className='headline-4'>Email Id:</h1>
                    <input type="text" name='emailId' value={joinDetails.emailId} onChange={handleInputChange} placeholder='Enter Email ID' />
                    <button className='btn headline-4' >
                        Join Room
                    </button>
                </div>
            </form>
        </div>
    )
}

export default JoinRoom