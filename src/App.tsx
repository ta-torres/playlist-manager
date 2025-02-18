import "./App.css";
import { useState } from "react";
import { useSpotify } from "./context/SpotifyContext";
import { FaSpotify } from "react-icons/fa6";
import logo from "./assets/logo.svg";
import { Library } from "./components/Library";
import PlaylistCreator from "./components/PlaylistCreator";
import SongItem from "./components/SongItem";
import PlaylistItem from "./components/PlaylistItem";
import Greeting from "./components/Greeting";
import { Song, Playlist, SpotifyContextType } from "./types";

function App() {
  const { isAuthenticated, login } = useSpotify() as SpotifyContextType;
  const [activeView, setActiveView] = useState<"songs" | "playlists" | null>(
    null
  );
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  return (
    <>
      <div className="page">
        <header className="header">
          <img src={logo} alt="Playlist Manager" className="logo" />
          <h1>Playlist Manager</h1>
        </header>
        <section className={`login ${isAuthenticated ? "disabled" : ""}`}>
          <button className="login-btn btn" onClick={login}>
            <FaSpotify className="icon" />
            Sign in with Spotify
          </button>
        </section>
        <main className={`main-content ${!isAuthenticated ? "disabled" : ""}`}>
          <Greeting />
          <section className="results-section disabled">
            <h2>Playlists created</h2>
            <span className="spinner disabled" />
            <div className="results-message" />
          </section>
          <section className="my-library-section">
            <Library
              setActiveView={setActiveView}
              setLikedSongs={setLikedSongs}
              setPlaylists={setPlaylists}
            />
            <PlaylistCreator />
          </section>
          <section className="list-container">
            <ul className={activeView === "playlists" ? "playlists" : ""}>
              {activeView === "songs" &&
                likedSongs.map((song) => (
                  <SongItem key={song.id} song={song} />
                ))}
              {activeView === "playlists" &&
                playlists.map((playlist) => (
                  <PlaylistItem key={playlist.id} playlist={playlist} />
                ))}
            </ul>
          </section>
        </main>
      </div>
    </>
  );
}

export default App;
