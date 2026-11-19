
import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, Text } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import * as THREE from "three";
import "./CinematicExperience.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// =====================================
// SMOOTH TRANSITION HELPER
// =====================================

const smoothRange = (value, start, end) => {
    const t = THREE.MathUtils.clamp(
        (value - start) / (end - start),
        0,
        1
    );

    return t * t * (3 - 2 * t);
};

// =====================================
// RESUME DOCUMENT
// =====================================

function ResumeDocument() {
    const resume = useRef();
    const laser = useRef();
    const { pointer } = useThree();

    useFrame((state) => {
        if (!resume.current) return;

        resume.current.rotation.y = THREE.MathUtils.lerp(
            resume.current.rotation.y,
            pointer.x * 0.12 +
                Math.sin(state.clock.elapsedTime * 0.4) * 0.05,
            0.04
        );

        resume.current.rotation.x = THREE.MathUtils.lerp(
            resume.current.rotation.x,
            -pointer.y * 0.08,
            0.04
        );

        if (laser.current) {
            laser.current.position.y =
                1.35 - ((state.clock.elapsedTime * 0.65) % 2.7);
        }
    });

    return (
        <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.25}>
            <group ref={resume}>
                <mesh position={[0, 0, -0.08]}>
                    <boxGeometry args={[2.65, 3.65, 0.08]} />
                    <meshBasicMaterial color="#a30e38" wireframe />
                </mesh>

                <mesh castShadow>
                    <boxGeometry args={[2.45, 3.4, 0.09]} />
                    <meshStandardMaterial
                        color="#f5f0f0"
                        roughness={0.72}
                        metalness={0.04}
                    />
                </mesh>

                <Text
                    position={[-0.91, 1.3, 0.055]}
                    fontSize={0.23}
                    color="#8c102e"
                    anchorX="left"
                >
                    RESUME
                </Text>

                <Text
                    position={[-0.91, 1.02, 0.055]}
                    fontSize={0.085}
                    color="#29232a"
                    anchorX="left"
                >
                    CAREER PROFILE
                </Text>

                <mesh position={[-0.77, 0.58, 0.06]}>
                    <boxGeometry args={[0.32, 0.38, 0.015]} />
                    <meshBasicMaterial color="#b9aeb2" />
                </mesh>

                <Text
                    position={[-0.48, 0.7, 0.06]}
                    fontSize={0.095}
                    color="#262027"
                    anchorX="left"
                >
                    PROFESSIONAL
                </Text>

                <Text
                    position={[-0.48, 0.53, 0.06]}
                    fontSize={0.075}
                    color="#777078"
                    anchorX="left"
                >
                    Software Developer
                </Text>

                {[
                    { y: 0.12, title: "EXPERIENCE" },
                    { y: -0.72, title: "EDUCATION" },
                    { y: -1.28, title: "SKILLS" }
                ].map((section, index) => (
                    <group key={section.title}>
                        <Text
                            position={[-0.92, section.y, 0.06]}
                            fontSize={0.095}
                            color="#8c102e"
                            anchorX="left"
                        >
                            {section.title}
                        </Text>

                        {[0, 1, 2]
                            .slice(0, index === 2 ? 2 : 3)
                            .map((line) => (
                                <mesh
                                    key={line}
                                    position={[
                                        -0.43,
                                        section.y - 0.2 - line * 0.13,
                                        0.06
                                    ]}
                                >
                                    <boxGeometry
                                        args={[
                                            1.35 - line * 0.12,
                                            0.025,
                                            0.01
                                        ]}
                                    />
                                    <meshBasicMaterial color="#aaa1a5" />
                                </mesh>
                            ))}
                    </group>
                ))}

                <mesh ref={laser} position={[0, 1.35, 0.11]}>
                    <boxGeometry args={[2.48, 0.025, 0.025]} />
                    <meshBasicMaterial
                        color="#ff1748"
                        toneMapped={false}
                    />
                </mesh>

                <mesh position={[0, 0, 0.1]}>
                    <planeGeometry args={[2.48, 3.4]} />
                    <meshBasicMaterial
                        color="#ff1748"
                        transparent
                        opacity={0.025}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>
        </Float>
    );
}

// =====================================
// AI SCANNER
// =====================================

function ScannerObject() {
    const scanner = useRef();
    const innerRing = useRef();

    useFrame((state) => {
        if (scanner.current) {
            scanner.current.rotation.y =
                state.clock.elapsedTime * 0.18;

            scanner.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 0.35) * 0.12;
        }

        if (innerRing.current) {
            innerRing.current.rotation.z =
                -state.clock.elapsedTime * 0.35;
        }
    });

    return (
        <group ref={scanner}>
            <mesh>
                <torusGeometry args={[1.25, 0.018, 12, 100]} />
                <meshBasicMaterial color="#ff315d" />
            </mesh>

            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.92, 0.012, 12, 100]} />
                <meshBasicMaterial
                    color="#9d1640"
                    transparent
                    opacity={0.8}
                />
            </mesh>

            <mesh ref={innerRing} rotation={[0.8, 0.3, 0]}>
                <torusGeometry args={[0.62, 0.025, 12, 100]} />
                <meshBasicMaterial color="#ff6685" />
            </mesh>

            <mesh>
                <sphereGeometry args={[0.38, 32, 32]} />
                <meshStandardMaterial
                    color="#5c0b25"
                    emissive="#d10e43"
                    emissiveIntensity={1.8}
                    metalness={0.65}
                    roughness={0.25}
                />
            </mesh>

            <Text
                position={[0, 1.75, 0]}
                fontSize={0.18}
                color="#ff829b"
                anchorX="center"
            >
                AI RESUME SCAN
            </Text>

            {[
                { text: "SKILLS DETECTED", x: -1.75, y: 0.75 },
                { text: "ATS MATCH", x: 1.7, y: 0.55 },
                { text: "EXPERIENCE", x: -1.65, y: -0.8 },
                { text: "KEYWORDS", x: 1.65, y: -0.85 }
            ].map((item) => (
                <group key={item.text} position={[item.x, item.y, 0]}>
                    <mesh>
                        <boxGeometry args={[1.05, 0.25, 0.035]} />
                        <meshBasicMaterial
                            color="#5b1029"
                            transparent
                            opacity={0.85}
                        />
                    </mesh>

                    <Text
                        position={[0, 0, 0.025]}
                        fontSize={0.075}
                        color="#ffdce5"
                        anchorX="center"
                    >
                        {item.text}
                    </Text>
                </group>
            ))}
        </group>
    );
}

// =====================================
// ANALYTICS DASHBOARD
// =====================================

function AnalyticsObject() {
    const dashboard = useRef();

    useFrame((state) => {
        if (dashboard.current) {
            dashboard.current.rotation.y =
                Math.sin(state.clock.elapsedTime * 0.35) * 0.08;

            dashboard.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 0.25) * 0.025;
        }
    });

    return (
        <group ref={dashboard}>
            <mesh>
                <boxGeometry args={[3.25, 2.55, 0.12]} />
                <meshStandardMaterial
                    color="#180912"
                    metalness={0.6}
                    roughness={0.28}
                    transparent
                    opacity={0.94}
                />
            </mesh>

            <mesh position={[0, 0, 0.07]}>
                <planeGeometry args={[3.1, 2.4]} />
                <meshBasicMaterial color="#210b16" />
            </mesh>

            <Text
                position={[-1.35, 1.02, 0.09]}
                fontSize={0.14}
                color="#ffdce5"
                anchorX="left"
            >
                RESUME ANALYTICS
            </Text>

            <mesh position={[-0.8, 0.25, 0.12]}>
                <torusGeometry args={[0.43, 0.055, 16, 80]} />
                <meshBasicMaterial color="#a21a43" />
            </mesh>

            <mesh
                position={[-0.8, 0.25, 0.13]}
                rotation={[0, 0, Math.PI * 0.35]}
            >
                <torusGeometry
                    args={[0.43, 0.055, 16, 80, Math.PI * 1.45]}
                />
                <meshBasicMaterial color="#ff426c" />
            </mesh>

            <Text
                position={[-0.8, 0.25, 0.2]}
                fontSize={0.27}
                color="#ffffff"
                anchorX="center"
            >
                86%
            </Text>

            <Text
                position={[-0.8, -0.28, 0.12]}
                fontSize={0.085}
                color="#e6a9ba"
                anchorX="center"
            >
                ATS SCORE
            </Text>

            <Text
                position={[0.05, 0.65, 0.13]}
                fontSize={0.105}
                color="#ffdce5"
                anchorX="left"
            >
                SKILL MATCH
            </Text>

            {[
                { y: 0.35, width: 1.15, label: "Python" },
                { y: 0.02, width: 0.9, label: "React" },
                { y: -0.31, width: 0.72, label: "SQL" }
            ].map((item) => (
                <group key={item.label}>
                    <Text
                        position={[0.05, item.y + 0.09, 0.14]}
                        fontSize={0.07}
                        color="#d8bac5"
                        anchorX="left"
                    >
                        {item.label}
                    </Text>

                    <mesh position={[0.55, item.y - 0.05, 0.14]}>
                        <boxGeometry args={[1.12, 0.055, 0.02]} />
                        <meshBasicMaterial color="#4b2634" />
                    </mesh>

                    <mesh
                        position={[
                            0.55 - (1.12 - item.width) / 2,
                            item.y - 0.05,
                            0.16
                        ]}
                    >
                        <boxGeometry args={[item.width, 0.055, 0.025]} />
                        <meshBasicMaterial color="#ff426c" />
                    </mesh>
                </group>
            ))}

            <Text
                position={[-1.32, -0.95, 0.13]}
                fontSize={0.075}
                color="#ff829b"
                anchorX="left"
            >
                MATCHED SKILLS  •  MISSING SKILLS  •  INSIGHTS
            </Text>
        </group>
    );
}

// =====================================
// INTELLIGENCE CORE
// =====================================

function IntelligenceCore() {
    const core = useRef();
    const ringOne = useRef();
    const ringTwo = useRef();

    useFrame((state) => {
        if (core.current) {
            core.current.rotation.y = state.clock.elapsedTime * 0.25;

            core.current.rotation.x =
                Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
        }

        if (ringOne.current) {
            ringOne.current.rotation.x =
                state.clock.elapsedTime * 0.3;

            ringOne.current.rotation.y =
                state.clock.elapsedTime * 0.2;
        }

        if (ringTwo.current) {
            ringTwo.current.rotation.y =
                -state.clock.elapsedTime * 0.35;

            ringTwo.current.rotation.x = 1.1;
        }
    });

    return (
        <group>
            <group ref={core}>
                <mesh>
                    <icosahedronGeometry args={[0.72, 3]} />
                    <meshStandardMaterial
                        color="#9e123c"
                        emissive="#e4144b"
                        emissiveIntensity={1.5}
                        metalness={0.8}
                        roughness={0.2}
                        wireframe
                    />
                </mesh>

                <mesh>
                    <sphereGeometry args={[0.42, 32, 32]} />
                    <meshStandardMaterial
                        color="#f52d60"
                        emissive="#ff1748"
                        emissiveIntensity={2.5}
                        metalness={0.5}
                        roughness={0.18}
                    />
                </mesh>
            </group>

            <mesh ref={ringOne}>
                <torusGeometry args={[1.12, 0.018, 12, 100]} />
                <meshBasicMaterial color="#ff426c" />
            </mesh>

            <mesh ref={ringTwo}>
                <torusGeometry args={[1.42, 0.012, 12, 100]} />
                <meshBasicMaterial
                    color="#a90e3d"
                    transparent
                    opacity={0.8}
                />
            </mesh>

            <Text
                position={[0, -1.9, 0]}
                fontSize={0.16}
                color="#ff829b"
                anchorX="center"
            >
                INTELLIGENCE FOR YOUR CAREER
            </Text>
        </group>
    );
}

// =====================================
// PARTICLE FIELD
// =====================================

function ParticleField() {
    const particles = useRef();

    const positions = React.useMemo(() => {
        const values = new Float32Array(450 * 3);

        for (let i = 0; i < 450; i++) {
            values[i * 3] = (Math.random() - 0.5) * 13;
            values[i * 3 + 1] = (Math.random() - 0.5) * 10;
            values[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }

        return values;
    }, []);

    useFrame((state, delta) => {
        if (particles.current) {
            particles.current.rotation.y += delta * 0.012;
            particles.current.rotation.x += delta * 0.004;
        }
    });

    return (
        <points ref={particles}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>

            <pointsMaterial
                color="#ff355d"
                size={0.025}
                transparent
                opacity={0.7}
                sizeAttenuation
            />
        </points>
    );
}

// =====================================
// SCROLL-DRIVEN 3D OBJECT TRANSITIONS
// =====================================

function SceneObjects({ progress }) {
    const resume = useRef();
    const scanner = useRef();
    const analytics = useRef();
    const intelligence = useRef();

    useFrame(() => {
        const p = THREE.MathUtils.clamp(progress.current, 0, 1);

        const resumeOut = smoothRange(p, 0.20, 0.36);

        const scannerIn = smoothRange(p, 0.25, 0.42);
        const scannerOut = smoothRange(p, 0.58, 0.75);

        const finalIn = smoothRange(p, 0.65, 0.82);

        const resumeVisibility = 1 - resumeOut;
        const scannerVisibility = scannerIn * (1 - scannerOut);
        const finalVisibility = finalIn;

        const updateObject = (
            ref,
            visibility,
            x,
            y,
            z,
            moveX = 0
        ) => {
            if (!ref.current) return;

            ref.current.visible = visibility > 0.001;

            ref.current.scale.setScalar(
                Math.max(0.0001, visibility)
            );

            ref.current.position.set(
                x + moveX,
                y,
                z
            );
        };

        // Resume moves out
        updateObject(
            resume,
            resumeVisibility,
            1.5,
            0,
            0,
            resumeOut * 3
        );

        // Scanner moves in
        updateObject(
            scanner,
            scannerVisibility,
            1.5,
            0,
            0,
            (1 - scannerIn) * 3 - scannerOut * 3
        );

        // Analytics dashboard moves in
        updateObject(
            analytics,
            finalVisibility,
            0.4,
            0,
            0,
            (1 - finalIn) * 3
        );

        // Intelligence core moves in
        updateObject(
            intelligence,
            finalVisibility,
            2.5,
            0,
            -0.5,
            (1 - finalIn) * 3
        );
    });

    return (
        <>
            <group ref={resume}>
                <ResumeDocument />
            </group>

            <group ref={scanner}>
                <Float speed={1.2} floatIntensity={0.2}>
                    <ScannerObject />
                </Float>
            </group>

            <group ref={analytics}>
                <Float speed={1} floatIntensity={0.15}>
                    <AnalyticsObject />
                </Float>
            </group>

            <group ref={intelligence}>
                <Float speed={1.4} floatIntensity={0.25}>
                    <IntelligenceCore />
                </Float>
            </group>
        </>
    );
}

// =====================================
// MAIN 3D SCENE
// =====================================

function CinematicScene({ progress }) {
    return (
        <>
            <color attach="background" args={["#080508"]} />
            <fog attach="fog" args={["#080508", 10, 22]} />

            <ambientLight intensity={1.1} />

            <pointLight
                position={[4, 3, 5]}
                intensity={55}
                color="#ff1748"
            />

            <pointLight
                position={[-4, -2, 3]}
                intensity={35}
                color="#79001e"
            />

            <spotLight
                position={[0, 5, 5]}
                angle={0.5}
                intensity={35}
                color="#ffffff"
            />

            <SceneObjects progress={progress} />
            <ParticleField />

            <Stars
                radius={90}
                depth={50}
                count={1200}
                factor={3}
                fade
                speed={0.3}
            />
        </>
    );
}

// =====================================
// MAIN CINEMATIC EXPERIENCE
// =====================================

export default function CinematicExperience() {
    const container = useRef();
    const progress = useRef(0);

    const heroText = useRef();
    const secondText = useRef();
    const thirdText = useRef();

    useGSAP(() => {
        gsap.set(heroText.current, {
            opacity: 1,
            y: 0
        });

        gsap.set(secondText.current, {
            opacity: 0,
            y: 75
        });

        gsap.set(thirdText.current, {
            opacity: 0,
            y: 75
        });

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: "top top",
                end: () => "+=" + window.innerHeight * 2,
                scrub: 1,
                invalidateOnRefresh: true,

                onRefresh: (self) => {
                    progress.current = self.progress;
                }
            }
        });

        timeline.to(
            heroText.current,
            {
                opacity: 0,
                y: -65,
                duration: 0.35,
                ease: "power2.inOut"
            },
            0.82
        );

        timeline.to(
            secondText.current,
            {
                opacity: 1,
                y: 0,
                duration: 0.35,
                ease: "power2.inOut"
            },
            0.97
        );

        timeline.to(
            secondText.current,
            {
                opacity: 0,
                y: -65,
                duration: 0.35,
                ease: "power2.inOut"
            },
            1.82
        );

        timeline.to(
            thirdText.current,
            {
                opacity: 1,
                y: 0,
                duration: 0.35,
                ease: "power2.inOut"
            },
            1.97
        );

        timeline.to(
            {},
            {
                duration: 0.68
            },
            2.32
        );

        // Keep 3D movement synchronized with text scroll
        timeline.eventCallback("onUpdate", () => {
            progress.current = timeline.progress();
        });

        progress.current = timeline.progress();

        ScrollTrigger.refresh();

        return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
        };

    }, { scope: container });

    return (
        <div className="cinematic-container" ref={container}>

            {/* 3D CANVAS */}

            <div className="cinematic-canvas">
                <Canvas
                    camera={{
                        position: [0, 0, 7],
                        fov: 42
                    }}
                    dpr={[1, 1.5]}
                    gl={{
                        antialias: true,
                        alpha: true
                    }}
                >
                    <CinematicScene progress={progress} />
                </Canvas>
            </div>

            {/* BACKGROUND */}

            <div className="cinematic-experience-background">
                <div className="cinematic-red-glow" />
                <div className="cinematic-red-glow cinematic-red-glow-two" />
            </div>

            {/* FIRST SECTION */}

            <section className="cinematic-section">
                <div
                    className="cinematic-content"
                    ref={heroText}
                >
                    <p className="cinematic-label">
                        <span />
                        THE FUTURE OF CAREER INTELLIGENCE
                    </p>

                    <h1>
                        YOUR CAREER.
                        <br />
                        <span>REIMAGINED.</span>
                    </h1>

                    <p className="cinematic-description">
                        Your experience deserves more than a simple resume.
                        Discover the power of intelligent career analysis.
                    </p>

                    <a
                        href="#resume-workspace"
                        className="cinematic-cta"
                    >
                        EXPLORE THE EXPERIENCE
                        <span>↗</span>
                    </a>

                    <div className="scroll-indicator">
                        <span>SCROLL TO EXPLORE</span>
                        <div />
                    </div>
                </div>
            </section>

            {/* SECOND SECTION */}

            <section className="cinematic-section">
                <div
                    className="cinematic-content cinematic-hidden"
                    ref={secondText}
                >
                    <p className="cinematic-label">
                        <span />
                        INTELLIGENCE IN EVERY DETAIL
                    </p>

                    <h2>
                        YOUR RESUME.
                        <br />
                        <span>UNDER THE LENS.</span>
                    </h2>

                    <p className="cinematic-description">
                        Every skill. Every achievement. Every opportunity.
                        Our analyzer examines your resume and reveals
                        where you can improve.
                    </p>
                </div>
            </section>

            {/* THIRD SECTION */}

            <section className="cinematic-section">
                <div
                    className="cinematic-content cinematic-hidden"
                    ref={thirdText}
                >
                    <p className="cinematic-label">
                        <span />
                        TURN POTENTIAL INTO PROGRESS
                    </p>

                    <h2>
                        STAND OUT.
                        <br />
                        <span>GET HIRED.</span>
                    </h2>

                    <p className="cinematic-description">
                        Understand your ATS score, discover skill gaps,
                        explore your strengths and take the next step
                        in your career.
                    </p>

                    <a
                        href="#resume-workspace"
                        className="cinematic-cta"
                    >
                        START YOUR ANALYSIS
                        <span>↗</span>
                    </a>
                </div>
            </section>

        </div>
    );
}
