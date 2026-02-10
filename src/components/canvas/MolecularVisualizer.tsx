"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, extend, ReactThreeFiber } from "@react-three/fiber";
import {
    Text,
    Float,
    OrbitControls,
    ContactShadows,
    shaderMaterial,
    MeshTransmissionMaterial,
    Environment
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { Ingredient } from "@/lib/ingredients";
import { ConflictResult } from "@/lib/conflict-engine";

// --- Custom Shader Material (Inner Core) ---

const AuraShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color(0.2, 0.5, 1.0),
        uIntensity: 1.0,
        uDeform: 0.0 // 0 = Safe, 1 = Hazardous
    },
    // Vertex Shader
    `
    uniform float uTime;
    uniform float uDeform;
    varying vec2 vUv;
    varying float vDisplacement;

    // Simplex 3D Noise function (simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute( 
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
        vUv = uv;
        
        // Turbulence logic
        float noise = snoise(position * 2.0 + uTime * (1.0 + uDeform * 5.0));
        
        // Deform vertices based on noise and uDeform intensity
        // More subtle when inside glass
        vec3 newPosition = position + normal * noise * (0.1 + uDeform * 0.3);
        
        vDisplacement = noise;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
    `,
    // Fragment Shader
    `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uDeform;
    varying vec2 vUv;
    varying float vDisplacement;

    void main() {
        // Organic pulse
        float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
        
        // Enhance color at peaks of displacement
        vec3 color = uColor * pulse;
        color += vec3(vDisplacement * 0.5); // Add highlights
        
        // Add "Hazard" glitch veins
        if (uDeform > 0.5) {
            float vein = step(0.8, sin(vUv.y * 50.0 + uTime * 10.0));
            color += vec3(1.0, 0.0, 0.0) * vein * 0.5;
        }

        gl_FragColor = vec4(color * uIntensity, 1.0);
    }
    `
);

// Register shader for R3F
extend({ AuraShaderMaterial });

declare module '@react-three/fiber' {
    interface ThreeElements {
        auraShaderMaterial: any;
    }
}

function HybridCore({ status }: { status: string }) {
    const mesh = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const targetColor = useMemo(() => {
        if (status === 'Hazardous') return new THREE.Color('#ff0000');
        if (status === 'Caution') return new THREE.Color('#f59e0b');
        return new THREE.Color('#3b82f6');
    }, [status]);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

            const targetDeform = status === 'Hazardous' ? 1.0 : 0.0;
            materialRef.current.uniforms.uDeform.value = THREE.MathUtils.lerp(
                materialRef.current.uniforms.uDeform.value,
                targetDeform,
                0.05
            );

            materialRef.current.uniforms.uColor.value.lerp(targetColor, 0.05);
            materialRef.current.uniforms.uIntensity.value = status === 'Hazardous' ? 2.5 : 1.5;
        }
    });

    return (
        <group>
            {/* INNER: Pulsing Shader Core */}
            <mesh ref={mesh} scale={0.8}>
                <icosahedronGeometry args={[1.2, 50]} />
                <auraShaderMaterial
                    ref={materialRef}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* OUTER: Glass Shell */}
            <mesh scale={1.0}>
                <sphereGeometry args={[1.3, 64, 64]} />
                <MeshTransmissionMaterial
                    backside={false}
                    thickness={0.2}
                    roughness={0.1}
                    transmission={0.99}
                    ior={1.5}
                    chromaticAberration={0.1}
                    anisotropy={0.1}
                    distortion={0.2}
                    distortionScale={0.3}
                    temporalDistortion={0.1}
                    background={new THREE.Color('#000000')}
                />
            </mesh>
        </group>
    );
}

function SatelliteMolecule({
    position,
    color,
    label
}: {
    position: THREE.Vector3;
    color: string;
    label: string
}) {
    return (
        <Float speed={4} rotationIntensity={2} floatIntensity={1}>
            <group position={position}>
                <mesh>
                    <sphereGeometry args={[0.3, 32, 32]} />
                    {/* Upgrade to Glassy look for ingredients */}
                    <MeshTransmissionMaterial
                        color={color}
                        thickness={2}
                        roughness={0.2}
                        transmission={0.6}
                        ior={1.2}
                    />
                </mesh>
                {/* Inner solid core for readability/color pop */}
                <mesh scale={0.5}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color={color} />
                </mesh>

                <Text
                    position={[0, 0.5, 0]}
                    fontSize={0.15}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            </group>
        </Float>
    );
}

function LaserScan({ active }: { active: boolean }) {
    const group = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (group.current && active) {
            // Sweep up and down
            const t = state.clock.elapsedTime;
            group.current.position.y = Math.sin(t * 2) * 3;
            group.current.rotation.z += delta * 0.5;
        }
    });

    if (!active) return null;

    return (
        <group ref={group}>
            {/* Scanning Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.8, 2.85, 64]} />
                <meshBasicMaterial color="#00ffcc" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
            {/* Scanning Plane */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[6, 6]} />
                <meshBasicMaterial
                    color="#00ffcc"
                    transparent
                    opacity={0.05}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
}

export function MolecularVisualizer({
    ingredients,
    conflicts,
    status
}: {
    ingredients: Ingredient[];
    conflicts: ConflictResult[];
    status: string;
}) {
    const [isScanning, setIsScanning] = useState(false);

    // Trigger scan on ingredient change
    useEffect(() => {
        if (ingredients.length > 0) {
            setIsScanning(true);
            const timer = setTimeout(() => setIsScanning(false), 2000); // 2s Scan
            return () => clearTimeout(timer);
        }
    }, [ingredients.length]);

    const satellites = useMemo(() => {
        return ingredients.map((ing, i) => {
            const angle = (i / ingredients.length) * Math.PI * 2;
            const radius = 3;

            // Color mapping for new categories
            const getCategoryColor = (category: string) => {
                switch (category) {
                    case 'Retinoid':
                    case 'Exfoliant':
                        return '#ec4899'; // Pink for actives/acids
                    case 'Antioxidant':
                    case 'Brightener':
                        return '#3b82f6'; // Blue for antioxidants
                    case 'Peptide':
                        return '#a855f7'; // Purple for peptides
                    case 'Barrier':
                    case 'Hydrator':
                        return '#10b981'; // Green for support
                    default:
                        return '#6b7280'; // Gray for others
                }
            };

            return {
                ...ing,
                position: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius * 0.3,
                    Math.sin(angle) * radius
                ),
                color: getCategoryColor(ing.category)
            };
        });
    }, [ingredients]);

    return (
        <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-black/60 relative border border-white/10">
            <Canvas camera={{ position: [0, 0, 7], fov: 40 }} shadows>
                <color attach="background" args={['#020205']} />

                {/* Studio Environment */}
                <Environment preset="city" blur={1} />
                <ambientLight intensity={0.2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

                {/* Hybrid Core: Shader + Glass */}
                <HybridCore status={status} />

                {/* Satellites */}
                {satellites.map((sat) => (
                    <SatelliteMolecule
                        key={sat.id}
                        position={sat.position}
                        color={sat.color}
                        label={sat.name}
                    />
                ))}

                {/* VFX */}
                <LaserScan active={isScanning} />

                <ContactShadows
                    position={[0, -2, 0]}
                    opacity={0.5}
                    scale={10}
                    blur={2.5}
                    far={4}
                    color={status === 'Hazardous' ? 'red' : 'blue'}
                />

                <OrbitControls enableZoom={false} enablePan={false} />

                <EffectComposer>
                    <Bloom
                        luminanceThreshold={0.2}
                        mipmapBlur
                        intensity={status === 'Hazardous' ? 3.0 : 1.0}
                        radius={0.5}
                    />
                </EffectComposer>
            </Canvas>

            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 font-mono text-xs text-white/50 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'Hazardous' ? 'bg-red-500 animate-ping' : 'bg-blue-500'}`} />
                    VISUAL CORE: HYBRID
                </div>
                {isScanning && <div className="text-cyan-400 font-bold mt-1 animate-pulse">ANALYZING COMPOUND...</div>}
                {status === 'Hazardous' && <div className="text-red-500 font-bold mt-1">CRITICAL INSTABILITY</div>}
            </div>
        </div>
    );
}
