//import {LoaderSupport} from './three.js/examples/jsm/loaders/LoaderSupport.js';
//import {OBJLoader} from './three.js/examples/jsm/loaders/OBJLoader.js';
//import {MTLLoader} from './three.js/examples/jsm/loaders/MTLLoader.js';
import {OrbitControls} from './three.js-r114/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from './three.js-r114/examples/jsm/loaders/GLTFLoader.js';
import {SkeletonUtils} from './three.js-r114/examples/jsm/utils/SkeletonUtils.js';

const _CAMERA_Z = 80;
let _MOVE_COORDS = {
    ismove: false,
    x: 0,
    y: 0,
}

window.onload = function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var canvas = document.getElementById('canvas');

    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height-20);


    var ball = {
        rotationY: 0
    };

    var gui = new dat.GUI();
    gui.add(ball, 'rotationY').min(-0.2).max(0.2).step(0.001);

      const renderer = new THREE.WebGLRenderer({canvas});
      const fov = 40;
      const aspect = 2;  // the canvas default
      const near = 0.1;
      const far = 1000;
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(0, 40, _CAMERA_Z);

      var X_AXIS = new THREE.Vector3( 1, 0, 0 );
      camera.rotateOnAxis( X_AXIS, -0.5 );

//      const controls = new OrbitControls(camera, canvas);
//      controls.enableKeys = false;
//      controls.target.set(0, 5, 0);
//      controls.update();

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('white');

      {
        const planeSize = 40;

        const loader = new THREE.TextureLoader();
        const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        scene.add(mesh);
      }

      function addLight(...pos) {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...pos);
        scene.add(light);
        scene.add(light.target);
      }
      addLight(5, 5, 2);
      addLight(-5, 5, 5);

      const manager = new THREE.LoadingManager();
      manager.onLoad = init;

      const progressbarElem = document.querySelector('#progressbar');
      manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        progressbarElem.style.width = `${itemsLoaded / itemsTotal * 100 | 0}%`;
      };

      const models = {
        pig:    { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Pig.gltf' },
        cow:    { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Cow.gltf' },
        llama:  { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Llama.gltf' },
        pug:    { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Pug.gltf' },
        sheep:  { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Sheep.gltf' },
        zebra:  { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Zebra.gltf' },
        horse:  { url: 'https://threejsfundamentals.org/threejs/resources/models/animals/Horse.gltf' },
        knight: { url: 'https://threejsfundamentals.org/threejs/resources/models/knight/KnightCharacter.gltf' },
      };
      {
        const gltfLoader = new GLTFLoader(manager);
        for (const model of Object.values(models)) {
          gltfLoader.load(model.url, (gltf) => {
            model.gltf = gltf;
          });
        }
      }

      function prepModelsAndAnimations() {
        Object.values(models).forEach(model => {
          const animsByName = {};
          model.gltf.animations.forEach((clip) => {
            animsByName[clip.name] = clip;
            // Should really fix this in .blend file
            if (clip.name === 'Walk') {
              clip.duration /= 2;
            }
          });
          model.animations = animsByName;
        });
      }

      // Keeps the state of keys/buttons
      //
      // You can check
      //
      //   inputManager.keys.left.down
      //
      // to see if the left key is currently held down
      // and you can check
      //
      //   inputManager.keys.left.justPressed
      //
      // To see if the left key was pressed this frame
      //
      // Keys are 'left', 'right', 'a', 'b', 'up', 'down'
      class InputManager {
        constructor() {
          this.keys = {};
          const keyMap = new Map();

          const setKey = (keyName, pressed) => {
            const keyState = this.keys[keyName];
            keyState.justPressed = pressed && !keyState.down;
            keyState.down = pressed;
          };

          const addKey = (keyCode, name) => {
            this.keys[name] = { down: false, justPressed: false };
            keyMap.set(keyCode, name);
          };

          const setKeyFromKeyCode = (keyCode, pressed) => {
            const keyName = keyMap.get(keyCode);
            if (!keyName) {
              return;
            }
            setKey(keyName, pressed);
          };

//          addKey(37, 'left');
//          addKey(39, 'right');
//          addKey(38, 'up');
//          addKey(40, 'down');
//          addKey(90, 'a');
//          addKey(88, 'b');
//
//          window.addEventListener('keydown', (e) => {
//            setKeyFromKeyCode(e.keyCode, true);
//          });
//          window.addEventListener('keyup', (e) => {
//            setKeyFromKeyCode(e.keyCode, false);
//          });
//
//          const sides = [
//            { elem: document.querySelector('#left'),  key: 'left'  },
//            { elem: document.querySelector('#right'), key: 'right' },
//          ];
//
//          // note: not a good design?
//          // The last direction the user presses should take
//          // precedence. Example: User presses L, without letting go of
//          // L user presses R. Input should now be R. User lets off R
//          // Input should now be L.
//          // With this code if user pressed both L and R result is nothing
//
//          const clearKeys = () => {
//            for (const {key} of sides) {
//                setKey(key, false);
//            }
//          };
//
//          const checkSides = (e) => {
//            for (const {elem, key} of sides) {
//              let pressed = false;
//              const rect = elem.getBoundingClientRect();
//              for (const touch of e.touches) {
//                const x = touch.clientX;
//                const y = touch.clientY;
//                const inRect = x >= rect.left && x < rect.right &&
//                               y >= rect.top && y < rect.bottom;
//                if (inRect) {
//                  pressed = true;
//                }
//              }
//              setKey(key, pressed);
//            }
//          };
//
//          const uiElem = document.querySelector('#ui');
//          uiElem.addEventListener('touchstart', (e) => {
//            e.preventDefault();
//            checkSides(e);
//          }, {passive: false});
//          uiElem.addEventListener('touchmove', (e) => {
//            e.preventDefault();  // prevent scroll
//            checkSides(e);
//          }, {passive: false});
//          uiElem.addEventListener('touchend', () => {
//            clearKeys();
//          });
//
//          function handleMouseMove(e) {
//            e.preventDefault();
//            checkSides({
//              touches: [e],
//            });
//          }
//
//          function handleMouseUp() {
//            clearKeys();
//            window.removeEventListener('mousemove', handleMouseMove, {passive: false});
//            window.removeEventListener('mouseup', handleMouseUp);
//          }
//
//          uiElem.addEventListener('mousedown', (e) => {
//            // this is needed because we call preventDefault();
//            // we also gave the canvas a tabindex so it can
//            // become the focus
//            canvas.focus();
//            handleMouseMove(e);
//            window.addEventListener('mousemove', handleMouseMove);
//            window.addEventListener('mouseup', handleMouseUp);
//          }, {passive: false});
        }
        update() {
          for (const keyState of Object.values(this.keys)) {
            if (keyState.justPressed) {
              keyState.justPressed = false;
            }
          }
        }
      }

      function removeArrayElement(array, element) {
        const ndx = array.indexOf(element);
        if (ndx >= 0) {
          array.splice(ndx, 1);
        }
      }

      class SafeArray {
        constructor() {
          this.array = [];
          this.addQueue = [];
          this.removeQueue = new Set();
        }
        get isEmpty() {
          return this.addQueue.length + this.array.length > 0;
        }
        add(element) {
          this.addQueue.push(element);
        }
        remove(element) {
          this.removeQueue.add(element);
        }
        forEach(fn) {
          this._addQueued();
          this._removeQueued();
          for (const element of this.array) {
            if (this.removeQueue.has(element)) {
              continue;
            }
            fn(element);
          }
          this._removeQueued();
        }
        _addQueued() {
          if (this.addQueue.length) {
            this.array.splice(this.array.length, 0, ...this.addQueue);
            this.addQueue = [];
          }
        }
        _removeQueued() {
          if (this.removeQueue.size) {
            this.array = this.array.filter(element => !this.removeQueue.has(element));
            this.removeQueue.clear();
          }
        }
      }

      class GameObjectManager {
        constructor() {
          this.gameObjects = new SafeArray();
        }
        createGameObject(parent, name) {
          const gameObject = new GameObject(parent, name);
          this.gameObjects.add(gameObject);
          return gameObject;
        }
        removeGameObject(gameObject) {
          this.gameObjects.remove(gameObject);
        }
        update() {
          this.gameObjects.forEach(gameObject => gameObject.update());
        }
      }

      const kForward = new THREE.Vector3(0, 0, 1);
      const globals = {
        time: 0,
        deltaTime: 0,
        moveSpeed: 8,
        camera,
      };
      const gameObjectManager = new GameObjectManager();
      const inputManager = new InputManager();

      class GameObject {
        constructor(parent, name) {
          this.name = name;
          this.components = [];
          this.transform = new THREE.Object3D();
          parent.add(this.transform);
        }
        addComponent(ComponentType, ...args) {
          const component = new ComponentType(this, ...args);
          this.components.push(component);
          return component;
        }
        removeComponent(component) {
          removeArrayElement(this.components, component);
        }
        getComponent(ComponentType) {
          return this.components.find(c => c instanceof ComponentType);
        }
        update() {
          for (const component of this.components) {
            component.update();
          }
        }
      }

      // Base for all components
      class Component {
        constructor(gameObject) {
          this.gameObject = gameObject;
        }
        update() {
        }
      }

      class CameraInfo extends Component {
        constructor(gameObject) {
          super(gameObject);
          this.projScreenMatrix = new THREE.Matrix4();
          this.frustum = new THREE.Frustum();
        }
        update() {
//          const {camera} = globals;
//          this.projScreenMatrix.multiplyMatrices(
//              camera.projectionMatrix,
//              camera.matrixWorldInverse);
//          this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
        }
      }

      class SkinInstance extends Component {
        constructor(gameObject, model) {
          super(gameObject);
          this.model = model;
          this.animRoot = SkeletonUtils.clone(this.model.gltf.scene);
          this.mixer = new THREE.AnimationMixer(this.animRoot);
          gameObject.transform.add(this.animRoot);
          this.actions = {};
        }
        setAnimation(animName) {
          const clip = this.model.animations[animName];
          // turn off all current actions
          for (const action of Object.values(this.actions)) {
            action.enabled = false;
          }
          // get or create existing action for clip
          const action = this.mixer.clipAction(clip);
          action.enabled = true;
          action.reset();
          action.play();
          this.actions[animName] = action;
        }
        update() {
          this.mixer.update(globals.deltaTime);
        }
      }

      class Player extends Component {
        constructor(gameObject) {
          super(gameObject);
          const model = models.knight;
          this.skinInstance = gameObject.addComponent(SkinInstance, model);
          this.skinInstance.setAnimation('Run');
          this.turnSpeed = globals.moveSpeed / 4;
          this.offscreenTimer = 0;
          this.maxTimeOffScreen = 3;
        }
        update() {
          const {deltaTime, moveSpeed} = globals;
          const {transform} = this.gameObject;
//          const delta = (inputManager.keys.left.down  ?  1 : 0) +
//                        (inputManager.keys.right.down ? -1 : 0);
          //const delta = 1;
          //transform.rotation.y += this.turnSpeed * delta * deltaTime;
          //console.log(transform.position);
          let q = _MOVE_COORDS.ismove || ((Math.round(_MOVE_COORDS.x) != Math.round(transform.position.x)) || (Math.round(_MOVE_COORDS.y) != Math.round(transform.position.z)));
          if (q) {
            transform.translateOnAxis(kForward, moveSpeed * deltaTime);
          }
          else {
            _MOVE_COORDS.ismove = false;
            console.log(_MOVE_COORDS);
          }
          //console.log(Math.round(transform.matrixWorld.getPosition().x), Math.round(transform.matrixWorld.getPosition().z));
          //camera.near += this.turnSpeed * delta * deltaTime;
          //camera.far += this.turnSpeed * delta * deltaTime;
          camera.position.x = transform.position.x;
          camera.position.z = transform.position.z + _CAMERA_Z;
          camera.updateProjectionMatrix();

//          const {frustum} = globals.cameraInfo;
//          if (frustum.containsPoint(transform.position)) {
//            this.offscreenTimer = 0;
//          } else {
//            this.offscreenTimer += deltaTime;
//            if (this.offscreenTimer >= this.maxTimeOffScreen) {
//              transform.position.set(0, 0, 0);
//            }
//          }
        }
      }

      function init() {
        // hide the loading bar
        const loadingElem = document.querySelector('#loading');
        loadingElem.style.display = 'none';

        prepModelsAndAnimations();

        {
          const gameObject = gameObjectManager.createGameObject(camera, 'camera');
          globals.cameraInfo = gameObject.addComponent(CameraInfo);
        }

        {
          const gameObject = gameObjectManager.createGameObject(scene, 'player');
          gameObject.addComponent(Player);
        }

        $('#canvas').bind('contextmenu', function (env) {
            var vec = new THREE.Vector3(); // create once and reuse
            var pos = new THREE.Vector3(); // create once and reuse

            vec.set(
                ( env.clientX / window.innerWidth ) * 2 - 1,
                - ( env.clientY / window.innerHeight ) * 2 + 1,
                0.5 );

            vec.unproject( camera );

            vec.sub( camera.position ).normalize();

            var distance = - camera.position.z / vec.z;

            pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

            _MOVE_COORDS.x = pos.x;
            _MOVE_COORDS.y = pos.y;
            _MOVE_COORDS.ismove = true;
            console.log(_MOVE_COORDS);
            return false; //stops the event propigation
        });

      }

//      function resizeRendererToDisplaySize(renderer) {
//        const canvas = renderer.domElement;
//        const width = canvas.clientWidth;
//        const height = canvas.clientHeight;
//        const needResize = canvas.width !== width || canvas.height !== height;
//        if (needResize) {
//          renderer.setSize(width, height, false);
//        }
//        return needResize;
//      }

      let then = 0;
      let now = 0;
      let before = Date.now();
      let fps = 0;
    function loop(now1) {
        // convert to seconds
        globals.time = now1 * 0.001;
        // make sure delta time isn't too big.
        globals.deltaTime = Math.min(globals.time - then, 1 / 20);
        then = globals.time;

//        if (resizeRendererToDisplaySize(renderer)) {
//          const canvas = renderer.domElement;
//          camera.aspect = canvas.clientWidth / canvas.clientHeight;
//          camera.updateProjectionMatrix();
//        }

        gameObjectManager.update();
        inputManager.update();

        now=Date.now();
        fps=Math.round(1000/(now-before));
        before=now;
        //mesh.rotation.y += ball.rotationY;
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}