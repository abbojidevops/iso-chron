"use client";

import { motion } from "framer-motion";
import { Building2, Syringe, Cpu } from "lucide-react";

export function Features() {
    return (
        <section className="py-24 bg-[#E879F9]/10 relative overflow-hidden">
            {/* Pink Background matching Image 3 */}

            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-pink-500/10 pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="max-w-4xl mx-auto mb-16 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                        Revolutionary Technology Backed by 15+ Years of Research
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Building2,
                            title: "Clinical Validation",
                            desc: "Developed from extensive INSERM and Montpellier University Hospital clinical studies with thousands of participants.",
                            color: "bg-blue-100 text-blue-600"
                        },
                        {
                            icon: Syringe,
                            title: "Non-Invasive Sampling",
                            desc: "Painless skin sampling via proprietary tape stripping technology – no biopsies, needles, or discomfort needed.",
                            color: "bg-pink-100 text-pink-600"
                        },
                        {
                            icon: Cpu,
                            title: "Patented AI Analysis",
                            desc: "Advanced algorithms analyze biological age, inflammation markers, UV damage indicators, and more with clinical-grade accuracy.",
                            color: "bg-purple-100 text-purple-600"
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/60 backdrop-blur-md border border-white/40 p-8 rounded-[2rem] hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <item.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 mb-4">{item.title}</h3>
                            <p className="text-neutral-600 leading-relaxed text-sm">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
