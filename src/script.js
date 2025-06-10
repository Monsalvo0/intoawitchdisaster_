import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

console.log(waterVertexShader);
console.log(waterFragmentShader);

console.log(gsap);
/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#221c69')

const gltfLoader = new GLTFLoader()


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

const waterGeometry = new THREE.CircleGeometry(0.73, 128); // 0.73

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uBigWavesElevation: { value: 0.252 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },
        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 4 },
        uDepthColor: { value: new THREE.Color('#004147') },
        uSurfaceColor: { value: new THREE.Color('#00c4d6') },
        uColorOffset: { value: 0.043 },
        uColorMultiplier: { value: 3.218 }
    }
})

const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
water.position.set(1.4, 1.3, 3.7)
// No lo agregues aún a la escena

let waterVisible = false

window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const instructions = document.getElementById('instructions');
        if (instructions) {
            instructions.style.opacity = '0';
            setTimeout(() => instructions.style.display = 'none', 500);
        }
    }
    // Toggle water con la tecla 'c'
    if (event.key === 'c' || event.key === 'C') {
        waterVisible = !waterVisible
        if (waterVisible) {
            scene.add(water)
        } else {
            scene.remove(water)
        }
    }
})

/**
 * Objetos para testear ubicacion


const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
const tester = new THREE.Mesh(boxGeometry, boxMaterial)
tester.position.set(0, 4, 5.5)
scene.add(tester) 

const testerGeometry = new THREE.BoxGeometry(1, 1, 1)
const testerMaterial = new THREE.MeshStandardMaterial({ color:0x0000ff })
const prueba = new THREE.Mesh(testerGeometry, testerMaterial)
prueba.position.set(0,2.5,0)
scene.add(prueba) */

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// PON ESTO ARRIBA, ANTES DE LA CÁMARA
var cameraPositions = [
    new THREE.Vector3(7, 3, 1), // inicial = 0
    new THREE.Vector3(1, 3, 5.5), // caldero = 1
    new THREE.Vector3(-0.4, 3, 3.1), // books = 2
    new THREE.Vector3(-1, 3, 1.5)  // librero = 3
];

var cameraTarget = [
    new THREE.Vector3(0, 2, 1), // inicial = 0
    new THREE.Vector3(1.5, 1.5, 3.8), // caldero = 1
    new THREE.Vector3(-1.8, 2, 3.1), // books = 2
    new THREE.Vector3(-1.15, 2, -2)  // librero = 3
]

// AHORA CREA LA CÁMARA
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.copy(cameraPositions[0])
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableRotate = false
controls.enableZoom = false
controls.enablePan = false

controls.target.copy(cameraTarget[0])
controls.update()

// Centra la escena ajustando el target y la posición de la cámara
const mediumShotPosition = new THREE.Vector3(1, 4, 10); // Puedes ajustar la altura y distancia
const mediumShotTarget = new THREE.Vector3(1, 4, 10);   // Centra el target en Y=1 (ajusta según tu modelo)

const originalCameraPosition = mediumShotPosition.clone();
const originalTarget = mediumShotTarget.clone();

controls.update();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Modelo GLTF
 */
gltfLoader.load(
    '/models/ESCENARIO_texturas.gltf',
    (gltf) => {
        // Muestra toda la estructura del modelo en la consola
        console.log('GLTF:', gltf);

        // Busca el mesh llamado "Cauldron" (con mayúscula)
        let cauldronMesh = gltf.scene.getObjectByName('Cauldron');
        if (!cauldronMesh) {
            cauldronMesh = gltf.scene.children[0];
        }
        window.cauldron = cauldronMesh;

        // Busca el mesh llamado "Book" (con mayúscula)
        let bookMesh = gltf.scene.getObjectByName('Book');
        if (!bookMesh) {
            bookMesh = gltf.scene.children[1];
        }
        window.book = bookMesh;

        // Busca el mesh llamado "Bookshelf"
        let bookshelfMesh = gltf.scene.getObjectByName('BookShelf');
        if (!bookshelfMesh) {
            bookshelfMesh = gltf.scene.children[2]; // Ajusta el índice si es necesario
        }
        window.bookshelf = bookshelfMesh;

        scene.add(gltf.scene);
    }
)

// Puedes reutilizar el gltfLoader que ya tienes

let potions = [];
let potionsBaseY = [];
let potionsBaseX = [];
let potionsBaseZ = [];
let followMouse = false;
let mouseWorld = new THREE.Vector3(0, 0, 0);

// Al cargar las pociones, guarda las referencias globalmente
gltfLoader.load(
    '/models/poisons_textures.gltf',
    (gltf) => {
        console.log('GLTF poisons:', gltf);

        const positions = [
            [-2.1, 0.38, 1.5],
            [-1.2, 0.38, 2.3],
            [-0.5, 0.38, 0.9],
            [0.2, 0.38, 1.8],
            [1.0, 0.38, 2.7],
            [1.8, 0.38, 1.2],
            [2.3, 0.38, 3.0],
            [0.7, 0.38, 3.5],
            [-1.7, 0.38, 3.2],
            [1.5, 0.38, 0.5]
        ];

        potions = [];
        potionsBaseY = [];
        potionsBaseX = [];
        potionsBaseZ = [];

        for (let i = 0; i <= 9; i++) {
            if (gltf.scene.children[i] && positions[i]) {
                gltf.scene.children[i].position.set(...positions[i]);
                gltf.scene.children[i].rotation.y = Math.random() * Math.PI * 2;
                potions.push(gltf.scene.children[i]);
                potionsBaseY.push(positions[i][1]);
                potionsBaseX.push(positions[i][0]);
                potionsBaseZ.push(positions[i][2]);
            }
        }

        gltf.scene.position.set(0, 0, 0);
        gltf.scene.scale.set(1, 1, 1);
        scene.add(gltf.scene);
    },
    undefined,
    (error) => {
        console.error('Error cargando el modelo:', error);
    }
);

// Mouse tracking para seguir el mouse en el plano XZ
window.addEventListener('mousemove', (event) => {
    if (!followMouse) return;
    const mouseNDC = new THREE.Vector2(
        (event.clientX / sizes.width) * 2 - 1,
        -(event.clientY / sizes.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseNDC, camera);
    const planeY = 0.38;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
    raycaster.ray.intersectPlane(plane, mouseWorld);
});

// Toggle followMouse con la tecla 'm'
window.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') {
        followMouse = !followMouse;
        // Si se desactiva, regresa a la posición original
        if (!followMouse && potions.length > 0) {
            for (let i = 0; i < potions.length; i++) {
                potions[i].position.x = potionsBaseX[i];
                potions[i].position.z = potionsBaseZ[i];
            }
        }
    }
});

// Raycaster y vector para el mouse
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()


let bookshelfClickTime = 0;
let bookshelfClickTimeout = null;

canvas.addEventListener('click', (event) => {
    if (!window.cauldron || !window.book) return

    // Normaliza coordenadas del mouse
    mouse.x = (event.clientX / sizes.width) * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersectsCauldron = raycaster.intersectObject(window.cauldron, true)
    const intersectsBook = raycaster.intersectObject(window.book, true)
    const intersectsBookshelf = raycaster.intersectObject(window.bookshelf, true);

    // Doble click sobre bookshelf para ocultar pociones si están siguiendo el mouse
    if (intersectsBookshelf && intersectsBookshelf.length > 0) {
        const now = Date.now();
        if (bookshelfClickTimeout && (now - bookshelfClickTime) < 400) {
            // Doble click detectado
            if (followMouse && potions.length > 0) {
                for (let i = 0; i < potions.length; i++) {
                    potions[i].visible = false;
                }
            }
            bookshelfClickTimeout = null;
        } else {
            bookshelfClickTime = now;
            bookshelfClickTimeout = setTimeout(() => {
                bookshelfClickTimeout = null;
            }, 400);
        }
    } else if (intersectsCauldron.length > 0) {
        animateCamera(1);
    } else if (intersectsBook.length > 0) {
        focusOnBook();
        console.log('focusonbook')
    } else {
        animateCamera(0);
    }
});


function focusOnBook() {
    animateCamera(2);
}

function focusOnBookshelf() {
    animateCamera(3);
}






function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();



function animateCamera(indice) {
    console.log('Animando cámara a la posición:', indice);

    let newTarget = cameraTarget[indice];
    gsap.to(controls.target, {
        x: newTarget.x,
        y: newTarget.y,
        z: newTarget.z,
        duration: 1,
        ease: 'power2.inOut',
        onUpdate: () => controls.update()
    });

    let newPosition = cameraPositions[indice];
    gsap.to(camera.position, {
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        duration: 1,
        ease: 'power2.inOut'
    });
}



window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const instructions = document.getElementById('instructions');
        if (instructions) {
            instructions.style.opacity = '0';
            setTimeout(() => instructions.style.display = 'none', 500);
        }
    }
});

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    // Water
    waterMaterial.uniforms.uTime.value = elapsedTime;
// Pociones flotando y siguiendo el mouse si followMouse es true
    if (potions.length > 0) {
        for (let i = 0; i < potions.length; i++) {
            // Movimiento vertical con sine
            const floatY = potionsBaseY[i] + Math.abs(Math.sin(elapsedTime * 2 + i)) * 0.4;
            potions[i].position.y = Math.max(floatY, potionsBaseY[i]);

            if (followMouse) {
                // Interpolación suave hacia el mouse en XZ
                potions[i].position.x += (mouseWorld.x - potions[i].position.x) * 0.08;
                potions[i].position.z += (mouseWorld.z - potions[i].position.z) * 0.08;
            } else {
                // Regresa suavemente a la posición original en XZ
                potions[i].position.x += (potionsBaseX[i] - potions[i].position.x) * 0.08;
                potions[i].position.z += (potionsBaseZ[i] - potions[i].position.z) * 0.08;
            }
        }
    }


    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();

window.addEventListener('keydown', (event) => {
    if (event.key === '1') {
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.classList.add('hide');
            setTimeout(() => startScreen.style.display = 'none', 500);
        }
    }
});

// Variables para guardar el estado original
let cauldronOriginalEmissive = null;
let bookOriginalEmissive = null;

// Raycaster y mouse ya definidos
canvas.addEventListener('mousemove', (event) => {
    if (!window.cauldron || !window.book) return;

    // Normaliza coordenadas del mouse
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersectsCauldron = raycaster.intersectObject(window.cauldron, true);
    if (intersectsCauldron.length > 0) {
        if (!cauldronOriginalEmissive) {
            cauldronOriginalEmissive = window.cauldron.material.emissive.clone();
        }
        window.cauldron.material.emissive.set(0x44ffcc);
        window.cauldron.material.emissiveIntensity = 0.7;
    } else if (cauldronOriginalEmissive) {
        window.cauldron.material.emissive.copy(cauldronOriginalEmissive);
        window.cauldron.material.emissiveIntensity = 1;
    }

    // Hover libro
    const intersectsBook = raycaster.intersectObject(window.book, true);
    if (intersectsBook.length > 0) {
        if (!bookOriginalEmissive) {
            bookOriginalEmissive = window.book.material.emissive.clone();
        }
        window.book.material.emissive.set(0xffe066);
        window.book.material.emissiveIntensity = 0.7;
    } else if (bookOriginalEmissive) {
        window.book.material.emissive.copy(bookOriginalEmissive);
        window.book.material.emissiveIntensity = 1;
    }
});

// Variables para bookshelf parpadeante
let bookshelfOriginalEmissive = null;
let bookshelfBlinkTimeout = null;
let bookshelfBlinking = false;

canvas.addEventListener('mousemove', (event) => {
    if (!window.cauldron || !window.book || !window.bookshelf) return;

    // Normaliza coordenadas del mouse
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = - (event.clientY / sizes.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Hover caldero (ya tienes este bloque)
    // ...

    // Hover libro (ya tienes este bloque)
    // ...

    // Hover bookshelf (parpadeo dos veces)
    const intersectsBookshelf = raycaster.intersectObject(window.bookshelf, true);
    if (intersectsBookshelf.length > 0) {
        if (!bookshelfBlinking) {
            bookshelfBlinking = true;
            if (!bookshelfOriginalEmissive) {
                bookshelfOriginalEmissive = window.bookshelf.material.emissive.clone();
            }
            let blinkCount = 0;
            let on = false;
            bookshelfBlinkTimeout = setInterval(() => {
                if (on) {
                    window.bookshelf.material.emissive.copy(bookshelfOriginalEmissive);
                } else {
                    window.bookshelf.material.emissive.set(0xfff700);
                }
                on = !on;
                blinkCount++;
                if (blinkCount >= 4) { // 4 cambios = 2 parpadeos
                    clearInterval(bookshelfBlinkTimeout);
                    bookshelfBlinkTimeout = null;
                    setTimeout(() => {
                        window.bookshelf.material.emissive.copy(bookshelfOriginalEmissive);
                        bookshelfBlinking = false;
                    }, 120);
                }
            }, 120);
        }
    } else {
        if (bookshelfBlinkTimeout) {
            clearInterval(bookshelfBlinkTimeout);
            bookshelfBlinkTimeout = null;
        }
        bookshelfBlinking = false;
        if (bookshelfOriginalEmissive) {
            window.bookshelf.material.emissive.copy(bookshelfOriginalEmissive);
        }
    }
});
