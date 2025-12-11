import React, { useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { NavBar } from '../../components/NavBar';
import { ItemDetails } from '../../components/ItemDetails';
import { useAuthUser } from '../hooks/useAuthUser';
import '../../index.css';

const ItemDetailsPage = () => {
    const { user, handleLogout } = useAuthUser();

    const ideaId = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || '';
    }, []);

    // Redirect non-logged-in users to login page
    useEffect(() => {
        if (user === null) {
            const timer = setTimeout(() => {
                if (!user) {
                    window.location.href = '/pages/login.html';
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Show loading while checking auth
    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
                <div className="text-zinc-400">Loading...</div>
            </div>
        );
    }

    if (!ideaId) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Invalid Idea ID</h1>
                    <a href="/pages/marketplace.html" className="text-green-400 hover:underline">Return to Marketplace</a>
                </div>
            </div>
        )
    }

    const handleNavigate = (page: string) => {
        const routes: Record<string, string> = {
            'home': '/index.html',
            'marketplace': '/pages/marketplace.html',
            'solutions': '/pages/solutions.html',
            'sell-idea': '/pages/sell.html',
            'login': '/pages/login.html',
            'profile': '/pages/profile.html',
            'dashboard': '/pages/dashboard.html'
        };

        if (routes[page]) {
            window.location.href = routes[page];
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 bg-dot-grid selection:bg-green-500/30">
            <NavBar user={user} onLogout={handleLogout} onNavigate={handleNavigate} currentPage="item-details" />
            <ItemDetails ideaId={ideaId} onBack={() => window.location.href = '/pages/marketplace.html'} />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ItemDetailsPage />
    </React.StrictMode>
);
