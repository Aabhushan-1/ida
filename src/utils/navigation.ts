/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Navigation helper for NavBar component
 * Maps page identifiers to their corresponding routes
 */
export const handleNavigation = (page: string): void => {
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
