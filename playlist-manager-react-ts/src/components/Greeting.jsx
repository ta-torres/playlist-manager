import { useEffect, useState } from 'react';
import { useSpotify } from '../context/SpotifyContext';
import SpotifyAPI from '../modules/api';

const Greeting = () => {
    const { accessToken } = useSpotify();
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await SpotifyAPI.getUsersProfile(accessToken);
                setDisplayName(profile.display_name);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    if (!displayName) return null;

    return <div className="login-message">Welcome {displayName}!</div>;
};

export default Greeting;
