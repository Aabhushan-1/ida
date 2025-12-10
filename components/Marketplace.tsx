/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, AdjustmentsHorizontalIcon, PlusIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { getMarketplaceItems, MarketplaceFilters } from '../services/database';
import type { MarketplaceView } from '../types/database';
import { CATEGORIES } from '../constants/categories';
import { CategoryDropdown } from './CategoryDropdown';

// MiniRadial Component
const MiniRadial: React.FC<{ value: number }> = ({ value }) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    let colorClass = 'text-green-500';
    if (value < 40) colorClass = 'text-red-500';
    else if (value < 70) colorClass = 'text-yellow-500';

    const strokeClass = colorClass.replace('text-', 'stroke-');

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Background */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    className="stroke-zinc-800"
                    strokeWidth="3"
                    fill="transparent"
                />
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    className={strokeClass}
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className={`absolute text-sm font-bold ${colorClass}`}>{value}</span>
        </div>
    );
};

interface MarketplaceProps {
    user?: any;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ user }) => {
    const [items, setItems] = useState<MarketplaceView[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [priceRange, setPriceRange] = useState<number>(10000); // Max price
    const [hasMvp, setHasMvp] = useState(false);
    const [hasDocs, setHasDocs] = useState(false);
    const [sortOption, setSortOption] = useState<{ field: 'price' | 'overall_score', direction: 'asc' | 'desc' } | null>(null);

    // UI State
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    const filterRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSortMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check for "Space Bar" search trigger
    useEffect(() => {
        if (searchTerm.endsWith(' ')) {
            fetchItems();
        }
    }, [searchTerm]);

    // Fetch items when any filter changes (debounced search handled by space/enter, but others instant?)
    // User requirement: "sort button should work... filter should work..."
    // Usually these trigger fetch immediately.
    useEffect(() => {
        fetchItems();
    }, [selectedCategory, sortOption, hasMvp, hasDocs]);
    // Intentionally NOT including searchTerm here to respect specific trigger requirement or debounce, 
    // but typically search should be live. 
    // User said "with each space bar...". Use effect above handles that.
    // Also trigger when slider changes? Slider drag heavy. I'll trigger on change (mouse up usually) or debounce.
    // HTML range input onChange fires continuously. onMouseUp is better.
    // I'll add a separate effect or handler for price.

    // Fetch items logic
    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters: MarketplaceFilters = {
                limit: 100,
                searchTerm: searchTerm.trim(), // Send trimmed
                category: selectedCategory || undefined,
                maxPrice: priceRange,
                hasMvp: hasMvp,
                hasDocs: hasDocs,
                sort: sortOption || undefined
            };

            const { data, error: fetchError } = await getMarketplaceItems(filters);

            if (fetchError) throw fetchError;
            setItems(data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load marketplace items');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        // Space bar trigger handled by useEffect
    };

    const handleSearchSubmit = () => {
        fetchItems();
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPriceRange(parseInt(e.target.value));
    };

    // Trigger fetch when price dragging stops
    const handlePriceCommit = () => {
        fetchItems();
    };

    const handleItemClick = (item: MarketplaceView) => {
        if (!user) {
            window.location.href = '/pages/login.html';
        } else {
            window.location.href = `/pages/details.html?id=${item.idea_id}`;
        }
    };

    const handleAddListing = () => {
        if (!user) {
            window.location.href = '/pages/login.html';
        } else {
            window.location.href = '/pages/sell.html';
        }
    };

    const getCategoryColor = (index: number) => {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
        return colors[index % colors.length];
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Marketplace</h1>
                    <p className="text-zinc-400 max-w-2xl text-lg">
                        Discover verified business concepts, IP, and franchise opportunities ready for acquisition.
                    </p>
                </div>

                <button
                    onClick={handleAddListing}
                    className="flex items-center gap-2 bg-green-500 text-black px-6 py-3 rounded-full font-bold hover:bg-green-400 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)] shrink-0"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add new listing
                </button>
            </div>

            {/* Toolbar */}
            <div className="sticky top-20 z-20 flex flex-col lg:flex-row gap-4 mb-8 bg-zinc-950/80 backdrop-blur-xl p-4 -mx-4 md:mx-0 rounded-xl border border-white/5 shadow-2xl items-center">

                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchInput}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                        placeholder="Search assets, industries, or keywords..."
                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50 transition-colors"
                    />
                </div>

                {/* Category Dropdown (Beside Search) */}
                <div className="relative w-full lg:w-48 shrink-0">
                    <CategoryDropdown
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        placeholder="All Categories"
                    />
                </div>

                <div className="flex gap-2 w-full lg:w-auto flex-wrap">
                    {/* Sort Button & Popover */}
                    <div className="relative" ref={sortRef}>
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${showSortMenu || sortOption ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'}`}
                        >
                            <AdjustmentsHorizontalIcon className="w-4 h-4" />
                            Sort
                        </button>

                        {showSortMenu && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-4 z-30 animate-in fade-in zoom-in-95 duration-200">
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sort By</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Price: Low to High', val: { field: 'price', direction: 'asc' } },
                                        { label: 'Price: High to Low', val: { field: 'price', direction: 'desc' } },
                                        { label: 'Rating: Low to High', val: { field: 'overall_score', direction: 'asc' } },
                                        { label: 'Rating: High to Low', val: { field: 'overall_score', direction: 'desc' } },
                                    ].map((opt, idx) => (
                                        <label key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={sortOption?.field === opt.val.field && sortOption?.direction === opt.val.direction}
                                                onChange={() => {
                                                    setSortOption(opt.val as any);
                                                    setShowSortMenu(false); // Close on select
                                                }}
                                                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                                            />
                                            <span className="text-sm text-zinc-300 group-hover:text-white">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {sortOption && (
                                    <button
                                        onClick={() => setSortOption(null)}
                                        className="mt-3 w-full text-xs text-zinc-500 hover:text-zinc-300 py-1"
                                    >
                                        Clear Sort
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Filter Button & Popover */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${showFilterMenu || hasMvp || hasDocs || priceRange < 10000 ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'}`}
                        >
                            <FunnelIcon className="w-4 h-4" />
                            Filter
                        </button>

                        {showFilterMenu && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-5 z-30 animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-6">
                                    {/* Features Checkboxes */}
                                    <div>
                                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Features</h3>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={hasMvp}
                                                    onChange={(e) => setHasMvp(e.target.checked)}
                                                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-green-500 focus:ring-green-500"
                                                />
                                                <span className="text-sm text-zinc-300 group-hover:text-white">MVP Available</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={hasDocs}
                                                    onChange={(e) => setHasDocs(e.target.checked)}
                                                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-green-500 focus:ring-green-500"
                                                />
                                                <span className="text-sm text-zinc-300 group-hover:text-white">Additional Documents</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Price Range Slider */}
                                    <div>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Max Price</h3>
                                            <span className="text-sm font-mono text-green-400 font-medium">${priceRange.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10000"
                                            step="100"
                                            value={priceRange}
                                            onChange={handlePriceChange}
                                            onMouseUp={handlePriceCommit}
                                            onTouchEnd={handlePriceCommit}
                                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
                                        />
                                        <div className="flex justify-between mt-1 text-[10px] text-zinc-600 font-mono">
                                            <span>$0</span>
                                            <span>$10,000+</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setHasMvp(false);
                                            setHasDocs(false);
                                            setPriceRange(10000);
                                            // setShowFilterMenu(false);
                                        }}
                                        className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded hover:bg-zinc-800 transition-colors"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button onClick={() => fetchItems()} className="text-xs text-red-400 mt-2 hover:underline">Try Again</button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-zinc-400">Loading marketplace...</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5">
                    <MagnifyingGlassIcon className="w-12 h-12 text-zinc-600 mb-4" />
                    <p className="text-zinc-400 text-lg mb-2">No matching results found</p>
                    <p className="text-zinc-500 text-sm mb-6">Try adjusting your filters or search terms.</p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                            setHasMvp(false);
                            setHasDocs(false);
                            setPriceRange(10000);
                            setSortOption(null);
                        }}
                        className="text-green-400 hover:text-green-300 font-medium"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Grid */}
            {!loading && items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.map((item, index) => (
                        <div
                            key={item.idea_id}
                            onClick={() => handleItemClick(item)}
                            className="group relative bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 p-5 rounded-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden active:scale-95 flex flex-col h-full"
                        >
                            <div className={`absolute top-0 left-0 w-full h-0.5 ${getCategoryColor(index)} opacity-50`}></div>

                            {/* Header: Username & Rating */}
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] text-zinc-300 border-zinc-700 border px-2 py-1 rounded font-mono">
                                    @{item.username.replace(/^@/, '').toLowerCase()}
                                </span>
                                <div className="flex items-center space-x-1 text-zinc-400">
                                    <StarIcon className="w-3 h-3" />
                                    <span className="text-xs">{item.overall_score.toFixed(1)}</span>
                                </div>
                            </div>

                            {/* Title & Description */}
                            <h4 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-green-400 transition-colors truncate">
                                {item.title}
                            </h4>
                            <p className="text-zinc-400 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
                                {item.description}
                            </p>

                            {/* 3 Circular Indicators */}
                            <div className="flex flex-nowrap gap-4 justify-center mb-6 mt-auto">
                                <MiniRadial value={Math.round(item.uniqueness || 0)} />
                                <MiniRadial value={Math.round(item.viability || 0)} />
                                <MiniRadial value={Math.round(item.overall_score * 10)} />
                            </div>

                            {/* Footer: Price */}
                            <div className="flex items-end justify-between border-t border-zinc-800 pt-4 mt-auto">
                                <div>
                                    <div className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Asking price</div>
                                    <div className="text-2xl font-bold text-white">
                                        ${item.price.toLocaleString()}
                                    </div>
                                </div>
                                {item.mvp && (
                                    <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold uppercase rounded border border-green-500/20">
                                        MVP
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};