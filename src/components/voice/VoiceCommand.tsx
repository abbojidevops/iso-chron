"use client";

import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceCommandProps {
    onCommand: (command: string) => void;
}

export function VoiceCommand({ onCommand }: VoiceCommandProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);

    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window)) {
            setError("Voice control not supported in this browser.");
            return;
        }

        // @ts-ignore - Web Speech API type
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);
            onCommand(text.toLowerCase());
        };

        recognition.onerror = (event: any) => {
            setError("Listening error. Try again.");
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [onCommand]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {/* Transcript Bubble */}
                {(transcript || isListening) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-black/80 backdrop-blur border border-cyan-500/30 px-4 py-2 rounded-lg text-sm text-cyan-400 font-mono mb-2"
                    >
                        {isListening ? "Listening..." : `"${transcript}"`}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mic Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={startListening}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border transition-all ${isListening
                        ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse"
                        : "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                    }`}
            >
                {isListening ? <Activity className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
            </motion.button>

            {error && <span className="text-xs text-red-500 bg-black/50 px-2 py-1 rounded">{error}</span>}
        </div>
    );
}
