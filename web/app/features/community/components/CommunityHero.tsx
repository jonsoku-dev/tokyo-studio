import {
	ContactShadows,
	Environment,
	Float,
	PerspectiveCamera,
	Sparkles,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Group } from "three";

function ConnectedShapes() {
	const groupRef = useRef<Group>(null);
	
	// Brand colors: Primary (Blue), Secondary (Indigo), Accent (Teal)
	const colors = useMemo(() => ["#2563eb", "#7c3aed", "#0d9488"], []);
	
	useFrame((state) => {
		if (groupRef.current) {
			// Slow, smooth rotation
			groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
			groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
		}
	});

	return (
		<group ref={groupRef} position={[2, 0, 0]} rotation={[0, -0.5, 0]}>
			{/* Main central shapes */}
			<Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
				<mesh position={[0, 0, 0]}>
					<icosahedronGeometry args={[1.2, 0]} />
					<meshPhysicalMaterial
						color="#2563eb" // Primary Blue
						roughness={0.2}
						metalness={0.8}
						clearcoat={1}
						clearcoatRoughness={0.1}
						transmission={0.2}
						opacity={0.8}
						transparent
					/>
				</mesh>
			</Float>
            
			<Float speed={2.5} rotationIntensity={0.5} floatIntensity={0.4}>
				<mesh position={[-1.8, 1.2, -1]} scale={0.6}>
					<octahedronGeometry args={[1, 0]} />
					<meshStandardMaterial
						color="#7c3aed" // Sidebar Indigo
						roughness={0.1}
						metalness={0.6}
						emissive="#7c3aed"
						emissiveIntensity={0.5}
					/>
				</mesh>
			</Float>

			<Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.6}>
				<mesh position={[1.5, -1, 0.5]} scale={0.5}>
					<torusKnotGeometry args={[0.8, 0.3, 100, 16]} />
					<meshStandardMaterial
						color="#0d9488" // Accent Teal
						roughness={0.2}
						metalness={1}
					/>
				</mesh>
			</Float>

			{/* Connecting lines or particles effect implies network/community */}
			<Sparkles
				count={40}
				scale={8}
				size={4}
				speed={0.4}
				opacity={0.6}
				color="#60a5fa"
			/>
		</group>
	);
}

function CommunityScene() {
	return (
		<Canvas>
			<PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
			<ambientLight intensity={0.6} />
			<spotLight
				position={[10, 10, 10]}
				angle={0.15}
				penumbra={1}
				intensity={1.5}
				castShadow
			/>
			<pointLight position={[-10, -10, -10]} intensity={1} color="#4f46e5" />
			
			<Environment preset="city" />
			
			<ConnectedShapes />
			
			<ContactShadows
				resolution={512}
				scale={20}
				blur={2}
				opacity={0.25}
				far={10}
				color="#000000"
			/>
		</Canvas>
	);
}

export function CommunityHero() {
	return (
		<div className="relative mb-12 flex min-h-[400px] items-center overflow-hidden rounded-3xl bg-gray-900 shadow-2xl">
			{/* Static Background Gradient - Brand Aligned */}
			<div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950" />

			{/* Animated Grid Background (CSS Pattern) - Subtle Tech Feel */}
			<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
			<div
				className="absolute inset-0"
				style={{
					backgroundImage:
						"linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
					backgroundSize: "60px 60px",
					maskImage:
						"linear-gradient(to right, black 20%, transparent 100%)",
				}}
			/>

			{/* 3D Scene Overlay - Full Coverage */}
			<div className="absolute inset-0 z-0">
				<CommunityScene />
			</div>

			{/* Content - Positioned with z-index to sit on top of 3D, but 3D is visible on the right */}
			<div className="relative z-10 w-full max-w-7xl px-8 py-20 lg:px-12 lg:py-24 pointer-events-none">
				<div className="max-w-2xl pointer-events-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					>
						<span className="mb-4 inline-block rounded-full border border-primary-400/30 bg-primary-500/10 px-4 py-1.5 font-medium text-primary-200 text-sm backdrop-blur-md">
							Japan IT Job Community
						</span>
						<h1 className="mb-6 font-bold text-4xl text-white leading-tight tracking-tight lg:text-5xl drop-shadow-lg">
							함께 성장하는 <br />
							<span className="bg-gradient-to-r from-primary-300 via-secondary-300 to-accent-300 bg-clip-text text-transparent">
								IT 전문가 커뮤니티
							</span>
						</h1>
						<p className="mb-8 text-balance text-gray-300 text-lg leading-relaxed drop-shadow-md">
							일본 취업부터 현지 생활, 커리어 성장까지.{" "}
							<br className="hidden sm:block" />
							같은 목표를 가진 동료들과 경험을 나누고 함께 성장하세요.
						</p>

						<div className="flex flex-wrap gap-4">
							<Link
								to="#all-communities"
								className="flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-primary-950 shadow-xl shadow-primary-900/20 transition-all hover:scale-105 hover:bg-gray-50 active:scale-95"
							>
								커뮤니티 둘러보기
							</Link>
							<Link
								to="#trending"
								className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 font-bold text-white backdrop-blur-md transition-colors hover:bg-white/10"
							>
								인기 글 보기
							</Link>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
