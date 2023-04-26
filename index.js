import * as THREE from 'three';
        
import Stats from 'three/addons/libs/stats.module.js';

import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let canvas, bgTexture, renderer, stats, scenes = [];
let iridescenceMetal, img1, img2, img3;

let bgScene, bgCamera, bgRenderer, bgCanvas;
let ambient, light1, light2, light3, cloudParticles = [];

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

init();
animate();

function init() {

    stats = new Stats();
    statsContainer.appendChild(stats.dom);

    const content = document.getElementById('content');

    bgTexture = new EXRLoader().load('examples/textures/cloudy_sky.exr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
    });

    img1 = new THREE.TextureLoader().load('examples/textures/cerveau.jpg');
    img1.encoding = THREE.sRGBEncoding;
    img2 = new THREE.TextureLoader().load('examples/textures/audermars.png');
    img2.encoding = THREE.sRGBEncoding;
    img3 = new THREE.TextureLoader().load('examples/textures/Dior_fullsize.png');
    img3.encoding = THREE.sRGBEncoding;

    const imgs = [img1,img2,img3,img1,img2,img3];
    
    // Iridescence Metal
    iridescenceMetal = new THREE.MeshPhysicalMaterial({
        envMap: bgTexture,
        roughness: 0.1,
        metalness: 0.98,
        emissive: 0,
        iridescence: 1,
        iridescenceIOR: 1.94,
        iridescenceThicknessRange: [100, 400]
    });

    // Background scene
    bgScene = new THREE.Scene();
    if(params.bg == true){bgScene.background = bgTexture;};
    bgScene.environment = bgTexture;
    bgScene.backgroundBlurriness = 0.1;
    if(params.fog == true){bgScene.fog = new THREE.FogExp2(params.fogColor, 0.001);};

    bgCamera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 10000 );
    bgCamera.position.set( 0, 100, 1000 );

    //Lights
    ambient = new THREE.AmbientLight(params.ambientColor);
    bgScene.add(ambient);

    //Clouds
    let cloudGroup1 = new THREE.Group();
    cloudGroup1.position.set(0,50,-250);
    cloudGroup1.rotateZ(0.2);
    bgScene.add(cloudGroup1);

    let cloudGroup2 = new THREE.Group();
    cloudGroup2.position.set(0,-100,100);
    cloudGroup2.rotateZ(-0.1);
    bgScene.add(cloudGroup2);

    const cloudGroups = [cloudGroup1, cloudGroup2];

    let loader = new THREE.TextureLoader();
    loader.load("examples/textures/smoke.png", function (texture) {
        let cloudGeo = new THREE.PlaneGeometry(500, 500);
        let cloudMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true
        });

        for (let g = 0; g < cloudGroups.length; g++){                

            light1 = new THREE.PointLight(params.light1, 100, 450, 1.7);
            light1.position.set(200, 300, 100);
            cloudGroups[g].add(light1);

            light2 = new THREE.PointLight(params.light2, 75, 450, 1.7);
            light2.position.set(-100, 300, -50);
            cloudGroups[g].add(light2);

            light3 = new THREE.PointLight(params.light3, 75, 450, 1.7);
            light3.position.set(0, -300, 100);
            cloudGroups[g].add(light3);
            
            for (let p = 0; p < 50; p++) {
                let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
                cloud.userData.randomRotation = Math.random() * (0.02-0.005) + 0.005;
                cloudParticles.push(cloud);
                cloudGroups[g].add(cloud);
            }
        }
        setClouds();
    });

    function setClouds() {
        cloudParticles.forEach(p => {
            p.position.set(
                Math.random() * 800 - 400,
                Math.random() * 0 - 50,
                Math.random() * 250 - 250
            );
            p.rotation.z = Math.random() * 2 * Math.PI;
            let randomScale = Math.random() * (1-0.5) + 0.5;
            p.scale.set(randomScale,randomScale,randomScale);
            p.material.opacity = Math.random() * (1-0.55) + 0.55;
        });
    }

    // Card scenes
    for (let i = 1; i < 7; i++) {

        const scene = new THREE.Scene();
        scene.environment = bgTexture;

        // make a list item
        const element = document.createElement('div');
        if (i % 2 == 0) {
            element.className = 'element even';
        } else {
            element.className = 'element odd';
        }
        element.innerHTML = '<h2>Element ' + i + '</h2><p>This is some text in a div element.</p>';

        scene.userData.element = element;
        content.appendChild(element);
        
        const camera = new THREE.PerspectiveCamera(55, element.offsetWidth / element.offsetHeight, 1, 1000);
        camera.position.z = 4;
        scene.userData.camera = camera;

        // Medaillon
        let displayCase;
        let card;

        new GLTFLoader()
            .setPath('examples/models/gltf/')
            .setDRACOLoader(new DRACOLoader().setDecoderPath('jsm/libs/draco/gltf/'))
            .load('medaillon_WebGL02.glb', function (gltf) {

                displayCase = gltf.scene;
                displayCase.getObjectByName('DisplayCase_1').material = iridescenceMetal;

                card = displayCase.getObjectByName('DisplayCase_2');
                card.material.emissiveMap = imgs[i-1];
                card.material.emissiveMap.flipY = false;

                scene.add(displayCase);
                scene.userData.displayCase = displayCase;
            });

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(-.45, 0, 1).normalize();
        scene.add(light);

        const light2 = new THREE.DirectionalLight(0xffffff, 10);
        light2.position.set(1, .5, 0).normalize();
        scene.add(light2);

        scenes.push(scene);
    }

    canvas = document.getElementById('c');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setClearColor(0xffffff, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    bgCanvas = document.getElementById('background');
    bgRenderer = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true, alpha: true });
    bgRenderer.setClearColor(0xffffff, 0);
    bgRenderer.setPixelRatio((window.devicePixelRatio));
    bgRenderer.outputEncoding = THREE.sRGBEncoding;
}

function updateSize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    
    renderer.setSize(width, height, false);
}

function animate() {
    stats.update();
    render();
    renderBg();
    requestAnimationFrame(animate);
}

function render() {

    updateSize();

    canvas.style.transform = `translateY(${window.scrollY}px)`;

    renderer.setClearColor(0xffffff, 0);
    renderer.setScissorTest(false);
    renderer.clear();

    renderer.setClearColor(0xffffff, 0);
    renderer.setScissorTest(true);

    scenes.forEach(function (scene) {

        // so something moves
        const displayCase = scene.userData.displayCase;
        if (displayCase != null){
            displayCase.rotation.y -= 0.02;
        }

        // get the element that is a place holder for where we want to draw the scene
        const element = scene.userData.element;

        // get its position relative to the page's viewport
        const rect = element.getBoundingClientRect();

        // check if it's offscreen. If so skip it
        if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
            rect.right < 0 || rect.left > renderer.domElement.clientWidth) {

            return; // it's off screen
        }

        // set the viewport
        const width = rect.right - rect.left;
        const height = rect.bottom - rect.top;
        const left = rect.left;
        const bottom = renderer.domElement.clientHeight - rect.bottom;

        renderer.setViewport(left, bottom, width, height);
        renderer.setScissor(left, bottom, width, height);

        const camera = scene.userData.camera;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.render(scene, camera);
    });
}

function renderBg() {
    
    if(params.animate){
        cloudParticles.forEach(p => {
            p.rotation.z -= p.userData.randomRotation;
            p.position.x -= 1;
            if (p.position.x < -500) {
                p.position.x = 500;
            }
        });
    }
    bgRenderer.render(bgScene, bgCamera);
}