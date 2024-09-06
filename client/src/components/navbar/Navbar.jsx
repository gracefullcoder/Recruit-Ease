import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoginButton, LogoutButton } from "../Authentication";
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { toastMessage } from '../../helperFunction';

const Navbar = () => {
    const hasLoggedIn = useRef(false);
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && isAuthenticated && !hasLoggedIn.current) {
            const loginUser = async () => {
                try {   
                    const response = await axios.post(`${import.meta.env.VITE_SERVER_ENDPOINT}/login`, {
                        emailId: user.email,
                        name: user.name,
                        picture: user.picture
                    });

                    toastMessage(response);
                    hasLoggedIn.current = true;
                } catch (error) {
                    console.error("Error logging in:", error);
                }
            };

            loginUser();
        }
    }, [isLoading, isAuthenticated, user]);

    if (isLoading) {
        return <div>Loading ...</div>;
    }

    const toggleDropdown = () => setIsOpen(!isOpen);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/" className="logo-link">Recruit Ease</Link>
                </div>

                <div className="navbar-links">
                    {isAuthenticated && (
                        <>
                            <Link to="/" className="nav-link">Home</Link>
                            <Link to="/dashboard/templates" className="nav-link">Templates</Link>
                            <Link to="/dashboard/interviews" className="nav-link">Interviews</Link>
                        </>
                    )}
                </div>

                <div className="navbar-profile">
                    {isAuthenticated ? (
                        <>
                            <div className="profile-info" onClick={toggleDropdown}>
                                <img src={user?.picture} alt="Profile" className="profile-pic" />
                                <span className="user-name">{user?.name}</span>
                                <i className="uil uil-angle-down"></i>
                            </div>
                            <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
                                <Link to="/" className="dropdown-item">Home</Link>
                                <Link to="/dashboard/templates" className="dropdown-item">Templates</Link>
                                <Link to="/dashboard/interviews" className="dropdown-item">Interviews</Link>
                                <LogoutButton />
                            </div>
                        </>
                    ) : (
                        <LoginButton />
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;