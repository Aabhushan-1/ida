import React from 'react';
import ReactDOM from 'react-dom/client';
import { NavBar } from '../../components/NavBar';
import { WhyChooseUs } from '../../components/WhyChooseUs';
import { Footer } from '../../components/Footer';
import { useAuthUser } from '../hooks/useAuthUser';
import { handleNavigation } from '../utils/navigation';
import '../../index.css';

const WhyChooseUsPage = () => {
    const { user, handleLogout } = useAuthUser();

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 bg-dot-grid selection:bg-green-500/30 flex flex-col">
            <NavBar user={user} onLogout={handleLogout} onNavigate={handleNavigation} />
            <WhyChooseUs />
            <Footer onNavigate={handleNavigation} />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WhyChooseUsPage />
    </React.StrictMode>
);
