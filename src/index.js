import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let camera, mesh, renderer, scene, stats;
let color = new THREE.Color(0xE3C8A0);
let current = {
  direction: {
    relative: "r"
  },
  relativePosition: 1225,
  side: 0
};
let isRunning = false;
let lastTime = 0;
let sides = [];
let sideStates = [
  [],[],[],[],[],[]
];

const numberOfSides = 6;
const offset = 2;
const sideLength = 50;
const sLsQ = sideLength*sideLength;
const tileSize = 20;
const timeBetweenMoves = 10;

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .1, 20000 );
  camera.position.set( -1000,1300,2800 );
  camera.lookAt( 0, 0, 0 );

  scene = new THREE.Scene();

  // Create mesh of planes per side
  for (let z=0; z<numberOfSides; z++) {

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

  // Add 6 sides to the scene
  for(i=0; i<sides.length; i++) {
    scene.add(sides[i]);
  }

  // Place the ant and turn its square 'on'
  sides[current.side].setColorAt( current.relativePosition, color.setHex( 0x333333 ) );
  sideStates[current.side].push(current.relativePosition);

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
      advance();
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

function advance() {
  let nextPosition = determineNextPosition();

  // Update the current square
  if(arrayContains(sideStates[current.side],current.relativePosition).contains) {
    sides[current.side].setColorAt( current.relativePosition, color.setHex( 0x9E7A44 ) );
  } else {
    sides[current.side].setColorAt( current.relativePosition, color.setHex( 0xE3C8A0 ) );
  }
  sides[current.side].instanceColor.needsUpdate = true;

  // Move the ant
  sides[nextPosition.side].setColorAt( nextPosition.position, color.setHex( 0x333333 ) );
  sides[nextPosition.side].instanceColor.needsUpdate = true;

  // Update the direction
  current = {
    direction: {
      relative: determineNextDirection(nextPosition)
    },
    relativePosition: nextPosition.position,
    side: nextPosition.side
  };
}

function determineNextPosition() {
	let nextPosition = {
    side: current.side,
    position: current.relativePosition,
    direction: current.direction.relative
  }
  let positionUnindexed = nextPosition.position+1;
	
	if(current.direction.relative === "r") {
		const sidesMap = [
			{nextSide: 1, nextDirection: 'r', nextRelativePosition: (positionUnindexed - (sideLength-1)) - 1},
			{nextSide: 2, nextDirection: 'r', nextRelativePosition: (positionUnindexed - (sideLength-1)) - 1},
			{nextSide: 3, nextDirection: 'r', nextRelativePosition: (positionUnindexed - (sideLength-1)) - 1},
			{nextSide: 0, nextDirection: 'r', nextRelativePosition: (positionUnindexed - (sideLength-1)) - 1},
			{nextSide: 1, nextDirection: 'd', nextRelativePosition: (sideLength - ((positionUnindexed/sideLength)-1)) - 1},
			{nextSide: 1, nextDirection: 'u', nextRelativePosition: ((sideLength*sideLength) - (sideLength - (positionUnindexed/sideLength))) - 1}
		]
		
		if((current.relativePosition+1) % sideLength !== 0) {
			nextPosition.position = current.relativePosition+1;
		} else {
      let currentSideMap = sidesMap[current.side];
			
			nextPosition = {
        side: currentSideMap.nextSide,
        position: currentSideMap.nextRelativePosition,
        direction: currentSideMap.nextDirection
      }
		}
	}
	
	if(current.direction.relative === "l") {
		const sidesMap = [
			{nextSide: 3, nextDirection: 'l', nextRelativePosition: (positionUnindexed - 1 + sideLength) - 1},
			{nextSide: 0, nextDirection: 'l', nextRelativePosition: (positionUnindexed - 1 + sideLength) - 1},
			{nextSide: 1, nextDirection: 'l', nextRelativePosition: (positionUnindexed - 1 + sideLength) - 1},
			{nextSide: 2, nextDirection: 'l', nextRelativePosition: (positionUnindexed - 1 + sideLength) - 1},
			{nextSide: 3, nextDirection: 'd', nextRelativePosition: (((positionUnindexed-1)/sideLength)+1) - 1},
			{nextSide: 3, nextDirection: 'u', nextRelativePosition: ((sideLength*sideLength)-((positionUnindexed-1)/sideLength)) - 1}
		]
		
		if((current.relativePosition+1) % sideLength !== 1) {
			nextPosition.position = current.relativePosition-1;
		} else {
			let currentSideMap = sidesMap[current.side];
			nextPosition = {
        side: currentSideMap.nextSide,
        position: currentSideMap.nextRelativePosition,
        direction: currentSideMap.nextDirection
      }
		}
	}
	
	if(current.direction.relative === "u") {
		const sidesMap = [
			{nextSide: 4, nextDirection: 'u', nextRelativePosition: (((sideLength*sideLength)-sideLength)+positionUnindexed) - 1},
			{nextSide: 4, nextDirection: 'l', nextRelativePosition: ((sideLength*sideLength)-(sideLength*(positionUnindexed-1))) - 1},
			{nextSide: 4, nextDirection: 'd', nextRelativePosition: (sideLength-(positionUnindexed-1)) - 1},
			{nextSide: 4, nextDirection: 'r', nextRelativePosition: (((positionUnindexed-1)*sideLength)+1) - 1},
			{nextSide: 2, nextDirection: 'd', nextRelativePosition: (sideLength-(positionUnindexed-1)) - 1},
			{nextSide: 0, nextDirection: 'u', nextRelativePosition: (((sideLength*sideLength)-sideLength)+positionUnindexed) - 1}
		]
		
		if(current.relativePosition > (sideLength-1)) {
			nextPosition.position = current.relativePosition-sideLength;
		} else {
			let currentSideMap = sidesMap[current.side];
			nextPosition = {
        side: currentSideMap.nextSide,
        position: currentSideMap.nextRelativePosition,
        direction: currentSideMap.nextDirection
      }
		}
	}
	
	if(current.direction.relative === "d") {
		const sidesMap = [
			{nextSide: 5, nextDirection: 'd', nextRelativePosition: (positionUnindexed-((sideLength*sideLength)-sideLength)) - 1},
			{nextSide: 5, nextDirection: 'l', nextRelativePosition: ((positionUnindexed-((sideLength*sideLength)-sideLength))*sideLength) - 1},
			{nextSide: 5, nextDirection: 'u', nextRelativePosition: (sideLength*sideLength) - (positionUnindexed-((sideLength*sideLength)-sideLength)-1) - 1},
			{nextSide: 5, nextDirection: 'r', nextRelativePosition: (((sLsQ-positionUnindexed)*sideLength)+1) - 1},
			{nextSide: 0, nextDirection: 'd', nextRelativePosition: (positionUnindexed-((sideLength*sideLength)-sideLength)) - 1},
			{nextSide: 2, nextDirection: 'u', nextRelativePosition: (sLsQ-((positionUnindexed-(sLsQ-sideLength))-1)) - 1}
		]
		
		if(current.relativePosition < ((sideLength*sideLength) - sideLength)) {
			nextPosition.position = current.relativePosition+sideLength;
		} else {
			let currentSideMap = sidesMap[current.side];
			nextPosition = {
        side: currentSideMap.nextSide,
        position: currentSideMap.nextRelativePosition,
        direction: currentSideMap.nextDirection
      }
		}
	}
	return nextPosition;
}

function determineNextDirection(nextPosition) {
  const contains = arrayContains(sideStates[nextPosition.side],nextPosition.position);

  if(nextPosition.direction === 'r') {
    if(contains.contains) {
      sideStates[nextPosition.side].splice( contains.position, 1 );
      return 'u';
    } else {
      sideStates[nextPosition.side].push(nextPosition.position);
      return 'd';
    }
  }
  if(nextPosition.direction === 'l') {
    if(contains.contains) {
      sideStates[nextPosition.side].splice( contains.position, 1 );
      return 'd';
    } else {
      sideStates[nextPosition.side].push(nextPosition.position);
      return 'u';
    }
  }
  if(nextPosition.direction === 'u') {
    if(contains.contains) {
      sideStates[nextPosition.side].splice( contains.position, 1 );
      return 'l';
    } else {
      sideStates[nextPosition.side].push(nextPosition.position);
      return 'r';
    }
  }
  if(nextPosition.direction === 'd') {
    if(contains.contains) {
      sideStates[nextPosition.side].splice( contains.position, 1 );
      return 'r';
    } else {
      sideStates[nextPosition.side].push(nextPosition.position);
      return 'l';
    }
  }
}

function arrayContains(arr,val) {
  for (i in arr) {
    if (arr[i] == val) {
      return { contains: true, position: i };
    }
  }
  return { contains: false, position: -1 };
}
