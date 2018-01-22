import D3Base from './d3-base';
import d3 from 'npm:d3';
import topojson from 'npm:topojson';

export default D3Base.extend({
  elementClass: 'floating-globe',

  width: 960,
  height: 960,
  speed: -1e-2,
  start: null,
  sphere: null,
  canvas1: null,
  canvas2: null,
  canvas3: null,
  context1: null,
  context2: null,
  context3: null,
  path: null,
  dataUrl: '/json/world-110m.json',

  init() {
    this._super(...arguments);

    this.setProperties({
      start: Date.now(),
      sphere: { type: 'Sphere' },
    });
  },

  didInsertElement() {
    this._super(...arguments);

    this.setProjection();
    this.setGraticule();
    this.setCanvas();
    this.buildCanvas();
    this.setContext();
    this.setPath();
    this.setBaseAttributes();
    this.animateGlobe();
    this.final();
  },

  setProjection() {
    const {
      height,
      width,
    } = this.getProperties(
      'height',
      'width'
    );

    const projection = d3.geo.orthographic()
      .translate([width /2, height / 2])
      .precision(0.5);

    this.set('projection', projection);
  },

  setGraticule() {
    this.set('graticule', d3.geo.graticule());
  },

  setCanvas() {
    const targetElement = this.get('formattedClassName'),
          canvas = 'canvas';

    this.setProperties({
      canvas1: d3.select(targetElement).append(canvas),
      canvas2: d3.select(targetElement).append(canvas).attr('class', 'blur'),
      canvas3: d3.select(targetElement).append(canvas),
    });
  },

  buildCanvas() {
    const {
      height,
      width,
    } = this.getProperties(
      'height',
      'width'
    );

    d3.selectAll('canvas')
      .attr('width', width)
      .attr('height', height);
  },

  setContext() {
    const {
      canvas1,
      canvas2,
      canvas3,
    } = this.getProperties(
      'canvas1',
      'canvas2',
      'canvas3'
    );

    this.setProperties({
      context1: canvas1.node().getContext('2d'),
      context2: canvas2.node().getContext('2d'),
      context3: canvas3.node().getContext('2d'),
    });
  },

  setPath() {
    const projection = this.get('projection');
    const path = d3.geo.path().projection(projection);

    this.set('path', path);
  },

  setBaseAttributes() {
    const {
      context1,
      context2,
      context3,
      path,
      projection,
      sphere,
      width,
    } = this.getProperties(
      'context1',
      'context2',
      'context3',
      'path',
      'projection',
      'sphere',
      'width'
    );

    projection.scale(width / 2.3).clipAngle(90);

    context1.beginPath();
    path.context(context1)(sphere);
    context1.lineWidth = 3;
    context1.strokeStyle = '#000';
    context1.stroke();

    context1.beginPath();
    path(sphere);
    context1.fillStyle = '#fff';
    context1.fill();

    context2.fillStyle = 'rgba(0,0,0,0.4)';
    context3.strokeStyle = 'rgba(0,0,0,0.2)';
  },

  animateGlobe() {
    const {
      dataUrl,
      graticule,
      context2,
      context3,
      width,
      height,
      speed,
      start,
      projection,
      path,
    } = this.getProperties(
      'dataUrl',
      'graticule',
      'context2',
      'context3',
      'width',
      'height',
      'speed',
      'start',
      'projection',
      'path'
    );

    d3.json(dataUrl, (error, topo) => {
      if (error) throw error;

      const land = topojson.feature(topo, topo.objects.land),
            grid = graticule();

      d3.timer(() => {
        context2.clearRect(0, 0, width, height);
        context3.clearRect(0, 0, width, height);

        projection.rotate([speed * (Date.now() - start), -15]);

        projection.scale(width / 2.3).clipAngle(90);

        context2.beginPath();
        path.context(context2)(land);
        context2.fill();

        context3.beginPath();
        path.context(context3)(grid);
        context3.lineWidth = 0.5;
        context3.stroke();

        projection.scale(width / 2.2).clipAngle(106.3);

        context3.beginPath();
        path(land);
        context3.fillStyle = '#737368';
        context3.fill();

        projection.scale(width / 2.2).clipAngle(90);

        context3.beginPath();
        path(land);
        context3.fillStyle = '#dadac4';
        context3.fill();
      });
    });
  },

  final() {
    const height = this.get('height');

    d3.select(self.frameElement).style('height', `${height}px`);
  },
});
