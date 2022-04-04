import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';
import { extend, useFrame, useThree, createPortal, ReactThreeFiber } from '@react-three/fiber';
import { EffectComposer, ShaderPass, RenderPass, UnrealBloomPass, FilmPass } from 'three-stdlib';
import { WaterPass } from './WaterPass';
import { EffectPass } from './EffectPass';
import { useScroll } from '@react-three/drei';

extend({ EffectComposer, ShaderPass, RenderPass, WaterPass, UnrealBloomPass, FilmPass, EffectPass });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      effectComposer: ReactThreeFiber.Node<EffectComposer, typeof EffectComposer>;
      renderPass: ReactThreeFiber.Node<RenderPass, typeof RenderPass>;
      waterPass: ReactThreeFiber.Node<any, typeof WaterPass>;
      unrealBloomPass: ReactThreeFiber.Node<UnrealBloomPass, typeof UnrealBloomPass>;
      effectPass: ReactThreeFiber.Node<any, typeof EffectPass>;
      filmPass: ReactThreeFiber.Node<FilmPass, typeof FilmPass>;
    }
  }
}

export default function Effects({ children }) : any {
  const scroll = useScroll();

  const [scene] = useState(() => new THREE.Scene());
  const composer = useRef<any>();
  const effect = useRef<any>();
  const water = useRef<any>();
  const bloom = useRef<any>();
  const { gl, size, camera } = useThree();
  let last = scroll?.offset;
  useEffect(() => void composer.current.setSize(size.width, size.height), [size]);
  useFrame(() => {
    const top = scroll?.offset;
    effect.current.factor = THREE.MathUtils.lerp(effect.current.factor, (top - last) / -30, 0.1);
    bloom.current.strength = THREE.MathUtils.lerp(bloom.current.strength, Math.abs((top - last) / 200), 0.1);
    water.current.factor = THREE.MathUtils.lerp(water.current.factor, Math.abs((top - last) / 30), 0.1);
    last = top;
    gl.autoClear = true;
    composer.current.render();
  }, 1);
  return createPortal(
    <>
      <effectComposer ref={composer} args={[gl]}>
        <renderPass scene={scene} camera={camera} />
        <unrealBloomPass ref={bloom} args={[undefined, 0.0, 1, 0.0]} />
        <effectPass attachArray='passes' ref={effect} />
        <waterPass attachArray='passes' ref={water} />
      </effectComposer>
      {children}
    </>,
    scene
  );
}
