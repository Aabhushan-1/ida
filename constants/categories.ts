/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CATEGORIES = [
    'Automotive & Mobility',
    'Education & Training',
    'Energy & Utilities',
    'E-commerce & Retail',
    'Fashion & Apparel',
    'Finance & Banking',
    'Food & Beverage',
    'Health & Wellness',
    'Logistics & Transportation',
    'Manufacturing & Industrial',
    'Marketing & Advertising',
    'Media & Entertainment',
    'Real Estate & Construction',
    'Technology & Software',
    'Travel & Hospitality'
] as const;

export type Category = typeof CATEGORIES[number];
