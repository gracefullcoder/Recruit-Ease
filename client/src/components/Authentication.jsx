import React from "react";
import { useAuth0 } from "@auth0/auth0-react";



const LoginButton = () => {
    const { loginWithRedirect, isAuthenticated, user, isLoading } = useAuth0();

    if (isLoading) return <div>Loading...</div>;

    return !isAuthenticated && <button onClick={loginWithRedirect} className="auth-button">Log In</button>;
};

const LogoutButton = () => {
    const { logout, isAuthenticated } = useAuth0();

    return (
        isAuthenticated && <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="auth-button">
            Log Out
        </button>
    );
};

export { LoginButton, LogoutButton };