/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

type Page = 'home' | 'marketplace' | 'solutions' | 'login' | 'signup' | 'item-details' | 'sell-idea' | 'about' | 'contact' | 'how-it-works' | 'why-choose-us' | 'blog' | 'success-stories';

interface FooterProps {
    onNavigate: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="w-full bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 mt-auto z-20 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div className="space-y-4">
                        <span
                            onClick={() => onNavigate('home')}
                            className="text-3xl text-white font-handwritten font-bold tracking-tight cursor-pointer hover:text-green-400 transition-colors"
                        >
                            ida.
                        </span>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                            The world's first marketplace for raw business ideas. Valuate, list, and sell your intellectual property instantly.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li><button onClick={() => onNavigate('marketplace')} className="hover:text-green-400 transition-colors">Marketplace</button></li>
                            <li><button onClick={() => onNavigate('solutions')} className="hover:text-green-400 transition-colors">Digital Solutions</button></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li><button onClick={() => onNavigate('about')} className="hover:text-green-400 transition-colors">About Us</button></li>
                            <li><button onClick={() => onNavigate('why-choose-us')} className="hover:text-green-400 transition-colors">Why Choose Us?</button></li>
                            <li><button onClick={() => onNavigate('contact')} className="hover:text-green-400 transition-colors">Contact Us</button></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-green-400 transition-colors">How It Works</button></li>
                            <li><button onClick={() => onNavigate('blog')} className="hover:text-green-400 transition-colors">Blog</button></li>
                            <li><button onClick={() => onNavigate('success-stories')} className="hover:text-green-400 transition-colors">Success Stories</button></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-600 text-xs">© 2024 Ida Marketplace Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-zinc-600">
                        <button className="hover:text-zinc-400 transition-colors">Privacy Policy</button>
                        <button className="hover:text-zinc-400 transition-colors">Terms of Service</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
