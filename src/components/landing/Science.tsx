"use client";

import { motion } from "framer-motion";
import { Dna, Fingerprint, Activity } from "lucide-react";

export function Science() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="max-w-4xl mx-auto mb-16 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                        Why Molecular Auditing Matters: <br />
                        The Future of Skincare
                    </h2>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                        Skin aging and health are governed by complex biological processes that can be precisely measured through multi-omics analysis and epigenetics.
                        Traditional skincare approaches miss the mark without understanding your skin's unique molecular profile.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Content Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 blur-[50px] rounded-full" />

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-blue-900 mb-2">400+ Biomarkers</h3>
                            <p className="text-blue-700/80 mb-8">Comprehensive molecular analysis for complete skin understanding.</p>

                            <ul className="space-y-4">
                                {[
                                    { icon: Activity, text: "Proteomics analysis" },
                                    { icon: Dna, text: "Epigenomic profiling" },
                                    { icon: Fingerprint, text: "Metabolomic insights" },
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-neutral-800">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Right: Additional Context */}
                    <div className="space-y-8">
                        <p className="text-lg text-neutral-600 leading-relaxed">
                            Our revolutionary platform reveals over 400 critical biomarkers including proteomics, epigenomics, and metabolomics data,
                            enabling truly precision skincare logic tailored to your individual needs.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100">
                                <div className="text-4xl font-bold text-blue-600 mb-2">99%</div>
                                <div className="text-sm text-neutral-500 font-medium">Precision Accuracy</div>
                            </div>
                            <div className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100">
                                <div className="text-4xl font-bold text-purple-600 mb-2">15+</div>
                                <div className="text-sm text-neutral-500 font-medium">Years Research</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
