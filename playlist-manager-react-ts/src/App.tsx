//@ts-nocheck
import './App.css';
import { initializeApp } from './modules/ui';
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        initializeApp();
    }, []);
    return (
        <>
            <div className="page">
                <header className="header">
                    <h1>Playlist Manager</h1>
                </header>
                <section className="login">
                    <button className="login-btn btn">
                        Sign in with Spotify
                    </button>
                </section>
                <main className="main-content disabled">
                    <div className="login-message" />
                    <section className="results-section disabled">
                        <h2>Playlists created</h2>
                        <span className="spinner disabled" />
                        <div className="results-message" />
                    </section>
                    <section className="my-library-section">
                        <section className="my-library">
                            <h2>Your Library</h2>
                            <div className="buttons">
                                <button className="liked-songs-btn btn">
                                    <span className="btn-text">
                                        {' '}
                                        Liked Songs{' '}
                                    </span>
                                    <span className="spinner disabled" />
                                </button>
                                <button className="show-playlists-btn btn">
                                    <span className="btn-text">
                                        {' '}
                                        Playlists{' '}
                                    </span>
                                    <span className="spinner disabled" />
                                </button>
                            </div>
                        </section>
                        <section className="create-playlists">
                            <h2>Playlists</h2>
                            <div className="buttons">
                                <button className="create-playlist-btn btn">
                                    <span className="btn-text">
                                        Create playlists by decade
                                    </span>
                                    <span className="spinner disabled" />
                                </button>
                            </div>
                        </section>
                    </section>
                    <section className="list-container">
                        <ul />
                    </section>
                </main>
            </div>
        </>
    );
}

export default App;
