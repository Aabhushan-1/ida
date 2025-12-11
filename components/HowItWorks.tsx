/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { PencilIcon, SparklesIcon, TagIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export const HowItWorks: React.FC = () => {
    const steps = [
        {
            icon: PencilIcon,
            title: "1. Capture the Concept",
            description: "Sketch your idea on a napkin, take a photo of a whiteboard, or upload a PDF business plan. It starts with raw input."
        },
        {
            icon: SparklesIcon,
            title: "2. AI Valuation",
            description: "Our proprietary Gemini-powered engine analyzes uniqueness, feasibility, and competition to generate an instant valuation and prospectus."
        },
        {
            icon: TagIcon,
            title: "3. List on Marketplace",
            description: "Publish your asset to thousands of vetted buyers, investors, and builders looking for their next project."
        },
        {
            icon: BanknotesIcon,
            title: "4. Secure Transfer",
            description: "Once a buyer is found, we handle the IP transfer via smart contract and release the funds directly to you."
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto px-4 pt-44 pb-24 animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">From Napkin to Exit</h1>
                <p className="text-zinc-400 text-lg">
                    Ida simplifies the complex process of intellectual property sales into four simple steps.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative group">
                        <div className="absolute inset-0 bg-zinc-900 rounded-xl transform transition-transform group-hover:-translate-y-2"></div>
                        <div className="relative p-6 border border-zinc-800 bg-zinc-950 rounded-xl h-full transition-transform group-hover:-translate-y-2">
                            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-6 text-green-400 border border-zinc-800 group-hover:border-green-500/50 transition-colors">
                                <step.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
