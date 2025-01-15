const colorNames = ['red', 'green', 'blue', 'yellow', 'purple', 'white'];

const getRandom = (max=20) => {
  return Math.floor(Math.random() * max);
}

const pickRandom = (arr) => {
  return arr[
    getRandom(arr.length - 1)
  ];
}

let actorNumber = getRandom(20) + 2;
let actorNames = [];
for (let i=0; i<actorNumber; i++) {
  actorNames.push(`Actor_${i}`);
}

let colors = {};
actorNames.forEach(name => {
  colors[name] = pickRandom(colorNames);
});

let attributeNumber = getRandom(50) + 2;
let attributeNames = [];
for (let i=0; i<attributeNumber; i++) {
  attributeNames.push(`Attribute_${i}`);
}

let visData = {};
actorNames.forEach(name => {
  let res = [];
  for (let i=0; i<getRandom(40); i++) {
    res.push(pickRandom(attributeNames));
  }
  visData[name] = res;
});

window.visualizationSettings = { };
window.visualizationDataSettings = {
  colors: colors,
};

window.visualizationData = visData;

window.graphData = {
  nodes: [
    { id: 1, name: 'Node 1', layer: 'Layer 1', attrs: { type: 'type1' } },
    { id: 2, name: 'Node 2', layer: 'Layer 2', attrs: { type: 'type2' } },
    { id: 3, name: 'Node 3', layer: 'Layer 1', attrs: { type: 'type1' } },
    { id: 4, name: 'Node 4', layer: 'Layer 3', attrs: { type: 'type3' } },
    { id: 5, name: 'Node 5', layer: 'Layer 2', attrs: { type: 'type2' } },
    { id: 6, name: 'Node 6', layer: 'Layer 3', attrs: { type: 'type3' } },
    { id: 7, name: 'Node 7', layer: 'Layer 1', attrs: { type: 'type1' } },
    { id: 8, name: 'Node 8', layer: 'Layer 2', attrs: { type: 'type2' } }
  ],
  links: [
    { source: 1, target: 2, layer: 'Layer 1', attrs: { type: 'typeA' } },
    { source: 2, target: 3, layer: 'Layer 2', attrs: { type: 'typeB' } },
    { source: 3, target: 4, layer: 'Layer 1', attrs: { type: 'typeA' } },
    { source: 4, target: 5, layer: 'Layer 3', attrs: { type: 'typeC' } },
    { source: 5, target: 6, layer: 'Layer 2', attrs: { type: 'typeB' } },
    { source: 6, target: 7, layer: 'Layer 3', attrs: { type: 'typeC' } },
    { source: 7, target: 8, layer: 'Layer 1', attrs: { type: 'typeA' } },
    { source: 8, target: 1, layer: 'Layer 2', attrs: { type: 'typeB' } }
  ]
};
