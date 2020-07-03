
/* https://tympanus.net/codrops/2019/09/17/how-to-build-a-color-customizer-app-for-a-3d-model-with-three-js/ */

const TRAY = document.getElementById('js-tray-slide');

let cameraFar = 5;
let theModel;
let activeOption = 'complet';
let loaded = false;


const colors = [
    {
        color: '0080ff'
    },
    {
        color: 'ffff00'
    },
    {
        color: '00ff40'
    },
    {
        color: '27548D'
    },
    {
        color: 'ff0000'
    }  
];

const DRAG_NOTICE = document.getElementById('js-drag-notice');

const BACKGROUND_COLOR = 0xf1f1f1 ;
// const MODEL_PATH =  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/chair.glb";
const MODEL_PATH =  "../textures/scene.glb";

// Initial material
const INITIAL_MTL = new THREE.MeshPhongMaterial( { color: 0xf1f1f1, shininess: 10 } );

const INITIAL_MAP = [
    {childID: "arriere", mtl: INITIAL_MTL},
    {childID: "avant", mtl: INITIAL_MTL},
    {childID: "complet", mtl: INITIAL_MTL},
  ];

// Init the scene 
const scene = new THREE.Scene();

// Set background
scene.background = new THREE.Color(BACKGROUND_COLOR );
scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

const canvas = document.querySelector('#c');

// Init the renderer
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio); 

document.body.appendChild(renderer.domElement);

// Add a camera
let camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = cameraFar;
camera.position.x = 2;
camera.position.y = 8;

// Init the object loader
let loader = new THREE.GLTFLoader();

loader.load(MODEL_PATH, function(gltf) {

    theModel = gltf.scene;

    theModel.traverse((o) => {
        if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
        }
    });

    // Set the models initial scale   
    theModel.scale.set(0.05,0.05,0.05);

    /* 
        Three.js ne prend pas en charge des degrés autant que je sache, tout le monde semble utiliser Math.PI. . 
        Cela équivaut à 180 degrés, donc si vous voulez quelque chose à un angle de 45 degrés, 
        vous utiliserez Math.PI / 4.
    */
    theModel.rotation.y = Math.PI;

    // Offset the y position a bit
    theModel.position.y = -1;

    // Set initial textures
    for (let object of INITIAL_MAP) {
        initColor(theModel, object.childID, object.mtl);
    }

    // Add the model to the scene
    scene.add(theModel);

    }, undefined, function(error) {
    console.error(error)
});

// Function - Add the textures to the models
const initColor = (parent, type, mtl) => {
    parent.traverse((o) => {
     if (o.isMesh) {
       if (o.name.includes(type)) {
            o.material = mtl;
            o.nameID = type; // Set a new property to identify this object
         }
     }
   });
  }

// Add lights
let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.61 );
    hemiLight.position.set( 0, 50, 0 );

// Floor
let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
let floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xeeeeee, // <------- Here
  shininess: 0
});


let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -1;
scene.add(floor);

// Add hemisphere light to scene   
scene.add( hemiLight );

let dirLight = new THREE.DirectionalLight( 0xffffff, 0.54 );
    dirLight.position.set( -8, 12, 8 );
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);

// Add directional Light to scene    
scene.add( dirLight );

// Add controls
let controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
controls.autoRotateSpeed = 0.2; // 30


const resizeRendererToDisplaySize = (renderer) => {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;
  
    const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      
      renderer.setSize(width, height, false);
    }
    return needResize;
};

const animate = () => {

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    

  }
  
  animate();


// Function - Build Colors
const buildColors = (colors) => {
    for (let [i, color] of colors.entries()) {
      let swatch = document.createElement('div');
      swatch.classList.add('tray__swatch');
  
        swatch.style.background = "#" + color.color;
  
      swatch.setAttribute('data-key', i);
      TRAY.append(swatch);
    }
};
  
buildColors(colors);

// Sélectionne la "couleur"
const selectSwatch = (e) => {
    let color = colors[parseInt(e.target.dataset.key)];
    let new_mtl;

     new_mtl = new THREE.MeshPhongMaterial({
         color: parseInt('0x' + color.color),
         shininess: color.shininess ? color.shininess : 10
       });
   
   setMaterial(theModel, activeOption, new_mtl);
};

const setMaterial = (parent, type, mtl) => {
    parent.traverse((o) => {

        console.log(o)
        console.log("o.nameID : " + o.nameID);
        console.log("o.isMesh : " + o.isMesh);

     if (o.isMesh && o.nameID != null) {
       if (o.nameID == type) {
            o.material = mtl;
         }
     }
   });
  };

const swatches = document.querySelectorAll(".tray__swatch");

for (const swatch of swatches) {
  swatch.addEventListener('click', selectSwatch);
}

// Select Option
const options = document.querySelectorAll(".option");

const selectOption = (e) => {
    let option = e.target;
    activeOption = e.target.dataset.option;
    for (const otherOption of options) {
      otherOption.classList.remove('--is-active');
    }
    option.classList.add('--is-active');
  }

  
for (const option of options) {
  option.addEventListener('click',selectOption);
}

