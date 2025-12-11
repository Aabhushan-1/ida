/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Navigation helper for NavBar and Footer components
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
        'dashboard': '/pages/dashboard.html',
        'about': '/pages/about.html',
        'contact': '/pages/contact.html',
        'how-it-works': '/pages/how-it-works.html',
        'why-choose-us': '/pages/why-choose-us.html',
        'blog': '/pages/blog.html',
        'success-stories': '/pages/success-stories.html'
    };

    if (routes[page]) {
        window.location.href = routes[page];
    }
};
