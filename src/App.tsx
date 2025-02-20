import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { SpotifyProvider } from './context/SpotifyContext';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './pages/ProtectedRoute';
import ErrorPage from './pages/ErrorPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: '/login',
        element: <Login />,
    },
]);

function App() {
    return (
        <SpotifyProvider>
            <RouterProvider router={router} />
        </SpotifyProvider>
    );
}

export default App;
