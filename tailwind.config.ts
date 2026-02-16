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
                background: '#F8FAFC', // Soft white/blue tint
                foreground: '#0F172A', // Slate 900
                card: {
                    DEFAULT: 'rgba(255, 255, 255, 0.7)',
                    foreground: '#0F172A'
                },
                primary: {
                    DEFAULT: '#2563EB', // Electric Blue
                    foreground: '#FFFFFF'
                },
                secondary: {
                    DEFAULT: '#E879F9', // Vivid Pink/Purple
                    foreground: '#FFFFFF'
                },
                accent: {
                    DEFAULT: '#F1F5F9', // Slate 100
                    foreground: '#0F172A'
                },
                muted: {
                    DEFAULT: '#64748B', // Slate 500
                    foreground: '#F8FAFC'
                },
                destructive: {
                    DEFAULT: '#EF4444',
                    foreground: '#FFFFFF'
                },
                border: '#E2E8F0', // Slate 200
                input: '#F1F5F9',
                ring: '#2563EB',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
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
