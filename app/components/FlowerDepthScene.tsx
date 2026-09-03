"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type FlowerDepthSceneProps = {
  image: string;
  active: boolean;
  bloomed: boolean;
};

const vertexShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uDepth;
  uniform float uTime;
  varying vec2 vUv;
  varying float vRelief;

  void main() {
    vUv = uv;
    vec2 texel = vec2(1.0 / 1024.0, 1.0 / 1600.0);
    vec3 sampleColor = (
      texture2D(uMap, uv).rgb * 4.0 +
      texture2D(uMap, uv + vec2(texel.x, 0.0)).rgb +
      texture2D(uMap, uv - vec2(texel.x, 0.0)).rgb +
      texture2D(uMap, uv + vec2(0.0, texel.y)).rgb +
      texture2D(uMap, uv - vec2(0.0, texel.y)).rgb
    ) / 8.0;
    float high = max(sampleColor.r, max(sampleColor.g, sampleColor.b));
    float low = min(sampleColor.r, min(sampleColor.g, sampleColor.b));
    float luma = dot(sampleColor, vec3(0.299, 0.587, 0.114));
    float ink = clamp(1.0 - luma, 0.0, 1.0);
    float chroma = clamp(high - low, 0.0, 1.0);

    float subject = ink * 0.58 + chroma * 1.62;
    float depthMap = smoothstep(0.055, 0.76, subject);
    depthMap *= smoothstep(0.01, 0.18, ink + chroma * 1.8);
    vRelief = depthMap;
    float breeze = sin(uv.y * 11.0 + uTime * 0.55) * sin(uv.x * 8.0 - uTime * 0.34);
    vec3 displaced = position;
    displaced.z += depthMap * uDepth + breeze * uDepth * 0.018 * depthMap;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uLight;
  uniform float uBloom;
  varying vec2 vUv;
  varying float vRelief;

  void main() {
    vec4 color = texture2D(uMap, vUv);
    vec3 reliefNormal = normalize(vec3(-dFdx(vRelief) * 28.0, -dFdy(vRelief) * 28.0, 1.0));
    vec3 lightDirection = normalize(vec3(uLight * 0.8, 1.15));
    float diffuse = max(dot(reliefNormal, lightDirection), 0.0);
    float rim = pow(1.0 - max(reliefNormal.z, 0.0), 2.0);
    float sculptedLight = 0.82 + diffuse * 0.25 + rim * 0.12 * vRelief;
    float saturation = mix(0.72, 1.02, uBloom);
    float grey = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(grey), color.rgb, saturation) * sculptedLight;
    gl_FragColor = vec4(color.rgb, color.a);
  }
`;

function createReliefMaterial(texture: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uDepth: { value: 0.18 },
      uTime: { value: 0 },
      uLight: { value: new THREE.Vector2(0.35, 0.45) },
      uBloom: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: false,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

function DepthPainting({ image, active, bloomed }: FlowerDepthSceneProps) {
  const texture = useLoader(THREE.TextureLoader, image);
  const group = useRef<THREE.Group>(null);
  const viewport = useThree((state) => state.viewport);
  const pixelWidth = useThree((state) => state.size.width);
  const pointer = useThree((state) => state.pointer);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;

  const imageAspect = texture.image.width / texture.image.height;
  const mobileWidth = viewport.width * 0.96;
  const desktopHeight = viewport.height * 1.12;
  const width = pixelWidth <= 700 ? mobileWidth : desktopHeight * imageAspect;
  const height = pixelWidth <= 700 ? mobileWidth / imageAspect : desktopHeight;
  const segmentsX = pixelWidth <= 700 ? 58 : 118;
  const segmentsY = pixelWidth <= 700 ? 88 : 178;

  const reliefMaterial = useMemo(() => createReliefMaterial(texture), [texture]);

  useEffect(() => {
    return () => reliefMaterial.dispose();
  }, [reliefMaterial]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const motion = active ? 1 : 0.25;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.145 * motion, 4.8, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.09 * motion, 4.8, delta);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, pointer.x * -0.055 * motion, 4.4, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, pointer.y * -0.035 * motion, 4.4, delta);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, bloomed ? 0.2 : 0.02, 2.1, delta);
    reliefMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    reliefMaterial.uniforms.uDepth.value = THREE.MathUtils.damp(reliefMaterial.uniforms.uDepth.value, bloomed ? 0.42 : 0.24, 2.2, delta);
    reliefMaterial.uniforms.uLight.value.x = THREE.MathUtils.damp(reliefMaterial.uniforms.uLight.value.x, pointer.x * 0.65 + 0.25, 4.5, delta);
    reliefMaterial.uniforms.uLight.value.y = THREE.MathUtils.damp(reliefMaterial.uniforms.uLight.value.y, pointer.y * 0.45 + 0.35, 4.5, delta);
    reliefMaterial.uniforms.uBloom.value = THREE.MathUtils.damp(reliefMaterial.uniforms.uBloom.value, bloomed ? 1 : 0, 2.2, delta);
  });

  return (
    <group ref={group}>
      <mesh material={reliefMaterial}>
        <planeGeometry args={[width, height, segmentsX, segmentsY]} />
      </mesh>
    </group>
  );
}

export default function FlowerDepthScene(props: FlowerDepthSceneProps) {
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className={`webgl-depth-scene ${ready ? "ready" : ""}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 38 }}
        dpr={[1, 1.45]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={props.active && !reducedMotion ? "always" : "demand"}
        onCreated={() => setReady(true)}
      >
        <Suspense fallback={null}>
          <DepthPainting {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
