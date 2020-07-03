
const app = {

    TRAY: document.getElementById('js-tray-slide'),
    DRAG_NOTICE: document.getElementById('js-drag-notice'),
    // canvas : document.querySelector('#c'),
    BACKGROUND_COLOR: 0xf1f1f1,
    MODEL_PATH: "../textures/scene.glb",
    INITIAL_MAP: null,
    INITIAL_MTL: null,
    theModel: null,
    scene: null,
    renderer: null,
    camera: null,
    loader: null,
    floor: null,
    activeOption: 'complet',
    cameraFar: 10,
    loaded: false,
    colors: [
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
    ],

    setColor: () => {

        app.INITIAL_MTL = new THREE.MeshPhongMaterial( { color: 0xf1f1f1, shininess: 10 } ); // Initial material
        
        app.INITIAL_MAP = [
            { childID: "arriere", mtl: app.INITIAL_MTL },
            { childID: "avant", mtl: app.INITIAL_MTL },
            { childID: "complet", mtl: app.INITIAL_MTL },
        ];
    },

    // Init the scene
    initScene: () => {

        app.scene = new THREE.Scene();

        // Set background
        app.scene.background = new THREE.Color(app.BACKGROUND_COLOR );
        app.scene.fog = new THREE.Fog(app.BACKGROUND_COLOR, 20, 100);
    },

    // Init the renderer
    initRenderer: () => {

        const canvas = document.querySelector('#c')

        app.renderer = new THREE.WebGLRenderer({ canvas,  antialias: true });
        app.renderer.shadowMap.enabled = true;
        app.renderer.setPixelRatio(window.devicePixelRatio); 

        const container = document.querySelector('.container');
        container.appendChild(app.renderer.domElement);
    },
    
    // Add a camera   
    addCamera: () => {

        app.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000);
        app.camera.position.z = app.cameraFar;
        app.camera.position.x = 1;
        app.camera.position.y = 4;
    },

    initObjLoader: () => {

        app.loader = new THREE.GLTFLoader(); // Init the object loader

        app.loader.load(app.MODEL_PATH, function(gltf) {

            app.theModel = gltf.scene;

            app.theModel.traverse((o) => {
                if (o.isMesh) {
                    o.castShadow = true;
                    o.receiveShadow = true;
                }
            });

            app.theModel.scale.set(0.06,0.06,0.06);  // Set the models initial scale   
            app.theModel.rotation.y = Math.PI;
            app.theModel.position.y = -1; // Offset the y position a bit

            // Set initial textures
            for (let object of app.INITIAL_MAP) {
                app.initColor(app.theModel, object.childID, object.mtl);
            }

            app.scene.add(app.theModel); // Add the model to the scene
            // app2.js:106 TypeError: Cannot read property 'add' of undefined

        }, undefined, function(error) {
            console.error(error)
        });
    },

    initColor: (parent, type, mtl) => {
        // Function - Add the textures to the models
        parent.traverse((o) => {
            if (o.isMesh) {
                if (o.name.includes(type)) {
                    o.material = mtl;
                    o.nameID = type; // Set a new property to identify this object
                }
            }
        });
    },

    // Add Floor & Lights
    addLights: () => {

        app.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.61 );
        app.hemiLight.position.set( 0, 50, 0 );

        // Floor
        let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
        let floorMaterial = new THREE.MeshPhongMaterial({
            color: 0xeeeeee, // <------- Here
            shininess: 0
        });

        app.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        app.floor.rotation.x = -0.5 * Math.PI;
        app.floor.receiveShadow = true;
        app.floor.position.y = -1;
        app.scene.add(app.floor);

        // Add hemisphere light to scene   
        app.scene.add(app.hemiLight);
    },
    
    setDirLight: () => {

        app.dirLight = new THREE.DirectionalLight( 0xffffff, 0.54 );
        app.dirLight.position.set( -8, 12, 8 );
        app.dirLight.castShadow = true;
        app.dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    
        // Add directional Light to scene    
        app.scene.add(app.dirLight);
    },

    // Add controls
    addControls: () => {
        
        app.controls = new THREE.OrbitControls( app.camera, app.renderer.domElement );
        app.controls.maxPolarAngle = Math.PI / 2;
        app.controls.minPolarAngle = Math.PI / 4;
        app.controls.enableDamping = true;
        app.controls.enablePan = false;
        app.controls.dampingFactor = 0.1;
        app.controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
        app.controls.autoRotateSpeed = 0.2; // 30
    },

    resizeRendererToDisplaySize: () => {

        canvas = app.renderer.domElement;
        let width = window.innerWidth;
        let height = window.innerHeight;
        let canvasPixelWidth = canvas.width / window.devicePixelRatio;
        let canvasPixelHeight = canvas.height / window.devicePixelRatio;
      
        const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;

        if (needResize) {
          
          app.renderer.setSize(width, height, false);
        }

        return needResize;
    },

    animate: () => {

        app.controls.update();
        app.renderer.render(app.scene, app.camera);
        requestAnimationFrame(app.animate);
        
        if (app.resizeRendererToDisplaySize(app.renderer)) {
            const canvas = app.renderer.domElement;
            app.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            app.camera.updateProjectionMatrix();
        }
    },

    // Function - Build Colors
    buildColors: (colors) => {

        for (let [i, color] of colors.entries()) {
            let swatch = document.createElement('div');
            swatch.classList.add('tray__swatch');
            swatch.style.background = "#" + color.color;
            swatch.setAttribute('data-key', i);
            app.TRAY.append(swatch);
        };
    },

    // Select color
    selectColor: (e) => {

        const colors = document.querySelectorAll('.tray__swatch');

        for (const otherColor of colors) {
            otherColor.classList.remove('--is-active');
        }

        e.target.classList.add("--is-active");
        
        let color = app.colors[parseInt(e.target.dataset.key)];
        let new_mtl;

        new_mtl = new THREE.MeshPhongMaterial({
            color: parseInt('0x' + color.color),
            shininess: color.shininess ? color.shininess : 10
        });
    
        app.setMaterial(app.theModel, app.activeOption, new_mtl);
    },

    setMaterial: (parent, type, mtl) => {

        parent.traverse((o) => {
           
        // console.log("o.nameID : " + o.nameID);
        // console.log("o.isMesh : " + o.isMesh);
    
         if (o.isMesh && o.nameID != null) {
           if (o.nameID == type) {
                o.material = mtl;
             }
         }
       });
    },

    eventToAction: () => {

        const swatches = document.querySelectorAll(".tray__swatch");
        for (const swatch of swatches) {
          swatch.addEventListener('click', app.selectColor);
        };

        const options = document.querySelectorAll(".option");
        for (const option of options) {
            option.addEventListener('click', app.selectOption);
        }
    },

    selectOption: (e) => {
        // Select Option
        const options = document.querySelectorAll(".option");

        let option = e.target;
        app.activeOption = e.target.dataset.option;

        for (const otherOption of options) {
            otherOption.classList.remove('--is-active');
        }
        option.classList.add('--is-active');
    },

    init : () => {

        app.setColor();
        app.initScene();
        app.initRenderer();
        app.addCamera();
        app.initObjLoader();
        app.addLights();
        app.setDirLight();
        app.addControls();
        app.animate();
        app.buildColors(app.colors);
        app.eventToAction();

        animation.staggersColors();

        console.log("Start");
    },
};

document.addEventListener('DOMContentLoaded', app.init());