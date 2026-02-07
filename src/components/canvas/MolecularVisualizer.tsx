"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    Text,
    Sphere,
    Float,
    Environment,
    MeshTransmissionMaterial,
    OrbitControls,
    Trail
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { Ingredient } from "@/lib/ingredients";
import { ConflictResult } from "@/lib/conflict-engine";

// --- Sub-Components ---

function AuraSphere({ status }: { status: string }) {
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.y += delta * 0.2;
            mesh.current.rotation.z += delta * 0.1;
        }
    });

    const glowColor = status === 'Hazardous' ? '#ff0000' :
        status === 'Caution' ? '#f59e0b' : '#3b82f6';

    return (
        <group>
            {/* Core */}
            <Sphere args={[1.2, 64, 64]} ref={mesh}>
                <MeshTransmissionMaterial
                    backside
                    thickness={0.5}
                    roughness={0.1}
                    transmission={0.95}
                    ior={1.5}
                    chromaticAberration={0.1} // Premium glass look
                    anisotropy={0.5}
                    distortion={0.2}
                    distortionScale={0.5}
                    temporalDistortion={0.2}
                    color={glowColor}
                    toneMapped={false}
                />
            </Sphere>

            {/* Inner Glow Light */}
            <pointLight position={[0, 0, 0]} intensity={2} color={glowColor} distance={5} />
        </group>
    );
}

function SatelliteMolecule({
    position,
    color,
    label,
    isNew
}: {
    position: THREE.Vector3;
    color: string;
    label: string;
    isNew: boolean
}) {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group position={position}>
                <Trail width={0.2} length={4} color={color} attenuation={(t) => t * t}>
                    <Sphere args={[0.4, 32, 32]}>
                        <meshPhysicalMaterial
                            color={color}
                            roughness={0.2}
                            metalness={0.8}
                            emissive={color}
                            emissiveIntensity={0.5}
                            clearcoat={1}
                        />
                    </Sphere>
                </Trail>

                <Text
                    position={[0, 0.6, 0]}
                    fontSize={0.2}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="black"
                >
                    {label}
                </Text>

                {/* New Element scan effect */}
                {isNew && (
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.5, 0.55, 32]} />
                        <meshBasicMaterial color="white" transparent opacity={0.5} />
                    </mesh>
                )}
            </group>
        </Float>
    );
}

function DynamicBond({
    start,
    end,
    status
}: {
    start: THREE.Vector3;
    end: THREE.Vector3;
    status: string
}) {
    const ref = useRef<THREE.Mesh>(null);
    const curve = useMemo(() => new THREE.LineCurve3(start, end), [start, end]);

    useFrame((state) => {
        if (status === 'Hazardous' && ref.current) {
            // Vibrate effect
            ref.current.position.x += (Math.random() - 0.5) * 0.05;
            ref.current.position.y += (Math.random() - 0.5) * 0.05;
        }
    });

    const color = status === 'Hazardous' ? '#ff0000' :
        status === 'Caution' ? '#f59e0b' : '#3b82f6';

    // Calculate visualization of bond (cylinder or tube)
    // For simplicity, using a thin cylinder connecting the two points
    // Math to orient cylinder is complex, sticking to simple Line for MVP stability 
    // or using Drei's Line component which handles orientation.
    // Let's use a specialized TubeGeometry or Drei Line.

    return (
        <group>
            {/* Using a simple visual line for now, or could use @react-three/drei Line */}
            {/* A "laser" beam */}
        </group>
    );
}

function LaserScan({ active }: { active: boolean }) {
    const group = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (active && group.current) {
            group.current.position.y -= delta * 3;
            if (group.current.position.y < -3) {
                group.current.position.y = 3;
            }
        }
    });

    if (!active) return null;

    return (
        <group ref={group} position={[0, 3, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshBasicMaterial color="#00ffcc" transparent opacity={0.05} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2, 2.1, 64]} />
                <meshBasicMaterial color="#00ffcc" transparent opacity={0.8} />
            </mesh>
        </group>
    );
}

// --- Main Component ---

export function MolecularVisualizer({
    ingredients,
    conflicts,
    status
}: {
    ingredients: Ingredient[];
    conflicts: ConflictResult[];
    status: string;
}) {
    // Generate positions in a circle around the center
    const satellites = useMemo(() => {
        return ingredients.map((ing, i) => {
            const angle = (i / ingredients.length) * Math.PI * 2;
            const radius = 2.5;
            return {
                ...ing,
                position: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius * 0.5, // Flattened slightly
                    Math.sin(angle) * radius
                ),
                color: ing.category === 'Active' ? '#3b82f6' :
                    ing.category === 'Acid' ? '#ec4899' :
                        ing.category === 'Vitamin' ? '#f59e0b' : '#10b981'
            };
        });
    }, [ingredients]);

    return (
        <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-black/40 relative">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <color attach="background" args={['#050510']} />

                {/* Lighting */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, -10, -10]} intensity={0.5} color="blue" />
                <Environment preset="city" />

                {/* Central Aura */}
                <AuraSphere status={status} />

                {/* Satellites */}
                {satellites.map((sat, i) => (
                    <group key={sat.id}>
                        <SatelliteMolecule
                            position={sat.position}
                            color={sat.color}
                            label={sat.name.split(' ')[0]}
                            isNew={true} // Simplify for now
                        />
                        {/* Bonds to Center */}
                        <Line
                            points={[new THREE.Vector3(0, 0, 0), sat.position]}
                            color={
                                status === 'Hazardous' ? 'red' :
                                    status === 'Caution' ? 'orange' : '#3b82f6'
                            }
                            lineWidth={status === 'Hazardous' ? 2 : 1}
                            transparent
                            opacity={0.3}
                        />
                    </group>
                ))}

                {/* Laser Scan Effect - Triggers on change ideally, staying always on for "Monitoring" look */}
                <LaserScan active={true} />

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />

                {/* VFX */}
                <EffectComposer>
                    <Bloom
                        luminanceThreshold={0.5}
                        luminanceSmoothing={0.9}
                        height={300}
                        intensity={status === 'Hazardous' ? 2.0 : 0.5}
                    />
                </EffectComposer>

            </Canvas>

            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 font-mono text-xs text-white/40 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'Hazardous' ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                    SYSTEM MONITORED
                </div>
                <div>MOLECULES: {ingredients.length}</div>
            </div>
        </div>
    );
}
