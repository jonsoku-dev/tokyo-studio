import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Low-poly Grid Wave Background
 * - 성능 최적화: DPR 제한 (1.5), 모바일 쿼리 대응
 * - 안정성: Visibility Change 감지하여 렌더링 중지
 * - 디자인: 앱의 Indigo 컬러를 은은하게 반영한 미니멀 그리드
 */

interface GridWaveProps {
	color?: string;
	opacity?: number;
	speed?: number;
	frequency?: number;
	amplitude?: number;
}

function GridWave({
	color = "#818cf8",
	opacity = 0.4,
	speed = 0.2,
	frequency = 0.5,
	amplitude = 0.2,
}: GridWaveProps) {
	const meshRef = useRef<THREE.Mesh>(null!);
	// 60x60 segments for smooth but low-poly looking wave
	// Lower segment count creates "low-poly" look
	const geometry = useMemo(() => new THREE.PlaneGeometry(20, 10, 40, 20), []);

	// Store original positions for wave calculation
	const originalPositions = useMemo(() => {
		return geometry.attributes.position.array.slice();
	}, [geometry]);

	const { clock, camera } = useThree();

	useFrame((state) => {
		if (!meshRef.current) return;

		const time = state.clock.getElapsedTime() * speed;
		const positions = meshRef.current.geometry.attributes.position;
		const array = positions.array as Float32Array;

		// 마우스 패럴랙스 (아주 미세하게)
		const mouseX = (state.mouse.x * state.viewport.width) / 50;
		const mouseY = (state.mouse.y * state.viewport.height) / 50;
		camera.position.x += (mouseX - camera.position.x) * 0.02;
		camera.position.y += (mouseY - camera.position.y) * 0.02;
		camera.lookAt(0, 0, 0);

		// Wave Animation
		for (let i = 0; i < originalPositions.length; i += 3) {
			const x = originalPositions[i];
			const y = originalPositions[i + 1];

			// Simple sine wave based on x position and time
			// Making it "diagonal" by using x + y
			const z =
				Math.sin(x * frequency + time) *
				Math.cos(y * frequency + time) *
				amplitude;

			array[i + 2] = z;
		}

		positions.needsUpdate = true;
	});

	return (
		<mesh
			ref={meshRef}
			geometry={geometry}
			rotation={[-Math.PI / 3, 0, 0]} // Tilted for perspective
			position={[0, -2, -5]} // Behind UI
		>
			<meshBasicMaterial
				color={color}
				wireframe
				transparent
				opacity={opacity}
			/>
		</mesh>
	);
}

// 성능/가시성 관리 컴포넌트
function SceneManager() {
	const { setFrameloop } = useThree();

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				setFrameloop("never");
			} else {
				setFrameloop("always");
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [setFrameloop]);

	return null;
}

export function Global3DBackground() {
	return (
		<div className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden bg-gradient-to-b from-gray-50/50 to-white/50">
			<Canvas
				camera={{ position: [0, 2, 5], fov: 60 }}
				dpr={[1, 1.5]} // Performance limit
				gl={{ antialias: true, alpha: true }}
			>
				{/* Fog for fading out edges */}
				<fog attach="fog" args={["#ffffff", 5, 12]} />

				<SceneManager />
				<GridWave color="#818cf8" opacity={0.4} />
			</Canvas>
		</div>
	);
}
