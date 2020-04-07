import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import { gData } from './builder';
import * as dat from 'dat.gui';

const getRandom = (max=20) => {
  return Math.floor(Math.random() * max);
}

function builder(BuilderFn) {

  const startDistance = 125;
  const maxDistance = 350;

  //Define GUI
  const Settings = function() {
    this.cameraDistance = 700;
    this.cameraSpeed = 50;
    this.cameraAngle = 0;

    const onlyUnique = (value, index, arr) => {
      return arr.indexOf(value) === index;
    }

    Object.values(window.visualizationDataSettings.colors).filter(onlyUnique).forEach(color=> {
      const label = `${color}Distance`;
      this[label] = startDistance;
    });
    this.rotateCamera = false;
    this.rotateX = true;
    this.rotateY = false;
    this.rotateZ = true;
    this.labelSize = 8;
    this.rootLabelSize = 20;
    this.useParticles = false;
    this.randomizeParticleSize = false;
    this.labelColour = '#dddddd';
  };

  const settings = new Settings();
  const gui = new dat.GUI({
    load: window.visualizationSettings
  });
  gui.remember(settings);

  let folder = gui.addFolder('Link distances');
  const colorControllers = [];
  Object.values(window.visualizationDataSettings.colors).forEach(color=> {
    const label = `${color}Distance`;
    const controller = folder.add(settings, label, 0, maxDistance);
    controller.onChange(updateLinkDistance);
  });

  folder = gui.addFolder('Camera');
  const controllerCameraDistance = folder.add(settings, 'cameraDistance', 0, 2500);
  const controllerCameraSpeed = folder.add(settings, 'cameraSpeed', 5, 100);
  const controllerRotateCamera = folder.add(settings, 'rotateCamera');
  const controllerRotateX = folder.add(settings, 'rotateX');
  const controllerRotateY = folder.add(settings, 'rotateY');
  const controllerRotateZ = folder.add(settings, 'rotateZ');

  folder = gui.addFolder('Styling');
  const controllerLabelSizeNormal = folder.add(settings, 'labelSize', 5, 100);
  const controllerLabelSizeRoot = folder.add(settings, 'rootLabelSize', 5, 100);
  const controllerLabelColor = folder.addColor(settings, 'labelColour');

  folder = gui.addFolder('Particles');
  const controllerUseParticles = folder.add(settings, 'useParticles');
  const controllerRandomizeParticleSize = folder.add(settings, 'randomizeParticleSize');

  gui.close();

  controllerCameraDistance.onChange(updateCameraPosition);
  controllerRotateX.onChange(updateCameraPosition);
  controllerRotateY.onChange(updateCameraPosition);
  controllerRotateZ.onChange(updateCameraPosition);
  controllerRotateCamera.onChange(updateCameraRotation);
  controllerCameraSpeed.onChange(updateCameraSpeed);
  controllerLabelSizeNormal.onChange(updateNodes);
  controllerLabelSizeRoot.onChange(updateNodes);
  controllerLabelColor.onChange(updateNodes);
  controllerUseParticles.onChange(useParticles);
  controllerRandomizeParticleSize.onChange(useParticles);

  // Create Random tree
  const graph = BuilderFn()

  (document.getElementById('3d-graph'))
    .nodeLabel(node => node.name)
    // .nodeVal(node => node.name)
    .nodeColor(node => node.color ? node.color : 'pink' )
    .linkColor(link => link.color ? link.color : 'pink' )
    .linkOpacity(1)
    .nodeThreeObject(buildNodeObject)
    .enableNavigationControls(!settings.rotateCamera)
    .showNavInfo(!settings.rotateCamera)
    .cameraPosition({ z: settings.cameraDistance })
    .onNodeClick(focusNode)
    .linkDirectionalParticles(settings.useParticles ? 'value' : 0)
    .linkDirectionalParticleSpeed(d => d.value * 0.001)
    .linkDirectionalParticleWidth(d => d.value * 1)
    .graphData(gData);

  function buildNodeObject(node) {
    // use a sphere as a drag handle
    const obj = new THREE.Mesh(
      new THREE.SphereGeometry(10),
      new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0 })
    );
    // add text sprite as child
    const sprite = new SpriteText(node.name);
    sprite.color = (node.type === 'root') ? node.color : settings.labelColour;
    sprite.textHeight = (node.type === 'root') ? settings.rootLabelSize : settings.labelSize;
    obj.add(sprite);
    return obj;
  }

  function useParticles() {
    if (settings.useParticles) {
      graph.linkDirectionalParticles('value')
        .linkDirectionalParticleSpeed(d => d.value * 0.001);
      if (settings.randomizeParticleSize) {
        graph.linkDirectionalParticleWidth(d => getRandom(20) + 2)
      } else {
        graph.linkDirectionalParticleWidth(d => d.value * 1)
      }
    } else {
      graph.linkDirectionalParticles(0);
    }
  }

  function focusNode(node) {
    stopCameraRotation();
    // Aim at node from outside it
    const distance = 250;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    graph.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      node, // lookAt ({ x, y, z })
      3000  // ms transition duration
    );
  }

  function updateNodes() {
    graph.nodeThreeObject(buildNodeObject);
  }

  let angle = 0;
  let interval;

  const rotateCamera = () => {
    if (!settings.rotateCamera) {
      return;
    }
    updateCameraPosition();
    // angle = (angle % 360) + Math.PI / 300;
    angle  += Math.PI / 300;
  };


  function updateCameraSpeed() {
    stopCameraRotation();
    startCameraRotation();
  }

  function updateCameraPosition() {
    let pos = {};

    if (settings.rotateX) {
      pos.x = settings.cameraDistance * Math.sin(angle);
    }

    if (settings.rotateY) {
      pos.y = settings.cameraDistance * Math.sin(angle);
    }

    if (settings.rotateZ) {
      pos.z = settings.cameraDistance * Math.cos(angle);
    }

    graph.cameraPosition(pos);
  }

  const stopCameraRotation = () => {
    interval && clearInterval(interval);
    graph.enableNavigationControls(true);
    graph.showNavInfo(true);
  }

  const startCameraRotation = () => {
    stopCameraRotation();
    if (settings.rotateCamera) {
      interval = setInterval(rotateCamera , settings.cameraSpeed);
      graph.enableNavigationControls(false);
      graph.showNavInfo(false);
    }
  }

  startCameraRotation();

  const distanceForColor = (link) => {
    switch(link.color) {
      case 'blue':
        return settings.blueDistance;
      case 'red':
        return settings.redDistance;
      case 'green':
        return settings.greenDistance;
      case 'orange':
        return settings.orangeDistance;
      default:
        return 20;
    }
  };

  const linkForce = graph
    .d3Force('link')
    .distance(distanceForColor);

  function updateCameraRotation() {
    startCameraRotation();
  }

  function updateLinkDistance() {
    linkForce.distance(distanceForColor);
    graph.numDimensions(5); // Re-heat simulation
  }

  console.log(gui.getSaveObject());
}

export {
  builder
}
