"use client";

import { Canvas } from '@react-three/fiber';
import { PresentationControls, Stage, MeshTransmissionMaterial, Float } from '@react-three/drei';

function BottleModel() {
    return (
        <mesh rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 2.5, 32]} />
            <MeshTransmissionMaterial
                thickness={0.2}
                anisotropy={1}
                chromaticAberration={0.04}
                distortion={0.2}
                distortionScale={0.3}
                temporalDistortion={0.1}
                color={"#a8d5ff"}
            />
        </mesh>
    );
}

function CapModel() {
    return (
        <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.5, 32]} />
            <meshStandardMaterial color={"#1a1a1a"} metalness={0.8} roughness={0.2} />
        </mesh>
    )
}

export default function SerumBottle() {
    return (
        <div className="h-[500px] w-full cursor-grab active:cursor-grabbing">
            <Canvas dpr={[1, 2]} camera={{ fov: 45, position: [0, 0, 5] }}>
                <PresentationControls speed={1.5} global zoom={0.8} polar={[-0.1, Math.PI / 4]}>
                    <Stage environment="city" intensity={0.5}>
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                            <group>
                                <BottleModel />
                                <CapModel />
                            </group>
                        </Float>
                    </Stage>
                </PresentationControls>
            </Canvas>
        </div>
    );
}
