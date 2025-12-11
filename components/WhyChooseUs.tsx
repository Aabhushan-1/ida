/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ShieldCheckIcon, GlobeAmericasIcon, CpuChipIcon, ScaleIcon } from '@heroicons/react/24/outline';

export const WhyChooseUs: React.FC = () => {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 pt-24 pb-12 animate-in fade-in duration-500">
            <div className="mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Why Ida?</h1>
                <p className="text-zinc-400 text-lg max-w-2xl">
                    Traditional IP sales are slow, expensive, and legally complex. We've rebuilt the process for the speed of the internet.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900/60 transition-colors">
                    <CpuChipIcon className="w-10 h-10 text-blue-400 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Due Diligence</h3>
                    <p className="text-zinc-400">
                        Stop guessing what an idea is worth. Our Gemini-3 Pro models analyze thousands of market data points to provide objective, data-backed valuations in seconds, not weeks.
                    </p>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900/60 transition-colors">
                    <ShieldCheckIcon className="w-10 h-10 text-green-400 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">Verified & Secure</h3>
                    <p className="text-zinc-400">
                        Every listing undergoes a 3-step verification process. We ensure the IP is original, the seller is real, and the assets are ready for transfer before they hit the marketplace.
                    </p>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900/60 transition-colors">
                    <GlobeAmericasIcon className="w-10 h-10 text-purple-400 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">Global Reach</h3>
                    <p className="text-zinc-400">
                        Your idea isn't limited by geography. Ida connects you with a global network of builders, angel investors, and venture studios actively looking for their next venture.
                    </p>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-900/60 transition-colors">
                    <ScaleIcon className="w-10 h-10 text-yellow-400 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">Smart Contract Escrow</h3>
                    <p className="text-zinc-400">
                        We replaced expensive lawyers with code. Funds are held in escrow and only released when the buyer confirms receipt of the digital assets, ensuring a fair trade every time.
                    </p>
                </div>
            </div>
        </div>
    );
};
