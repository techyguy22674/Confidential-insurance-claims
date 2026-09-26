"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function InsuranceSerpentine3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 700;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    class SerpentineHelix extends THREE.Curve<THREE.Vector3> {
      constructor() { super(); }
      getPoint(t: number, optionalTarget = new THREE.Vector3()) {
        const y = (t - 0.5) * 14.5;
        const angle = t * Math.PI * 3.8;
        const radius = 2.4 + 0.6 * Math.sin(t * Math.PI * 3.0);
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * (radius * 0.9);
        return optionalTarget.set(x, y, z);
      }
    }

    const path = new SerpentineHelix();
    const tubeGeometry = new THREE.TubeGeometry(path, 260, 0.82, 36, false);

    const tubeMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#0284c7"),
      emissive: new THREE.Color("#032b43"),
      roughness: 0.08,
      metalness: 0.15,
      transmission: 0.82,
      ior: 1.55,
      thickness: 2.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      iridescence: 0.95,
      iridescenceIOR: 1.38,
      iridescenceThicknessRange: [120, 450],
      transparent: true,
      opacity: 0.96,
    });

    const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    mainGroup.add(tubeMesh);

    const coreGeometry = new THREE.TubeGeometry(path, 180, 0.16, 16, false);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#38bdf8"),
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    mainGroup.add(coreMesh);

    const ringGroup = new THREE.Group();
    const ringCount = 18;
    const ringGeom = new THREE.TorusGeometry(1.15, 0.045, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#67e8f9"),
      emissive: new THREE.Color("#0284c7"),
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.9,
    });

    for (let i = 0; i < ringCount; i++) {
      const t = (i + 1) / (ringCount + 1);
      const pt = path.getPoint(t);
      const tangent = path.getTangent(t);
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pt);
      ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      ringGroup.add(ring);
    }
    mainGroup.add(ringGroup);

    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 18;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color("#38bdf8"),
      size: 0.07,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particleSystem);

    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 3.2);
    dirLight.position.set(8, 12, 10);
    scene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 4.5, 25);
    cyanLight.position.set(-6, 4, 8);
    scene.add(cyanLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 3.8, 20);
    amberLight.position.set(6, -3, 6);
    scene.add(amberLight);

    const indigoLight = new THREE.PointLight(0x3b82f6, 4.0, 22);
    indigoLight.position.set(0, 8, -6);
    scene.add(indigoLight);

    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = (x / rect.width - 0.5) * 2;
      mouseY = (y / rect.height - 0.5) * 2;
      targetRotY = mouseX * 0.45;
      targetRotX = mouseY * 0.35;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      tubeMesh.rotation.y += delta * 0.32;
      coreMesh.rotation.y -= delta * 0.22;
      ringGroup.rotation.y += delta * 0.32;
      particleSystem.rotation.y += delta * 0.08;

      cyanLight.position.x = Math.sin(elapsed * 0.8) * 8;
      cyanLight.position.y = Math.cos(elapsed * 0.6) * 6;
      amberLight.position.x = Math.cos(elapsed * 0.7) * 7;
      amberLight.position.z = Math.sin(elapsed * 0.7) * 7;

      mainGroup.rotation.y += (targetRotY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (targetRotX - mainGroup.rotation.x) * 0.05;

      mainGroup.position.y = Math.sin(elapsed * 1.2) * 0.35;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 600;
      const newH = container.clientHeight || 700;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      tubeGeometry.dispose();
      tubeMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "560px",
        position: "relative",
        cursor: "grab",
      }}
    />
  );
}
