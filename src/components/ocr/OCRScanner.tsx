"use client";

import { useState, useRef } from "react";
import { scanImage } from "@/lib/ocr";
import { Ingredient } from "@/lib/ingredients";
import { Scan, Upload, Loader2, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OCRScanner({ onScanComplete }: { onScanComplete: (ingredients: string[]) => void }) {
    const [isScanning, setIsScanning] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        try {
            const result = await scanImage(file);
            console.log("Scan Result:", result);

            if (result.foundIngredients.length > 0) {
                onScanComplete(result.foundIngredients.map(i => i.id));
            } else {
                alert("No known ingredients found. Try a clearer image.");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to scan image.");
        } finally {
            setIsScanning(false);
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
            >
                <Camera className="w-4 h-4" />
                Scan Label
            </button>

            {/* Scanning Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <div className="bg-[#050510] border border-white/10 p-6 rounded-2xl w-full max-w-sm relative">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-white/50 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-lg font-light text-center mb-6 flex items-center justify-center gap-2">
                                <Scan className="w-5 h-5 text-cyan-400" />
                                Optical Analysis
                            </h3>

                            {isScanning ? (
                                <div className="flex flex-col items-center py-8">
                                    <div className="relative w-16 h-16 mb-4">
                                        <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin" />
                                        <div className="absolute inset-2 border-r-2 border-purple-500 rounded-full animate-spin reverse" />
                                    </div>
                                    <p className="text-sm text-cyan-200 animate-pulse">
                                        Processing neural scan...
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-4 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 border-dashed rounded-xl flex flex-col items-center gap-2 transition-all group"
                                    >
                                        <Upload className="w-6 h-6 text-white/50 group-hover:text-cyan-400 transition-colors" />
                                        <span className="text-sm text-white/70">Upload Label Image</span>
                                    </button>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        capture="environment" // Mobile camera trigger
                                        onChange={handleFileUpload}
                                    />

                                    <p className="text-xs text-center text-white/30 pt-2">
                                        Detects: Retinol, Vit-C, Acids, etc.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
