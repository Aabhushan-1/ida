/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

export const About: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 pt-24 pb-12 animate-in fade-in duration-500">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Democratizing Entrepreneurship</h1>

            <div className="prose prose-invert prose-lg text-zinc-400 leading-relaxed space-y-8">
                <p className="text-xl text-zinc-300">
                    Ida was born from a simple observation: <strong>Great ideas die on napkins.</strong>
                </p>

                <p>
                    Every day, millions of brilliant business concepts are conceived, sketched out, and then forgotten because the creator lacked the resources, time, or technical skills to build an MVP.
                </p>

                <div className="bg-zinc-900/50 border-l-4 border-green-500 p-6 my-8 rounded-r-lg">
                    <p className="italic text-white m-0">
                        "Our mission is to create a liquid marketplace for intellectual property, allowing creators to monetize their raw creativity and builders to find vetted, high-potential concepts."
                    </p>
                </div>

                <h3 className="text-2xl font-bold text-white mt-12 mb-4">The Team</h3>
                <p>
                    We are a collective of former founders, VC analysts, and AI engineers. We believe that the value of a business starts at conception, not just at revenue. By leveraging advanced AI valuation models, we provide an objective baseline for ideas that previously had no liquidity.
                </p>
            </div>
        </div>
    );
};
