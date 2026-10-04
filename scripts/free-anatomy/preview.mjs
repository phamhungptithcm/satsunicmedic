import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './vendor/three/examples/jsm/controls/OrbitControls.js';

const container = document.querySelector('#viewer');
const status = document.querySelector('#status');
try {
  const response = await fetch('./inventory.json');
  if (!response.ok) throw new Error('Inventory unavailable');
  const inventory = await response.json();
  const modelResponse = await fetch('./candidate.glb');
  if (!modelResponse.ok) throw new Error('Model unavailable');
  const bytes = await modelResponse.arrayBuffer();
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
    b => b.toString(16).padStart(2, '0')).join('');
  if (bytes.byteLength !== inventory.conversion.glbBytes || hash !== inventory.conversion.glbSha256)
    throw new Error('Candidate integrity mismatch');
  const manager = new THREE.LoadingManager();
  manager.setURLModifier(url => { if (!url.startsWith('blob:') && !url.startsWith('data:')) throw new Error('External resource'); return url; });
  const model = await new GLTFLoader(manager).parseAsync(bytes, '');
  const scene = new THREE.Scene();
  scene.add(model.scene);
  scene.add(new THREE.HemisphereLight('#ffffff', '#7f8796', 2));
  const light = new THREE.DirectionalLight('#fff5ea', 3);
  light.position.set(-2, 3, 4);scene.add(light);
  const fill = new THREE.DirectionalLight('#dfe9ff', 1.6);
  fill.position.set(3, 1, -2);scene.add(fill);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'Mô hình vùng ngực; dùng các nút và danh sách lớp để điều khiển');
  const bounds = new THREE.Box3().setFromObject(model.scene);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const camera = new THREE.PerspectiveCamera(38, 1, 0.005, 20);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(center);controls.enableDamping = false;
  controls.minDistance = size.length() * .25; controls.maxDistance = size.length() * 4;
  function render() { renderer.render(scene, camera); }
  function reset() {
    const vertical = size.y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const distance = Math.max(vertical, size.x / camera.aspect / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) * 1.3;
    camera.position.copy(center).add(new THREE.Vector3(0, 0, distance + size.z / 2));
    controls.target.copy(center);controls.update();render();
  }
  let firstSize = true;
  const observer = new ResizeObserver(() => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;camera.updateProjectionMatrix();
    if (firstSize) { reset();firstSize = false; } else render();
  });observer.observe(container);
  controls.addEventListener('change', render);
  function rotate(angle) { camera.position.sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(controls.target);controls.update(); }
  function zoom(factor) {
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length()*factor, controls.minDistance, controls.maxDistance));
    camera.position.copy(controls.target).add(offset);controls.update();
  }
  document.querySelector('#rotate-left').onclick = () => rotate(-Math.PI / 12);
  document.querySelector('#rotate-right').onclick = () => rotate(Math.PI / 12);
  document.querySelector('#zoom-in').onclick = () => zoom(.85);
  document.querySelector('#zoom-out').onclick = () => zoom(1/.85);
  document.querySelector('#reset').onclick = reset;
  document.querySelectorAll('button').forEach(button => button.disabled = false);
  document.querySelector('#layers').disabled = false;
  document.querySelectorAll('[data-group]').forEach(input => input.onchange = () => {
    model.scene.traverse(object => { if (object.userData.group === input.dataset.group) object.visible = input.checked; });render();
    const count = [...document.querySelectorAll('[data-group]')].filter(input => input.checked).length;
    status.textContent = count ? '' : 'Các lớp đang được ẩn. Chọn một lớp để xem lại.';
  });
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();status.textContent = 'Phiên xem 3D bị gián đoạn. Tải lại trang để mở lại mô hình.';
    document.querySelectorAll('button').forEach(button => button.disabled = true);
    document.querySelector('#layers').disabled = true;
  });
  document.querySelector('#stats').textContent = `${inventory.objects.length} thành phần nguồn · ${inventory.conversion.triangles.toLocaleString('vi-VN')} tam giác · ${(bytes.byteLength / 1024 / 1024).toFixed(1)} MiB`;
  status.textContent = '';
  window.addEventListener('pagehide', () => { observer.disconnect();controls.dispose();renderer.dispose(); });
} catch {
  status.textContent = 'Chưa mở được mô hình. Kiểm tra tệp cục bộ và khả năng hỗ trợ WebGL, rồi tải lại trang.';
}
