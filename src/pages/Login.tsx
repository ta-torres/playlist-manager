import { useSpotify } from '../context/SpotifyContext';
import { SpotifyContextType } from '../types';
import { FaSpotify } from 'react-icons/fa6';
import logo from '../assets/logo.svg';
import Footer from '../components/Footer';

const Login = () => {
    const { login } = useSpotify() as SpotifyContextType;

    return (
        <div className="page">
            <header className="header">
                <div className="header-content">
                    <div className="logo-container">
                        <img src={logo} alt="Playlist Manager" className="logo" />
                        <h1>Playlist Manager</h1>
                    </div>
                </div>
            </header>
            <div className="login-container">
                <button className="login-btn btn" onClick={login}>
                    <FaSpotify className="icon" />
                    Sign in with Spotify
                </button>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
