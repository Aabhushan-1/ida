import React, { useState, useEffect } from 'react';
import {
    ArrowLeftIcon, CheckBadgeIcon, ChartBarIcon, DocumentTextIcon, ShieldCheckIcon, LinkIcon, DocumentCheckIcon, LockClosedIcon,
    HeartIcon, BookmarkIcon, ShareIcon, ClipboardDocumentIcon, XMarkIcon, CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon, HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { getIdeaDetailById, getLikeStatus, toggleLike, getSaveStatus, toggleSave, getShareCount, trackShare } from '../services/database';
import { supabase } from '../services/supabase';
import type { IdeaDetailView } from '../types/database';
import { User } from '@supabase/supabase-js';

interface ItemDetailsProps {
    ideaId: string;
    onBack: () => void;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({ ideaId, onBack }) => {
    const [item, setItem] = useState<IdeaDetailView | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    // Share Modal State
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shareCount, setShareCount] = useState(0);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch Item
                const { data, error: fetchError } = await getIdeaDetailById(ideaId);
                if (fetchError) throw fetchError;
                if (!data) throw new Error('Idea not found');
                setItem(data);

                // Fetch Share Count
                const count = await getShareCount(ideaId);
                setShareCount(count);

                // Auth & Social State
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUser(user);

                if (user) {
                    const likeStatus = await getLikeStatus(ideaId, user.id);
                    setIsLiked(likeStatus.liked);

                    const saveStatus = await getSaveStatus(ideaId, user.id);
                    setIsSaved(saveStatus.saved);
                }
                const likeStatus = await getLikeStatus(ideaId);
                setLikeCount(likeStatus.count);

            } catch (err: any) {
                setError(err.message || 'Failed to load idea details');
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [ideaId]);

    const handleCopyLink = async () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        // Track share
        await trackShare(ideaId, currentUser?.id);
        setShareCount(prev => prev + 1);
    };

    const handleLike = async () => {
        if (!currentUser) return alert('Please log in to like ideas.');
        // Optimistic UI interaction
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

        const { error, count } = await toggleLike(ideaId, currentUser.id);
        if (error) {
            // Revert
            setIsLiked(!newLiked);
            setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
        } else {
            setLikeCount(count);
        }
    };

    const handleSave = async () => {
        if (!currentUser) return alert('Please log in to save items');
        const { saved } = await toggleSave(ideaId, currentUser.id);
        setIsSaved(saved);
    };

    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 pt-24 pb-12">
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-zinc-400">Loading idea details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="w-full max-w-5xl mx-auto px-4 pt-24 pb-12">
                <button
                    onClick={onBack}
                    className="group flex items-center space-x-2 text-zinc-500 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Marketplace</span>
                </button>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
                    <p className="text-red-500 text-lg mb-4">{error || 'Idea not found'}</p>
                    <button
                        onClick={onBack}
                        className="text-green-400 hover:text-green-300 font-medium"
                    >
                        Return to Marketplace →
                    </button>
                </div>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-500';
        if (score >= 50) return 'text-yellow-500';
        if (score >= 25) return 'text-orange-500';
        return 'text-red-500';
    };

    const getDemandColor = (demand: string) => {
        if (demand === 'High') return 'text-green-500';
        if (demand === 'Mid-High') return 'text-green-400';
        if (demand === 'Mid') return 'text-yellow-500';
        if (demand === 'Low-Mid') return 'text-orange-500';
        return 'text-red-500';
    };

    const handleContactSeller = () => {
        if (!currentUser) return alert('Please log in to message the seller.');
        if (!item) return;

        console.log('Contact Seller clicked', { currentUserId: currentUser.id, sellerId: item.user_id });

        if (!item.user_id) {
            alert("System Error: Could not identify the seller. Please try again later or contact support.");
            console.error("Critical: item.user_id is missing even after patch strategies.");
            return;
        }

        if (currentUser.id === item.user_id) return alert('You cannot message yourself.');

        window.dispatchEvent(new CustomEvent('ida:open-chat', {
            detail: {
                userId: item.user_id,
                userName: item.username
            }
        }));
        console.log('Dispatching open-chat event');
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pt-24 pb-12 animate-in fade-in duration-500">
            <button
                onClick={onBack}
                className="group flex items-center space-x-2 text-zinc-500 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Marketplace</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column - Detailed Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Title & Header Card */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {item.category || 'Business'}
                            </span>
                            <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-3 py-1 rounded-full text-xs font-medium">
                                {item.stage || 'Concept'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{item.title}</h1>
                        <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">{item.one_line_description}</p>
                    </div>

                    {/* Problem & Solution (The "Meat") */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-lg space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-red-400" />
                                The Problem
                            </h2>
                            <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{item.problem_description || "No problem description provided."}</p>

                            {(item.who_faces_problem || item.pain_level) && (
                                <div className="mt-4 flex gap-4 text-sm">
                                    {item.who_faces_problem && (
                                        <div className="bg-zinc-950/50 border border-zinc-800 px-3 py-2 rounded text-zinc-400">
                                            <span className="block text-xs uppercase text-zinc-600 font-bold mb-1">Target</span>
                                            {item.who_faces_problem}
                                        </div>
                                    )}
                                    {item.pain_level && (
                                        <div className="bg-zinc-950/50 border border-zinc-800 px-3 py-2 rounded text-zinc-400">
                                            <span className="block text-xs uppercase text-zinc-600 font-bold mb-1">Pain Lvl</span>
                                            {item.pain_level}/5
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-white/5 w-full" />

                        <div>
                            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                                <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                                The Solution
                            </h2>
                            <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{item.solution_summary || "No solution summary provided."}</p>

                            {item.primary_advantage && (
                                <div className="mt-4 bg-green-500/5 border border-green-500/10 p-4 rounded-lg">
                                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Unfair Advantage</span>
                                    <p className="text-green-100 mt-1">{item.primary_advantage}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Market & Revenue Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5 text-blue-400" />
                                Market Potential
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Market Size</span>
                                    <span className="text-zinc-200 font-medium">{item.market_size || 'N/A'}</span>
                                </li>
                                <li className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Growth Trend</span>
                                    <span className="text-zinc-200 font-medium">{item.market_growth_trend || 'N/A'}</span>
                                </li>
                                <li className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Geo Scope</span>
                                    <span className="text-zinc-200 font-medium">{item.geographic_scope || 'N/A'}</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <div className="w-5 h-5 text-yellow-400 font-serif font-bold">$</div>
                                Revenue Model
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Model Type</span>
                                    <span className="text-zinc-200 font-medium">{item.revenue_model_type || 'N/A'}</span>
                                </li>
                                <li className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Price / Cust</span>
                                    <span className="text-zinc-200 font-medium">{item.expected_price_per_customer || 'N/A'}</span>
                                </li>
                                <li className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Cost Intensity</span>
                                    <span className="text-zinc-200 font-medium">{item.cost_intensity || 'N/A'}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Execution & Validation */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
                            Execution & Validation
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                                <div className="text-xs text-zinc-500 uppercase">Difficulty</div>
                                <div className="text-white font-medium mt-1">{item.build_difficulty || 'Unknown'}</div>
                            </div>
                            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                                <div className="text-xs text-zinc-500 uppercase">Time to v1</div>
                                <div className="text-white font-medium mt-1">{item.time_to_first_version || 'Unknown'}</div>
                            </div>
                            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                                <div className="text-xs text-zinc-500 uppercase">Validation</div>
                                <div className="text-white font-medium mt-1">{item.validation_level || 'None'}</div>
                            </div>
                        </div>
                        {item.validation_notes && (
                            <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-lg">
                                <span className="text-xs font-bold text-purple-400 uppercase">Traction / Notes</span>
                                <p className="text-zinc-300 text-sm mt-2">{item.validation_notes}</p>
                            </div>
                        )}
                    </div>

                    {/* AI Scoring Card */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <ChartBarIcon className="w-5 h-5 text-green-500" />
                            AI Analysis & Scoring
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4">
                                <div className="text-xs text-zinc-500 uppercase mb-2">Uniqueness</div>
                                <div className={`text-2xl md:text-3xl font-bold ${getScoreColor(item.uniqueness)}`}>
                                    {item.uniqueness}
                                </div>
                                <div className="text-xs text-zinc-600 mt-1">out of 100</div>
                            </div>
                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4">
                                <div className="text-xs text-zinc-500 uppercase mb-2">Demand</div>
                                <div className={`text-xl md:text-2xl font-bold ${getDemandColor(item.demand)}`}>
                                    {item.demand}
                                </div>
                                <div className="text-xs text-zinc-600 mt-1">Market</div>
                            </div>
                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4">
                                <div className="text-xs text-zinc-500 uppercase mb-2">Impact</div>
                                <div className={`text-2xl md:text-3xl font-bold ${getScoreColor(item.problem_impact)}`}>
                                    {item.problem_impact}
                                </div>
                                <div className="text-xs text-zinc-600 mt-1">out of 100</div>
                            </div>
                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4">
                                <div className="text-xs text-zinc-500 uppercase mb-2">Viability</div>
                                <div className={`text-2xl md:text-3xl font-bold ${getScoreColor(item.viability)}`}>
                                    {item.viability}
                                </div>
                                <div className="text-xs text-zinc-600 mt-1">out of 100</div>
                            </div>
                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4">
                                <div className="text-xs text-zinc-500 uppercase mb-2">Scalability</div>
                                <div className={`text-2xl md:text-3xl font-bold ${getScoreColor(item.scalability)}`}>
                                    {item.scalability}
                                </div>
                                <div className="text-xs text-zinc-600 mt-1">out of 100</div>
                            </div>
                            <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 col-span-2 lg:col-span-1">
                                <div className="text-xs text-zinc-500 uppercase mb-2">Overall</div>
                                <div className={`text-2xl md:text-3xl font-bold ${getScoreColor(item.overall_score)}`}>
                                    {item.overall_score.toFixed(1)}
                                </div>
                                <div className="text-xs text-zinc-600 mt-1">Average</div>
                            </div>
                        </div>
                        {/* Profitability */}
                        <div className="mt-6 bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                            <div className="text-xs text-green-400 uppercase mb-2">Profitability Estimate</div>
                            <div className="text-zinc-300 text-sm md:text-base">{item.profitability}</div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-green-500" />
                            Documents
                        </h2>
                        <div className="space-y-3">
                            <a href={item.document_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-800 hover:border-green-500/50 rounded-lg p-4 transition-colors group cursor-pointer">
                                <DocumentTextIcon className="w-8 h-8 text-green-500" />
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">Primary Prospectus</div>
                                    <div className="text-xs text-zinc-500">Main PDF Document</div>
                                </div>
                            </a>

                            {[item.additional_doc_1, item.additional_doc_2, item.additional_doc_3].map((doc, idx) => (
                                doc && (
                                    <a key={idx} href={doc} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-zinc-950/50 border border-zinc-800 hover:border-zinc-600 rounded-lg p-4 transition-colors">
                                        <DocumentTextIcon className="w-5 h-5 text-zinc-500" />
                                        <div className="text-sm font-medium text-white">Additional Document {idx + 1}</div>
                                    </a>
                                )
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column - Sticky Price Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">

                        {/* Price Display */}
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-zinc-400 font-medium mb-1">Asking Price</div>
                                <div key="price" className="text-4xl font-bold text-white tracking-tight">
                                    ${item.price.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-xs text-zinc-500 font-mono lowercase bg-white/5 border border-white/5 px-2 py-1 rounded h-fit">
                                @{item.username.replace(/^@/, '').toLowerCase()}
                            </div>
                        </div>

                        {item.mvp && (
                            <div className="inline-flex items-center gap-2 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                                <CheckBadgeIcon className="w-4 h-4" />
                                <span>MVP Available</span>
                            </div>
                        )}

                        {/* Rating Row */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="bg-yellow-500/10 p-1.5 rounded-lg">
                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-white leading-none">{item.overall_score.toFixed(1)}</span>
                                    <span className="text-xs text-zinc-500 uppercase">AI Score</span>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-white/10 mx-2"></div>
                            <div className="flex flex-col items-end px-2">
                                <span className="text-xs text-zinc-400">Validated by</span>
                                <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">IDA AI</span>
                            </div>
                        </div>

                        {/* Main CTAs */}
                        <div className="space-y-3 mb-6">
                            <button className="w-full bg-white text-black hover:bg-zinc-200 font-bold text-lg py-3.5 rounded-xl transition-all shadow-lg">
                                Buy Now
                            </button>
                            <button
                                onClick={handleContactSeller}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-lg py-3.5 rounded-xl border border-white/10 transition-all shadow-lg"
                            >
                                Message Seller
                            </button>
                            <a
                                href={`/pages/profile.html?id=${item.user_id}`}
                                className="block w-full text-center text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all py-3 rounded-xl"
                            >
                                View Seller Profile →
                            </a>
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex gap-3 mb-8">
                            <button
                                onClick={handleLike}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors ${isLiked
                                    ? 'bg-pink-500/10 border-pink-500/50 text-pink-500 hover:bg-pink-500/20'
                                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800'
                                    } `}
                            >
                                {isLiked ? (
                                    <HeartIconSolid className="w-5 h-5" />
                                ) : (
                                    <HeartIcon className="w-5 h-5" />
                                )}
                                <span className="text-sm font-medium">Like {likeCount > 0 && `(${likeCount})`}</span>
                            </button>

                            <button
                                onClick={handleSave}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors ${isSaved
                                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-500 hover:bg-blue-500/20'
                                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800'
                                    } `}
                            >
                                {isSaved ? (
                                    <BookmarkIconSolid className="w-5 h-5" />
                                ) : (
                                    <BookmarkIcon className="w-5 h-5" />
                                )}
                                <span className="text-sm font-medium">{isSaved ? 'Saved' : 'Save'}</span>
                            </button>

                            <button
                                onClick={() => setIsShareOpen(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-zinc-800 transition-colors"
                            >
                                <ShareIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">Share {shareCount > 0 && `(${shareCount})`}</span>
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="space-y-4 pt-6 border-t border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-full">
                                    <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Verified Listing</span>
                                    <span className="text-xs text-zinc-500 leading-tight">Audited by Ida's AI & verified ownership.</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-full">
                                    <DocumentCheckIcon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Smart Contract</span>
                                    <span className="text-xs text-zinc-500 leading-tight">Ownership transfer via secure escrow.</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Share Modal */}
            {isShareOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsShareOpen(false)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <ShareIcon className="w-5 h-5 text-green-500" />
                            Share this Idea
                        </h3>
                        <p className="text-zinc-400 text-sm mb-6">Copy the link below to share with others.</p>

                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LinkIcon className="h-5 w-5 text-zinc-500" />
                                </div>
                                <input
                                    type="text"
                                    readOnly
                                    value={window.location.href}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-green-500/50"
                                />
                            </div>

                            <button
                                onClick={handleCopyLink}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${copied
                                    ? 'bg-green-500 text-black'
                                    : 'bg-white text-black hover:bg-zinc-200'
                                    } `}
                            >
                                {copied ? (
                                    <>
                                        <CheckIcon className="w-5 h-5" />
                                        Copied to Clipboard!
                                    </>
                                ) : (
                                    <>
                                        <ClipboardDocumentIcon className="w-5 h-5" />
                                        Copy Link
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
