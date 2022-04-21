// import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
const canvas = document.querySelector('canvas.webgl')

const NUM_PAINTS = 12;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
renderer.render(scene, camera);

//box object

let paintTexture = [];
for (let s = 0; s < NUM_PAINTS; s++) {
  paintTexture[s] = new THREE.TextureLoader().load(`./pics/art/paint${s + 1}.jpg`);
}

const painting = new THREE.Mesh(
  new THREE.BoxGeometry(15, 15, 0.1),
  new THREE.MeshStandardMaterial({ map: paintTexture[0] }));
painting.position.set(20, 0, 0);
scene.add(painting);

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
const spaceTexture = new THREE.TextureLoader().load('./space.jpg');
scene.background = spaceTexture;

//change painting when scroll
function changePaint() {
  const t = document.body.getBoundingClientRect().top;
  if (t < 0 && -t < NUM_PAINTS * 550) {
    const idx = Math.floor(-t / 550); //around every 600p
    painting.material = new THREE.MeshStandardMaterial({ map: paintTexture[idx] });
  }
}
document.body.onscroll = changePaint;

//render loop
function animate() {
  requestAnimationFrame(animate);
  painting.rotation.y += 0.01;
  // controls.update();//For DEBUG
  renderer.render(scene, camera);
}
animate();