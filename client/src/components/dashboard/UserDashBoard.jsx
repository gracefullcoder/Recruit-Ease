import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import Navbar from '../navbar/Navbar';

function UserDashboard() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await axios.post(`${import.meta.env.VITE_SERVER_ENDPOINT}/user`, { emailId: user.email });
            console.log(response);
            setUserData(response.data.message);
        };
        isAuthenticated && fetchUserData();
    }, [isAuthenticated, navigate]);

    const handleAddTemplate = () => {
        navigate('/dashboard/template/update');
    };

    const handleUseTemplate = (template) => {
        navigate('/dashboard/template/update', { state: { template } });
    };

    if (!userData) return <div className="loading">Loading...</div>;

    return (
        <>
            <Navbar />
            <div className="dashboard">
                <Outlet context={{ handleAddTemplate, handleUseTemplate, userData,setUserData }} />
            </div>
        </>
    );
}

export default UserDashboard;