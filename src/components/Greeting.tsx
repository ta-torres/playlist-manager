import { useEffect, useState } from 'react';
import { useSpotify } from '../context/SpotifyContext';
// @ts-expect-error not typed yet
import SpotifyAPI from '../modules/api';
import { SpotifyContextType, SpotifyProfile } from '../types';

const Greeting = () => {
    const { accessToken } = useSpotify() as SpotifyContextType;
    const [displayName, setDisplayName] = useState<string>('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = (await SpotifyAPI.getUsersProfile(accessToken)) as SpotifyProfile;
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
