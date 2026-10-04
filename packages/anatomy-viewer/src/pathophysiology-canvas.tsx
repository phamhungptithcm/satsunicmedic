"use client";

import { Component, useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Color, FrontSide, Group, InstancedMesh, Mesh, MeshStandardMaterial, Object3D, PerspectiveCamera, Plane, Vector3 } from "three";
import { loadCanonicalHeart } from "./canonical-heart";
import { lessonCamera, lessonPlanes, lessonSourceOpacity, lessonSourceVisible } from "./lesson-scene";
import type { BodyCatalog, BodyScene } from "./scene-history";
import type { HeartBinding } from "@hs/contracts";
import { coronaryFlowState, FLOW_PARTICLE_RADIUS, isParticleVisible, particleFraction, preparePath, samplePath, type Point3 } from "./pathophysiology-flow";

type Props = {
  binding: HeartBinding;
  catalog: BodyCatalog;
  discoveryScene?: BodyScene;
  clock: RefObject<number>;
  playing: boolean;
  time: number;
  blockedAt: number;
  plaqueAt: number;
  variant?: "infarction" | "stenosis" | "spasm";
  recoveryAt?: number;
  narrowingAt?: number;
  normalView: boolean;
  wallOpacity: number;
  selected: string;
  onSelect: (id: string) => void;
  renderSelection?: (id: string) => ReactNode;
  view: "front" | "back" | "left" | "right";
  viewRevision: number;
  zoom: number;
  onStatus: (status: "loading" | "ready" | "error") => void;
};

function disposeModel(model: Group) {
  model.traverse(object => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
  });
}


function BloodFlow({ flow, clippingPlanes, ...props }: Props & { flow: HeartBinding["flows"][number]; clippingPlanes: Plane[] }) {
  const mesh = useRef<InstancedMesh>(null);
  const path = useMemo(() => preparePath(flow.points), [flow.points]);
  const dummy = useMemo(() => new Object3D(), []);
  const point = useRef<Point3>([0, 0, 0]);
  useFrame(() => {
    const target = mesh.current;
    if (!target) return;
    const affected = flow.id === props.binding.occlusion.segmentId;
    const { blocked, narrowed } = coronaryFlowState(props.clock.current, props.normalView, affected, props.blockedAt, props.narrowingAt, props.recoveryAt);
    for (let i = 0; i < 42; i++) {
      const fraction = particleFraction(props.clock.current, i, 42);
      samplePath(path, fraction, point.current);
      dummy.position.set(...point.current);
      dummy.scale.setScalar((isParticleVisible(fraction, blocked, props.binding.occlusion.at) && !(narrowed && fraction >= props.binding.occlusion.at && i % 3 !== 0)) ? 1 : 0);
      dummy.updateMatrix(); target.setMatrixAt(i, dummy.matrix);
    }
    target.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[undefined, undefined, 42]} frustumCulled={false} renderOrder={3} raycast={() => null}>
    <sphereGeometry args={[FLOW_PARTICLE_RADIUS, 8, 6]} />
    <meshBasicMaterial color="#ffedaa" toneMapped={false} clippingPlanes={clippingPlanes} />
  </instancedMesh>;
}

function HeartScene({ model, ...props }: Props & { model: Group }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, invalidate, gl } = useThree();
  const lastZoom = useRef(props.zoom);
  const clippingPlanes = useMemo(() => lessonPlanes(props.catalog,props.discoveryScene).map(p=>new Plane(new Vector3(...p.normal),p.constant)),[props.catalog,props.discoveryScene]);
  const inheritedCamera = useMemo(()=>lessonCamera(props.discoveryScene),[props.discoveryScene]);
  const inheritedView = !!inheritedCamera && props.viewRevision === 0;
  const sourceVisible = (id:string) => lessonSourceVisible(props.binding.structures.find(item=>item.id===id)?.sourceId ?? id,props.discoveryScene);
  const [pickedPoint, setPickedPoint] = useState<{ id: string; point: Vector3 } | null>(null);
  const clot = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const occludedFlow = props.binding.flows.find(flow => flow.id === props.binding.occlusion.segmentId)!;
  const blockage = useMemo(() => samplePath(preparePath(occludedFlow.points), props.binding.occlusion.at, [0, 0, 0]), [occludedFlow, props.binding.occlusion.at]);

  useEffect(() => {
    const sides = { front: [1.1, 0.35, 5.7], back: [-1.1, 0.35, -5.7], left: [5.7, 0.35, 0], right: [-5.7, 0.35, 0] } as const;
    const position = sides[props.view];
    const pose = inheritedView ? inheritedCamera! : {position:[...position],target:[0,0,0]};
    camera.position.fromArray(pose.position);
    if(camera instanceof PerspectiveCamera){camera.fov=inheritedView?36:42;camera.updateProjectionMatrix();}
    controls.current?.target.fromArray(pose.target); controls.current?.update(); invalidate();
  }, [props.view, props.viewRevision, inheritedView, inheritedCamera, camera, invalidate]);

  useEffect(() => {
    const delta = props.zoom - lastZoom.current;
    lastZoom.current = props.zoom;
    if (!delta) return;
    const target = controls.current?.target ?? new Vector3();
    const offset = camera.position.clone().sub(target);
    offset.setLength(Math.min(inheritedView?200:9, Math.max(inheritedView ? .625 : 2.7, offset.length() * Math.pow(0.85, delta))));
    camera.position.copy(target).add(offset);
    controls.current?.update(); invalidate();
  }, [props.zoom, inheritedView, camera, invalidate]);

  useEffect(() => {
    const handle = (event: Event) => { event.preventDefault(); props.onStatus("error"); };
    gl.domElement.addEventListener("webglcontextlost", handle);
    return () => gl.domElement.removeEventListener("webglcontextlost", handle);
  }, [gl, props.onStatus]);

  useEffect(() => {
    model.traverse(object => {
      if (!(object instanceof Mesh)) return;
      object.visible = lessonSourceVisible(object.name,props.discoveryScene);
      const structure = props.binding.structures.find(item => item.sourceId === object.name);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (!(material instanceof MeshStandardMaterial)) continue;
        const isFlowVessel = props.binding.flows.some(flow => flow.id === structure?.id);
        const fallbackOpacity = (structure?.kind === "wall" || !structure) ? props.wallOpacity * props.catalog.structures[object.name]!.defaultOpacity : isFlowVessel && !props.discoveryScene ? 0.3 : props.catalog.structures[object.name]!.defaultOpacity;
        material.opacity = lessonSourceOpacity(object.name,fallbackOpacity,props.discoveryScene);
        if(props.discoveryScene?.opacity[object.name] !== undefined && (structure?.kind === "wall" || !structure)) material.opacity *= props.wallOpacity;
        const recompile = material.transparent !== (material.opacity < 1) || (material.clippingPlanes?.length ?? 0) !== clippingPlanes.length;
        material.clippingPlanes = clippingPlanes;
        if(recompile) material.needsUpdate = true;
        material.transparent = material.opacity < 1;
        material.depthWrite = material.opacity >= 1;
        material.side = FrontSide;
        material.emissive = new Color((structure?.id === props.selected || object.name === props.selected || props.catalog.concepts[props.selected]?.sourceIds.includes(object.name)) ? "#602015" : "#000000");
        material.emissiveIntensity = (structure?.id === props.selected || object.name === props.selected || props.catalog.concepts[props.selected]?.sourceIds.includes(object.name)) ? 0.4 : 0;
        object.renderOrder = structure?.kind === "wall" ? 0 : 1;
      }
    });
    invalidate();
  }, [model, props.catalog, props.binding, props.wallOpacity, props.selected, props.discoveryScene, clippingPlanes, invalidate]);

  useEffect(() => { invalidate(); }, [props.time, props.normalView, invalidate]);
  useFrame(() => {
    if (clot.current) clot.current.visible = sourceVisible(props.binding.occlusion.segmentId) && props.variant !== "spasm" && !props.normalView && props.clock.current >= props.blockedAt;
    if (ring.current) ring.current.visible = sourceVisible(props.binding.occlusion.segmentId) && !props.normalView && props.clock.current >= props.plaqueAt && props.clock.current < (props.recoveryAt ?? Infinity);
  });
  return <>
    <color attach="background" args={["#141b29"]} />
    <ambientLight intensity={1.15} />
    <directionalLight position={[3, 4, 6]} intensity={2.1} />
    <directionalLight position={[-4, 1, -2]} intensity={1.2} color="#b7caff" />
    <primitive object={model} onClick={(event: ThreeEvent<MouseEvent>) => {
      if (!event.object.visible || event.delta > 4 || clippingPlanes.some(plane=>plane.distanceToPoint(event.point)<0)) return;
      event.stopPropagation();
      const id=props.binding.structures.find(item=>item.sourceId===event.object.name)?.id??event.object.name;
      if(props.catalog.structures[event.object.name]){
        setPickedPoint({id,point:event.point.clone()});props.onSelect(id);
      }
    }} />
    {pickedPoint && sourceVisible(pickedPoint.id) && pickedPoint.id === props.selected && props.renderSelection && <Html position={pickedPoint.point} style={{ pointerEvents: "auto" }} zIndexRange={[30, 20]} calculatePosition={(object, camera, size) => { const point = object.getWorldPosition(new Vector3()).project(camera); return [Math.max(12, Math.min(size.width - 300, (point.x + 1) * size.width / 2)), Math.max(16, Math.min(size.height - 360, (1 - point.y) * size.height / 2))]; }}>{props.renderSelection(props.selected)}</Html>}
    {props.binding.flows.filter(flow=>sourceVisible(flow.id)).map(flow => <BloodFlow key={flow.id} flow={flow} clippingPlanes={clippingPlanes} {...props} />)}
    <mesh ref={clot} position={blockage} renderOrder={4} onClick={(e: ThreeEvent<MouseEvent>) => { if(!e.object.visible || clippingPlanes.some(plane=>plane.distanceToPoint(e.point)<0))return; e.stopPropagation(); props.onSelect(props.binding.occlusion.segmentId); }}>
      <sphereGeometry args={[0.059, 16, 12]} /><meshStandardMaterial color="#70261c" roughness={0.85} clippingPlanes={clippingPlanes} />
    </mesh>
    <mesh ref={ring} position={blockage} renderOrder={3} raycast={() => null}>
      <sphereGeometry args={[0.085, 16, 12]} /><meshBasicMaterial color={props.variant === "spasm" ? "#c495ff" : "#ffb33f"} wireframe transparent opacity={0.48} clippingPlanes={clippingPlanes} />
    </mesh>
    <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.1} minDistance={inheritedView ? .625 : 2.7} maxDistance={inheritedView?200:9} enablePan={!!props.discoveryScene} />
  </>;
}

class Boundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function PathophysiologyCanvas(props: Props) {
  const [model, setModel] = useState<Group | null>(null);
  useEffect(() => {
    const controller = new AbortController(); let owned: Group | null = null;
    props.onStatus("loading");
    const timeout = window.setTimeout(() => { controller.abort(); props.onStatus("error"); }, 15000);
    void loadCanonicalHeart(props.catalog, props.binding, controller.signal).then(result => {
      window.clearTimeout(timeout); owned = result; setModel(result); props.onStatus("ready");
    }).catch(() => { window.clearTimeout(timeout); if (!controller.signal.aborted) props.onStatus("error"); });
    return () => { window.clearTimeout(timeout); controller.abort(); if (owned) disposeModel(owned); };
  }, [props.catalog, props.binding, props.onStatus]);
  if (!model) return null;
  return <Boundary onError={() => props.onStatus("error")}>
    <Canvas style={{ height: "calc(100% - 96px)" }} frameloop={props.playing ? "always" : "demand"} dpr={[1, 1.5]} camera={{ position: [1.1, 0.35, 5.7], fov: 42, near: .01, far: 750 }} gl={{ antialias: true, powerPreference: "default", localClippingEnabled: true }} aria-label="Tim 3D tương tác: kéo để xoay, cuộn để phóng to; có nút chọn cấu trúc và góc nhìn bên ngoài mô hình">
      <HeartScene {...props} model={model} />
    </Canvas>
  </Boundary>;
}
