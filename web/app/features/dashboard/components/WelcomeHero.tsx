import { Environment, Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function FloatingLogo() {
	const meshRef = useRef<Mesh>(null);

	useFrame((state, delta) => {
		if (meshRef.current) {
			meshRef.current.rotation.y += delta * 0.5;
			meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
		}
	});

	return (
		<Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
			<mesh ref={meshRef} scale={1.5}>
				<torusKnotGeometry args={[1, 0.3, 100, 16]} />
				<meshStandardMaterial
					color="#3b82f6" // Primary-500 (Blue)
					roughness={0.1}
					metalness={0.6}
					emissive="#3b82f6"
					emissiveIntensity={0.2}
				/>
			</mesh>
		</Float>
	);
}

export function WelcomeHero() {
	return (
		<div className="relative mb-8 flex h-[240px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl">
			{/* 3D Scene */}
			<div className="absolute inset-0 h-full w-full">
				<Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
					<ambientLight intensity={0.5} />
					<pointLight position={[10, 10, 10]} intensity={1} />
					<Environment preset="city" />
					<group position={[4, 0, 0]}>
						{" "}
						{/* Positioned to the right */}
						<FloatingLogo />
					</group>
				</Canvas>
			</div>

			{/* Content overlay */}
			<div className="pointer-events-none relative z-10 max-w-lg px-8">
				<h1 className="heading-2 mb-2 text-white">Welcome back, Jongseok!</h1>
				<p className="text-gray-300 text-lg">
					You're on track. 2 tasks pending and 3 new job matches found today.
				</p>
				<div className="pointer-events-auto mt-6">
					<button
						type="button"
						className="rounded-lg bg-white px-5 py-2.5 font-semibold text-gray-900 text-sm shadow-lg transition hover:bg-gray-100"
					>
						View Roadmap
					</button>
				</div>
			</div>
		</div>
	);
}
