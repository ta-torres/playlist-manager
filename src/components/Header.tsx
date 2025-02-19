import { useSpotify } from '../context/SpotifyContext';
import { SpotifyContextType } from '../types';
import { FaSpotify } from 'react-icons/fa6';
import logo from '../assets/logo.svg';

const Header = () => {
    const { isAuthenticated, login } = useSpotify() as SpotifyContextType;

    return (
        <>
            <header className="header">
                <div className="logo-container">
                    <img src={logo} alt="Playlist Manager" className="logo" />
                    <h1>Playlist Manager</h1>
                </div>
                {!isAuthenticated && (
                    <button className="login-btn btn" onClick={login}>
                        <FaSpotify className="icon" />
                        Sign in with Spotify
                    </button>
                )}
            </header>
        </>
    );
};

export default Header;
