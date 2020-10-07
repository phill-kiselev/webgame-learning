import {LoaderSupport} from 'three.js\examples\jsm\loaders\LoaderSupport.js';
import {OBJLoader2} from '././././three.js/examples/jsm/loaders/OBJLoader2.js';
import {MTLLoader} from '././././three.js/examples/jsm/loaders/MTLLoader.js';

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


    var renderer = new THREE.WebGLRenderer({canvas: canvas});
    renderer.setClearColor(0x000000);

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(45, width / (height-20), 0.1, 5000);
    camera.position.set(0, 0, 1000);

    var light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    //var geometry = new THREE.SphereGeometry(200, 12, 12);
    //var material = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors});

    //for (var i=0; i<geometry.faces.length; i++) {
    //    geometry.faces[i].color.setRGB(Math.random(), Math.random(), Math.random())
    //}

    //var mesh = new THREE.Mesh(geometry, material);
    //scene.add(mesh);

    const objLoader = new OBJLoader2();
    objLoader.loadMtl('.\resources\models\knight\KnightCharacter.mtl', null, (materials) => {
      materials.Material.side = THREE.DoubleSide;
      objLoader.setMaterials(materials);
      objLoader.load('.\resources\models\knight\KnightCharacter.obj', (event) => {
        const root = event.detail.loaderRootNode;
        scene.add(root);
      });
    });

    var before,now,fps;
    before=Date.now();
    fps=0;

    var fpsOut = document.getElementById('fps_count');
    setInterval(function(){
      fpsOut.innerHTML = (fps).toFixed(1) + " fps";
    },1000);

    function loop() {
        now=Date.now();
        fps=Math.round(1000/(now-before));
        before=now;
        //mesh.rotation.y += ball.rotationY;
        renderer.render(scene, camera);
        requestAnimationFrame(function(){loop(); });
    }
    loop();
}