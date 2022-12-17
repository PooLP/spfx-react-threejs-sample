/* eslint-disable react/prop-types */
// React
import * as React from 'react';
import { FC, Suspense, useLayoutEffect, useRef, useState } from 'react';

// R3F
import * as THREE from 'three';
import { Canvas, useFrame, useThree, Vector3 } from '@react-three/fiber';
import { Image, ScrollControls, Scroll, useScroll, Shadow, RoundedBox, ImageProps } from '@react-three/drei';

// Store
import { useAtom, useAtomValue } from 'jotai';
import { clickedAtom, spContextAtom, themeAtom, fetchImagesLibraryAtom, isLoadingimagesLibraryAtom } from './Slider.atom';

// Context du webpart
//import { AppContext } from '../AppContext';

// Interface
import { ISliderProps } from './ISliderProps';

// Component
import { Minimap } from './Minimap';

export interface IITem extends ImageProps {
  index: number;
  position: Vector3;
  scale: any;
  c: THREE.Color;
}




const Item = ({ urlsAtomState, index, position, scale, c = new THREE.Color(), ...props }) => {
  const ref = useRef<THREE.Mesh>();
  const scroll = useScroll();
  const [clickedAtomState, setClickedAtomState] = useAtom(clickedAtom);
  const [hovered, hover] = useState(false);
  const click = () => (setClickedAtomState(index === clickedAtomState ? null : index));
  const over = () => hover(true);
  const out = () => hover(false);

  const damp = THREE.MathUtils.damp;

  useFrame((state, delta) => {
    const y = scroll.curve(index / urlsAtomState.length - 1.5 / urlsAtomState.length, 4 / urlsAtomState.length);
    (ref.current.material as any).scale[1] = ref.current.scale.y = damp(ref.current.scale.y, clickedAtomState === index ? 5 : 4 + y, 8, delta);
    (ref.current.material as any).scale[0] = ref.current.scale.x = damp(ref.current.scale.x, clickedAtomState === index ? 4.7 : scale[0], 6, delta);
    if (clickedAtomState !== null && index < clickedAtomState) ref.current.position.x = damp(ref.current.position.x, position[0] - 2, 6, delta);
    if (clickedAtomState !== null && index > clickedAtomState) ref.current.position.x = damp(ref.current.position.x, position[0] + 2, 6, delta);
    if (clickedAtomState === null || clickedAtomState === index) ref.current.position.x = damp(ref.current.position.x, position[0], 6, delta);
    (ref.current.material as any).grayscale = damp((ref.current.material as any).grayscale, hovered || clickedAtomState === index ? 0 : Math.max(0, 1 - y), 6, delta);
    (ref.current.material as any).color.lerp(c.set(hovered || clickedAtomState === index ? 'white' : '#aaa'), hovered ? 0.3 : 0.1);
  });

  return (
    <mesh onClick={click} onPointerOver={over} onPointerOut={out}>
      {/*
          <RoundedBox args={[1, 1, 1]} position={position} scale={scale} radius={0.05} smoothness={4} {...props}>
            <meshPhongMaterial color={themeAtomState.palette.themePrimary} />
          </RoundedBox>
        */}
      {<Image ref={ref} url={props.url} {...props} position={position} scale={scale} />}
      {/*
          <Shadow scale={scale} rotation={[0.75, 0, 0]} position={[position[0], position[1] - 3, 0]} />
      */ }

    </mesh>
  );
};

const Items = ({ w = 0.7, gap = 0.15, urlsAtomState }) => {
  const { size: { width } } = useThree((state) => state.viewport);
  const xW = w + gap;

  return (
    <ScrollControls horizontal={true} damping={10} pages={(width - xW + urlsAtomState.length * xW) / width} infinite={false}>
      <Minimap urlsAtomState={urlsAtomState} />
      <Scroll>
        {urlsAtomState.map((url, i) => {
          return (
            <Item key={i} index={i} position={[i * xW, 0, 0]} scale={[w, 4, 1]} url={url} c={new THREE.Color()} urlsAtomState={urlsAtomState} />
          );
        })}
      </Scroll>
    </ScrollControls>
  );
};

export const Slider: FC<ISliderProps> = (_props) => {

  /**
   * Atom
   */
  const [clickedAtomState, setClickedAtomState] = useAtom(clickedAtom);
  const spContextAtomState = useAtomValue(spContextAtom);
  const [themeAtomState, setThemeAtomState] = useAtom(themeAtom);
  const [urlsAtomState, fetchImagesLibraryAtomState] = useAtom(fetchImagesLibraryAtom);
  const isLoadingimagesLibraryAtomState = useAtomValue(isLoadingimagesLibraryAtom);

  /**
   * Local
   */
  const scroll = useScroll();

  /**
   * Methods
   */

  /**
   * LifeCycle
   */
  useLayoutEffect(() => {
    fetchImagesLibraryAtomState();
  }, []);

  useLayoutEffect(() => {
    if (_props.theme) setThemeAtomState(_props.theme);
  }, [_props.theme]);

  /**
   * Render
   */

  return (
    <Suspense fallback={'loading'}>
      <Canvas
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        onPointerMissed={() => setClickedAtomState(null)}
      >
        <ambientLight intensity={0.1} />
        <directionalLight color='white' position={[0, 0, 5]} />
        <Items urlsAtomState={urlsAtomState} />
      </Canvas>
    </Suspense>
  );
};