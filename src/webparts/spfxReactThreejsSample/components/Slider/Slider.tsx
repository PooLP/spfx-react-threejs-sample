// React
import * as React from 'react';
import { FC, useRef, useState } from 'react';

// R3F
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

// Context du webpart
//import { AppContext } from '../AppContext';

// Interface
import { ISliderProps } from './ISliderProps';

export const Slider: FC<ISliderProps> = (_props) => {

  // Context state
  //const { context, theme } = React.useContext(AppContext);

  /**
   * Methods
   */


  /**
   * LifeCycle
   */


  /**
   * Render
   */
  function Box(boxProps) {
    // This reference gives us direct access to the THREE.Mesh object
    const ref = useRef<Mesh>(null!);
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => (ref.current.rotation.x += 0.01));
    // Return the view, these are regular Threejs elements expressed in JSX

    return (
      <mesh
        {...boxProps}
        ref={ref}
        scale={clicked ? [1.5, 1.5, 1.5] : [1, 1, 1]}
        onClick={(event) => click(!clicked)}
        onPointerOver={(event) => hover(true)}
        onPointerOut={(event) => hover(false)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : '#ff0000'} />
      </mesh>
    );
  }

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </Canvas>
  );
};


