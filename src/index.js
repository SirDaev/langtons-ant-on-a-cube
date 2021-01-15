import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let camera, mesh, renderer, scene, stats;
let color = new THREE.Color(0xE3C8A0);
let currentSide = 1;
let isRunning = false;
let lastTime = 0;
let sides = [];

const direction = "l";
const numberOfSides = 6;
const offset = 2;
const sideLength = 100;
const sLsQ = sideLength*sideLength;
const startPosition = 5050;
const tileSize = 20;
const timeBetweenMoves = 250;

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .1, 20000 );
  camera.position.set( -1400,1300,3500 );
  camera.lookAt( 0, 0, 0 );

  scene = new THREE.Scene();

  for (let z=0; z<numberOfSides; z++) {

    const light1 = new THREE.HemisphereLight( 0xffffff, 0x000088 );
    light1.position.set( - 1, 1.5, 1 );
    scene.add( light1 );

    const light2 = new THREE.HemisphereLight( 0xffffff, 0x880000, 0.5 );
    light2.position.set( - 1, - 1.5, - 1 );
    scene.add( light2 );

    const geometry = new THREE.PlaneBufferGeometry( tileSize,tileSize,1,1 );
    const material = new THREE.MeshBasicMaterial( {color: color });
  
    mesh = new THREE.InstancedMesh( geometry, material, sLsQ );
    mesh.userData.on = false;
  
    let i = 0;
  
    const matrix = new THREE.Matrix4();

    for ( let y=0; y>-sideLength; y--) {

      for ( let x=0; x<sideLength; x++) {
          let newX = (x*tileSize)+(offset*x);
          let newY = (y*tileSize)+(offset*y);

          matrix.setPosition( newX,newY,0 );

          mesh.setMatrixAt( i, matrix );
          mesh.setColorAt( i, color );

          i ++;

      }

    }
    if(z===0) {
      mesh.position.x = -(tileSize+offset)*((sideLength-1)/2);
      mesh.position.y = (tileSize+offset)*((sideLength-1)/2);
      mesh.position.z = (tileSize+offset)*((sideLength)/2);
    }
    if(z===1) {
      mesh.rotation.y = Math.PI/2;
      mesh.position.x = (tileSize+offset)*((sideLength)/2);
      mesh.position.y = (tileSize+offset)*((sideLength-1)/2);
      mesh.position.z = (tileSize+offset)*((sideLength-1)/2);
    }
    if(z===2) {
      mesh.rotation.y = Math.PI;
      mesh.position.x = (tileSize+offset)*((sideLength-1)/2);
      mesh.position.y = (tileSize+offset)*((sideLength-1)/2);
      mesh.position.z = -(tileSize+offset)*((sideLength)/2);
    }
    if(z===3) {
      mesh.rotation.y = 3*Math.PI/2;
      mesh.position.x = -(tileSize+offset)*((sideLength)/2);
      mesh.position.y = (tileSize+offset)*((sideLength-1)/2);
      mesh.position.z = -(tileSize+offset)*((sideLength-1)/2);
    }
    if(z===4) {
      mesh.rotation.x = 3*Math.PI/2;
      mesh.position.x = -(tileSize+offset)*((sideLength-1)/2);
      mesh.position.y = (tileSize+offset)*((sideLength)/2);
      mesh.position.z = -(tileSize+offset)*((sideLength-1)/2);
    }
    if(z===5) {
      mesh.rotation.x = Math.PI/2;
      mesh.position.x = -(tileSize+offset)*((sideLength-1)/2);
      mesh.position.y = -(tileSize+offset)*((sideLength)/2);
      mesh.position.z = (tileSize+offset)*((sideLength-1)/2);
    }

    sides.push( mesh );
  }

  for(i=0; i<sides.length; i++) {
    scene.add(sides[i]);
  }

  sides[0].setColorAt( startPosition, color.setHex( 0x333333 ) );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0xeeeeee );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  new OrbitControls( camera, renderer.domElement );

  stats = new Stats();
  document.body.appendChild( stats.dom );
  window.addEventListener( 'resize', onWindowResize, false );

  document.getElementById("start-button").addEventListener('click', start, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate(now) {
  if(!lastTime || now - lastTime >= timeBetweenMoves) {
    lastTime = now;
    if(isRunning) {

      // Determine new color of existing tile
      console.log(sides[0]);
      
      sides[0].setColorAt( 5051, color.setHex( Math.random() * 0xffffff ) );
      sides[0].instanceColor.needsUpdate = true;







    }
  }
  requestAnimationFrame( animate );
  render();
}

function render() {
  renderer.render( scene, camera );
  stats.update();
}

function start() {
  isRunning = !isRunning;
}