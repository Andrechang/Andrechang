// import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
renderer.render(scene, camera);

//light
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 20, 0);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

//For DEBUG
// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)
// const controls = new OrbitControls(camera, renderer.domElement);

//background
const spaceTexture = new THREE.TextureLoader().load('space.jpg');
scene.background = spaceTexture;

//render loop
function animate() {
  requestAnimationFrame(animate);
  // controls.update();//For DEBUG
  renderer.render(scene, camera);
}
animate();
