import * as React from 'react';
import { useRef, useEffect } from 'react';
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, SphereGeometry, MeshNormalMaterial } from 'three';
const { useRef, useEffect, useState } = React;


export const SketcherContainer = React.memo(() => {
    const mount = useRef(null);
    const controls = useRef(null);

    useEffect(() => {
        const scene = new Scene();
        const camera = new PerspectiveCamera( 75, 1, 0.1, 1000 );
        const renderer = new WebGLRenderer();
    }, []);
});

const useElementSize = (mount: any)=> {
    let width = mount.current.clientWidth;
    let height = mount.current.clientHeight;
    // width, height
}



// Based on
//  - https://github.com/lsgng/react-redux-three
//  - https://github.com/lsgng/react-redux-three


export const Vis = () => {
    const mount = React.useRef<HTMLDivElement>();
    const controls = useRef(null);
    const [isAnimating, setAnimating] = useState(true);


    useEffect(() => {
        let width = mount.current.clientWidth;
        let height = mount.current.clientHeight;
        let frameId;

        const scene = new Scene();
        const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
        const renderer = new WebGLRenderer({ antialias: true });
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshNormalMaterial();// MeshBasicMaterial({ color: 0xff00ff });
        const cube = new Mesh(geometry, material);


        const geometry2 = new SphereGeometry(0.4, 32, 32);
        const sphere = new Mesh(geometry2, material);


        camera.position.z = 4;
        // scene.add(cube);
        scene.add(sphere);

        renderer.setClearColor('#000000')
        renderer.setSize(width, height)

        const renderScene = () => {
            renderer.render(scene, camera)
        }

        const handleResize = () => {
            width = mount.current.clientWidth
            height = mount.current.clientHeight
            renderer.setSize(width, height)
            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderScene()
        }

        const animate = () => {
            cube.rotation.x += 0.01
            cube.rotation.y += 0.01

            renderScene()
            frameId = window.requestAnimationFrame(animate)
        }

        const start = () => {
            if (!frameId) {
            frameId = requestAnimationFrame(animate)
            }
        }

        const stop = () => {
            cancelAnimationFrame(frameId)
            frameId = null
        }

        mount.current.appendChild(renderer.domElement)
        window.addEventListener('resize', handleResize)
        start()

        controls.current = { start, stop }

        return () => {
            stop()
            window.removeEventListener('resize', handleResize)
            mount.current.removeChild(renderer.domElement)

            scene.remove(cube)
            geometry.dispose()
            material.dispose()
        }
    }, []);

    useEffect(() => {
      if (isAnimating) {
        controls.current.start()
      } else {
        controls.current.stop()
      }
    }, [isAnimating])

    return <div
        style={{ "width": "100%", "height": "100%", position: "absolute" }}
        ref={mount} onClick={() => setAnimating(!isAnimating)}
    />
}
