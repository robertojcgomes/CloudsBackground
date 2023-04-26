import * as THREE from 'three';

let scene, camera, cloudParticles = [], renderer;

const params = {
    animate: true,
    bg: true,
    fog: true,
    ambientColor: 0xffffff,
    fogColor: 0x6b97ff,
    dirLight: 0xffffff,
    light1: 0xffffff,
    light2: 0xffffff,
    light3: 0x112527
};

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.set( 0, 100, 1000 );
  
  let ambient = new THREE.AmbientLight(0xffffff);
  scene.add(ambient);

  let light1 = new THREE.PointLight(params.light1, 400, 450, 1.7);
  light1.position.set(200, 300, 100);
  scene.add(light1);

  let bgCanvas = document.getElementById('background');
  renderer = new THREE.WebGLRenderer({canvas: bgCanvas, alpha: true });
  renderer.setSize(window.innerWidth,window.innerHeight);
  scene.fog = new THREE.FogExp2(0x6b97ff, 0.001);
  renderer.outputEncoding = THREE.sRGBEncoding;

  let loader = new THREE.TextureLoader();
  loader.load("examples/textures/smoke.png", function(texture){
    let cloudGeo = new THREE.PlaneGeometry(500,500);
    let cloudMaterial = new THREE.MeshLambertMaterial({
      map:texture,
      transparent: true
    });

    let cloudGroup1 = new THREE.Group();
    cloudGroup1.position.set(0,-50,0);
    cloudGroup1.rotateZ(-0.2);
    scene.add(cloudGroup1);

    for(let p=0; p<25; p++) {
      let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(
        Math.random()*800 -400,
        Math.random() * 0 - 50,
        Math.random() * 100 - 100
      );
      cloud.rotation.z = Math.random()*2*Math.PI;
      let randomScale = Math.random() * (1-0.5) + 0.5;
      cloud.scale.set(randomScale,randomScale,randomScale);
      cloud.userData.randomRotation = Math.random() * (0.02-0.005) + 0.005;
      cloudParticles.push(cloud);
      cloudGroup1.add(cloud);
    }

    let cloudGroup2 = new THREE.Group();
    cloudGroup2.position.set(0,200,-200);
    cloudGroup2.rotateZ(0.3);
    scene.add(cloudGroup2);

    for(let p=0; p<10; p++) {
      let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(
        Math.random()*800 -400,
        Math.random() * 100 - 100,
        Math.random() * 250 - 250
      );
      cloud.rotation.z = Math.random()*2*Math.PI;
      cloud.userData.randomRotation = Math.random() * (0.02-0.005) + 0.005;
      cloudParticles.push(cloud);
      cloudGroup2.add(cloud);
    }
  });
    
    window.addEventListener("resize", onWindowResize, false);
    render();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  cloudParticles.forEach(p => {
    p.rotation.z -= p.userData.randomRotation;
    p.position.x -= 2;
    if (p.position.x < -500) {
        p.position.x = 500;
    }
  });
  renderer.render(scene,camera);
  requestAnimationFrame(render);
}

init();