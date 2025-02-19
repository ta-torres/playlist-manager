import { useSpotify } from '../context/SpotifyContext';
import { SpotifyContextType } from '../types';
import { FaSpotify } from 'react-icons/fa6';
import { IoExitOutline } from 'react-icons/io5';
import logo from '../assets/logo.svg';

const Header = () => {
    const { isAuthenticated, login, logout } = useSpotify() as SpotifyContextType;

    return (
        <>
            <header className="header">
                <div className="header-content">
                    <div className="logo-container">
                        <img src={logo} alt="Playlist Manager" className="logo" />
                        <h1>Playlist Manager</h1>
                    </div>
                    {!isAuthenticated ? (
                        <button className="login-btn btn" onClick={login}>
                            <FaSpotify className="icon" />
                            Sign in with Spotify
                        </button>
                    ) : (
                        <button className="logout-btn btn" onClick={logout} title="Sign Out">
                            <IoExitOutline className="icon" />
                        </button>
                    )}
                </div>
            </header>
        </>
    );
};

export default Header;
