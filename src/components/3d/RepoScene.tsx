"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#7C3AED"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function RepoCard({ position, color }: { position: [number, number, number]; color: string }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.3;
      mesh.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.2;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <roundedBoxGeometry args={[1.2, 0.8, 0.08, 4, 0.06]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.15}
        wireframe
      />
    </mesh>
  );
}

function Globe() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -3]}>
      <icosahedronGeometry args={[2, 1]} />
      <meshStandardMaterial
        color="#7C3AED"
        wireframe
        transparent
        opacity={0.08}
      />
    </mesh>
  );
}

export default function RepoScene() {
  const cards = [
    { pos: [-2, 1, 0] as [number, number, number], color: "#7C3AED" },
    { pos: [0, 0.5, -1] as [number, number, number], color: "#22D3EE" },
    { pos: [2, -0.5, 0] as [number, number, number], color: "#EC4899" },
    { pos: [-1.5, -1, -0.5] as [number, number, number], color: "#7C3AED" },
    { pos: [1.5, 1, -0.5] as [number, number, number], color: "#22D3EE" },
  ];

  return (
    <div className="absolute inset-0 opacity-40">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#7C3AED" />
        <pointLight position={[-5, -5, 5]} intensity={0.3} color="#22D3EE" />
        <Particles count={150} />
        <Globe />
        {cards.map((c, i) => (
          <RepoCard key={i} position={c.pos} color={c.color} />
        ))}
      </Canvas>
    </div>
  );
}
