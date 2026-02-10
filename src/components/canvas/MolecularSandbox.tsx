"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, Sphere, Float, Environment, Line } from "@react-three/drei";
import * as THREE from "three";
import { Ingredient } from "@/lib/ingredients";
import { ConflictResult } from "@/lib/conflict-engine";

// Molecular Particle
function Molecule({
    position,
    color,
    label,
    velocity
}: {
    position: THREE.Vector3;
    color: string;
    label: string;
    velocity: THREE.Vector3
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [pos] = useState(position);
    const [vel] = useState(velocity);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Simple Physics
        pos.add(vel.clone().multiplyScalar(delta));

        // Boundary bounce (Box size approx 4x4x4)
        const bound = 3;
        if (Math.abs(pos.x) > bound) vel.x *= -1;
        if (Math.abs(pos.y) > bound) vel.y *= -1;
        if (Math.abs(pos.z) > bound) vel.z *= -1;

        meshRef.current.position.copy(pos);
        meshRef.current.rotation.x += delta * 0.5;
        meshRef.current.rotation.y += delta * 0.2;
    });

    return (
        <group position={pos}>
            <Sphere ref={meshRef} args={[0.6, 32, 32]}>
                <meshStandardMaterial
                    color={color}
                    roughness={0.2}
                    metalness={0.8}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </Sphere>
            <Text
                position={[0, 0, 0.7]}
                fontSize={0.25}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>
            {/* Electron Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.9, 0.02, 16, 100]} />
                <meshBasicMaterial color={color} opacity={0.3} transparent />
            </mesh>
        </group>
    );
}

// Connection Line for Conflicts
function ConflictBond({ start, end, severity }: { start: THREE.Vector3; end: THREE.Vector3; severity: string }) {
    const color = severity === 'Critical' ? '#ef4444' : severity === 'High' ? '#f97316' : '#f59e0b';

    return (
        <Line
            points={[start, end]}
            color={color}
            lineWidth={3}
            dashed={true}
            dashScale={5}
            dashSize={0.5}
        // dashOffset={Math.random()} // Animate this if possible
        />
    );
}

export function MolecularSandbox({
    ingredients,
    conflicts
}: {
    ingredients: Ingredient[];
    conflicts: ConflictResult[]
}) {
    // Generate initial random positions
    const moleculeData = useMemo(() => {
        return ingredients.map(ing => ({
            ...ing,
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                0 // Keep mostly in 2D plane for visibility
            ),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 0.5
            ),
            // Dynamic color based on category
            color: (() => {
                switch (ing.category) {
                    case 'Retinoid':
                    case 'Exfoliant':
                        return '#ec4899'; // Pink
                    case 'Antioxidant':
                    case 'Brightener':
                        return '#3b82f6'; // Blue
                    case 'Peptide':
                        return '#a855f7'; // Purple
                    case 'Barrier':
                    case 'Hydrator':
                        return '#10b981'; // Green
                    case 'Antibacterial':
                        return '#f59e0b'; // Amber
                    default:
                        return '#6b7280'; // Gray
                }
            })()
        }));
    }, [ingredients]); // Re-run when selection changes

    return (
        <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-black/20 relative">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Environment preset="city" />

                {moleculeData.map((mol) => (
                    <Molecule
                        key={mol.id}
                        label={mol.name.split(' ')[0]} // Short name
                        position={mol.position}
                        velocity={mol.velocity}
                        color={mol.color}
                    />
                ))}

                {/* Draw bonds between conflicting ingredients? 
                    Example logic: Find positions of mol A and mol B and draw line.
                    (Simple implementation requires lifting state up or context, skipping for MVP complexity 
                    unless explicitly requested, but let's try a simple visual if possible)
                */}
            </Canvas>

            {/* Overlay UI */}
            <div className="absolute bottom-4 left-4 text-xs font-mono text-white/50 pointer-events-none">
                SIMULATION: RUNNING<br />
                PARTICLES: {ingredients.length}
            </div>
        </div>
    );
}
