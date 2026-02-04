import type { Config } from "tailwindcss";

export default {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#050505',
                foreground: '#ededed',
                card: {
                    DEFAULT: 'rgba(20, 20, 20, 0.6)',
                    foreground: '#ffffff'
                },
                primary: {
                    DEFAULT: '#ffffff',
                    foreground: '#000000'
                },
                accent: {
                    DEFAULT: '#3b82f6',
                    foreground: '#ffffff'
                },
                destructive: {
                    DEFAULT: '#ef4444',
                    foreground: '#ffffff'
                },
                border: 'rgba(255, 255, 255, 0.1)',
                input: 'rgba(255, 255, 255, 0.05)',
                ring: '#ffffff',
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)'],
                mono: ['var(--font-geist-mono)'],
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            }
        }
    },
    plugins: [],
} satisfies Config;
