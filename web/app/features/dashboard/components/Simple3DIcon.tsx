import { Canvas, type ThreeElements, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type * as THREE from "three";

function RotatingShape(props: ThreeElements["mesh"]) {
	const meshRef = useRef<THREE.Mesh>(null!);
	const [hovered, setHover] = useState(false);
	const [active, setActive] = useState(false);

	useFrame((_state, delta) => {
		if (meshRef.current) {
			meshRef.current.rotation.x += delta * 0.5;
			meshRef.current.rotation.y += delta * 0.2;
		}
	});

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Three.js mesh interaction
		<mesh
			{...props}
			ref={meshRef}
			scale={active ? 1.2 : 1}
			onClick={() => setActive(!active)}
			onPointerOver={() => setHover(true)}
			onPointerOut={() => setHover(false)}
		>
			<icosahedronGeometry args={[1, 0]} />
			<meshStandardMaterial
				color={hovered ? "#818cf8" : "#4f46e5"} // Indigo-400 : Indigo-600
				roughness={0.3}
				metalness={0.7}
				emissive={hovered ? "#4f46e5" : "#000000"}
				emissiveIntensity={0.2}
			/>
		</mesh>
	);
}

/**
 * 간단한 3D 인터랙티브 아이콘
 * - 대시보드 타이틀 옆에 배치하여 "재미" 요소 추가
 * - 마우스 호버 시 색상 변경, 클릭 시 크기 변경
 */
export function Simple3DIcon() {
	return (
		<div className="h-12 w-12 cursor-pointer transition-transform duration-300 hover:scale-110">
			<Canvas camera={{ position: [0, 0, 3] }}>
				<ambientLight intensity={1.5} />
				<pointLight position={[10, 10, 10]} intensity={2} />
				<RotatingShape position={[0, 0, 0]} />
			</Canvas>
		</div>
	);
}
