import * as React from 'react';
import * as THREE from 'three';
import { FC, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line, useScroll } from '@react-three/drei';
import { useAtom, useAtomValue } from 'jotai';
import { clickedAtom, fetchImagesLibraryAtom, imagesLibraryAtom } from './Slider.atom';

const geometry = [new THREE.Vector3(0, -0.5, 0), new THREE.Vector3(0, 0.5, 0)];

export const Minimap: FC<{ urlsAtomState }> = ({ urlsAtomState }) => {
    const ref = useRef<THREE.Mesh>();
    const scroll = useScroll();

    const { size: { height } } = useThree((state) => state.viewport);

    const damp = THREE.MathUtils.damp;

    useFrame((state, delta) => {
        ref.current.children.forEach((child, index) => {
            // Give me a value between 0 and 1
            //   starting at the position of my item
            //   ranging across 4 / total length
            //   make it a sine, so the value goes from 0 to 1 to 0.
            const y = scroll.curve(index / urlsAtomState.length - 1.5 / urlsAtomState.length, 4 / urlsAtomState.length);
            child.scale.y = damp(child.scale.y, 0.1 + y / 6, 8, delta);
        });
    });
    return (
        <group ref={ref}>
            {urlsAtomState.map((_, i) => (
                <Line lineWidth={2} alphaWrite={null} key={i} points={geometry} color={0x0fffff} position={[i * 0.06 - urlsAtomState.length * 0.03, -height / 2 + 0.6, 0]} />
            ))}
        </group>
    );
}
