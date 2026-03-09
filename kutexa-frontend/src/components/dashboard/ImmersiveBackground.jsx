import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AnimatedMesh() {
    const meshRef = useRef();

    // Create a plane geometry with many vertices
    const count = 40;
    const positions = useMemo(() => {
        const pos = [];
        for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
                pos.push(i - count / 2, j - count / 2, 0);
            }
        }
        return new Float32Array(pos);
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            // Rotate slowly
            meshRef.current.rotation.z = time * 0.1;

            // Gentle floating motion
            meshRef.current.position.y = Math.sin(time * 0.5) * 0.2;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                color="#0071e3"
                transparent
                opacity={0.3}
                sizeAttenuation
            />
        </points>
    );
}

const ImmersiveBackground = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            background: 'radial-gradient(circle at top right, #fbfbfd, #f5f5f7)',
            pointerEvents: 'none'
        }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                <fog attach="fog" args={['#f5f5f7', 10, 25]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <AnimatedMesh />
            </Canvas>
        </div>
    );
};

export default ImmersiveBackground;
