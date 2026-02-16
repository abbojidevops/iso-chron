"use client";

import { motion } from "framer-motion";
import { User, Award, Microscope, BrainCircuit } from "lucide-react";

export function Team() {
    return (
        <section className="py-24 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
            <div className="container px-4 mx-auto">
                <div className="max-w-4xl mx-auto mb-16 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                        Meet the Experts Behind the Platform
                    </h2>
                    <p className="text-lg text-neutral-600">
                        Our founding team brings together world-class expertise in fundamental science, artificial intelligence innovation, and healthcare technology.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Marc Bessoles",
                            role: "CEO & Co-founder",
                            desc: "Strategy and health tech visionary with credentials from Mines Paris and HEC Paris, driving business excellence.",
                            icon: Award,
                            borderColor: "border-blue-500"
                        },
                        {
                            name: "Jean-Marc Lemaitre",
                            role: "CSO & Co-founder",
                            desc: "INSERM Research Director specializing in cellular aging, epigenetics, and regenerative biology with decades of breakthrough research.",
                            icon: Microscope,
                            borderColor: "border-cyan-500"
                        },
                        {
                            name: "Paul Ben Sadoun",
                            role: "CTO & Co-founder",
                            desc: "Bioinformatics and multi-omics data expert architecting cutting-edge AI algorithms for molecular analysis.",
                            icon: BrainCircuit,
                            borderColor: "border-pink-500"
                        }
                    ].map((member, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative p-8 bg-white rounded-[2rem] border-t-4 ${member.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 group`}
                        >
                            <div className="absolute top-8 right-8 text-neutral-200 group-hover:text-blue-500 transition-colors">
                                <member.icon className="w-8 h-8" />
                            </div>

                            <div className="mb-8">
                                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                                    <User className="w-10 h-10" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-neutral-900">{member.name}</h3>
                            <div className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-4">{member.role}</div>
                            <p className="text-neutral-600 text-sm leading-relaxed">
                                {member.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
