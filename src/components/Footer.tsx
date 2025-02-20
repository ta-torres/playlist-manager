import { FaSpotify } from 'react-icons/fa';

const Footer = () => (
    <footer>
        <div className="spotify-attribution">
            <p>
                Powered by{' '}
                <a href="https://www.spotify.com" target="_blank" rel="noopener noreferrer">
                    Spotify
                </a>
                <FaSpotify style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
            </p>
        </div>
    </footer>
);

export default Footer;
