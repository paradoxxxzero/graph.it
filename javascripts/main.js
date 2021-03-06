(function() {
  var GraphIt, box_size, key, make_axis_lines, make_box_lines, make_plot, make_vertices, precision, region, sign, steps, _i, _len, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  sign = function(x) {
    if (x < 0) {
      return -1;
    } else {
      return 1;
    }
  };

  make_vertices = function(vertices) {
    return vertices.map(function(v) {
      return new THREE.Vector3(v[0], v[1], v[2]);
    });
  };

  steps = 5;

  box_size = 100;

  precision = 100;

  region = {
    x: [-5, 5],
    y: [-5, 5],
    z: [-5, 5]
  };

  make_box_lines = function(h, color) {
    var geometry, material, type;
    geometry = new THREE.Geometry();
    h *= .5;
    geometry.vertices = make_vertices([[-h, -h, -h], [-h, h, -h], [-h, h, -h], [h, h, -h], [h, h, -h], [h, -h, -h], [h, -h, -h], [-h, -h, -h], [-h, -h, h], [-h, h, h], [-h, h, h], [h, h, h], [h, h, h], [h, -h, h], [h, -h, h], [-h, -h, h], [-h, -h, -h], [-h, -h, h], [-h, h, -h], [-h, h, h], [h, h, -h], [h, h, h], [h, -h, -h], [h, -h, h]]);
    geometry.computeLineDistances();
    material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 2
    });
    type = THREE.LinePieces;
    return new THREE.Line(geometry, material, type);
  };

  make_axis_lines = function(h, color) {
    var geometry, material, type;
    geometry = new THREE.Geometry();
    h *= .75;
    geometry.vertices = make_vertices([[0, 0, 0], [-h, 0, 0], [h, 0, 0], [0, 0, 0], [0, -h, 0], [0, h, 0], [0, 0, 0], [0, 0, -h], [0, 0, h], [0, 0, 0]]);
    type = THREE.LinePieces;
    geometry.computeLineDistances();
    material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 2
    });
    return new THREE.Line(geometry, material, type);
  };

  make_plot = function(color) {
    var geometry, mesh, phmaterial;
    geometry = new THREE.PlaneGeometry(box_size, box_size, precision, precision);
    geometry.dynamic = true;
    phmaterial = new THREE.MeshPhongMaterial({
      color: color,
      shading: THREE.SmoothShading,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      specular: color,
      shininess: 10,
      opacity: .4,
      vertexColors: THREE.FaceColors,
      metal: true
    });
    mesh = new THREE.Mesh(geometry, phmaterial);
    return mesh;
  };

  GraphIt = (function() {
    function GraphIt(fun) {
      this.input = __bind(this.input, this);
      this.apply_fun = __bind(this.apply_fun, this);
      this.step = __bind(this.step, this);
      this.animate = __bind(this.animate, this);
      this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, box_size * 100);
      this.camera.position.z = 2.5 * box_size;
      this.controls = new THREE.TrackballControls(this.camera);
      this.controls._rotateStart = new THREE.Vector3(0, -.125, 1);
      this.controls._rotateEnd = new THREE.Vector3(0, .125, 1);
      this.scene = new THREE.Scene();
      this.line = make_box_lines(box_size, 0x5e3fbe);
      this.scene.add(this.line);
      this.axis = make_axis_lines(box_size, 0x5e3fbe);
      this.scene.add(this.axis);
      this.plot = make_plot(0xff5995);
      this.scene.add(this.plot);
      this.hemi_light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
      this.hemi_light.color.setHSL(0.6, 1, 0.6);
      this.hemi_light.groundColor.setHSL(0.095, 1, 0.75);
      this.hemi_light.position.set(0, 0, -500);
      this.scene.add(this.hemi_light);
      this.point_light = new THREE.PointLight(0xffffff, .5, 1000);
      this.point_light.position = this.camera.position;
      this.scene.add(this.point_light);
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      this.renderer.setClearColor(0x1b1d1e);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.controls.addEventListener('change', (function(_this) {
        return function() {
          return _this.renderer.render(_this.scene, _this.camera);
        };
      })(this));
      this.first = true;
      this.time_parametric = false;
      document.body.appendChild(this.renderer.domElement);
    }

    GraphIt.prototype.refresh = function() {
      this.plot.geometry.computeCentroids();
      this.plot.geometry.computeFaceNormals();
      this.plot.geometry.computeVertexNormals();
      this.plot.geometry.normalsNeedUpdate = true;
      this.plot.geometry.verticesNeedUpdate = true;
      return this.renderer.render(this.scene, this.camera);
    };

    GraphIt.prototype.animate = function() {
      requestAnimationFrame(this.animate);
      if (this.dirty) {
        this.step();
      }
      if (this.time_parametric) {
        this.apply_fun(false);
      }
      if (this.dirty || this.time_parametric) {
        this.refresh();
      }
      return this.controls.update();
    };

    GraphIt.prototype.step = function() {
      var v, _i, _len, _ref;
      this.dirty = false;
      if (!steps) {
        return;
      }
      _ref = this.plot.geometry.vertices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        if (v.target == null) {
          return;
        }
        if (abs(v.target - v.z) > abs(v.increment)) {
          v.z += v.increment;
          this.dirty = true;
        } else if (v.z !== v.target) {
          v.z = v.target;
        }
      }
    };

    GraphIt.prototype.apply_fun = function(animate) {
      var v, x, y, z, _i, _len, _ref, _results;
      if (animate == null) {
        animate = true;
      }
      _ref = this.plot.geometry.vertices;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        x = v.x * (region.x[1] - region.x[0]) / box_size;
        y = v.y * (region.y[1] - region.y[0]) / box_size;
        z = this.fun(x, y, ((new Date()).getTime() - this.base_time) / 1000);
        if (animate && steps) {
          v.target = z * box_size / (region.z[1] - region.z[0]);
          _results.push(v.increment = (v.target - v.z) / steps);
        } else {
          _results.push(v.z = z * box_size / (region.z[1] - region.z[0]));
        }
      }
      return _results;
    };

    GraphIt.prototype.input = function(event, fake) {
      var fun, rv, t1, t2, x, y;
      if (event.target.value === '') {
        return;
      }
      try {
        fun = new Function('x', 'y', 't', 'return ' + event.target.value);
        x = random();
        y = random();
        t1 = random();
        t2 = random();
        rv = fun(x, y, t1);
        this.time_parametric = rv !== fun(x, y, t2);
      } catch (_error) {
        return;
      }
      if (typeof rv === 'number' && fun !== this.fun) {
        if (!fake) {
          history.pushState(null, null, '#' + btoa(event.target.value));
        }
        this.base_time = (new Date()).getTime();
        this.fun = fun;
        this.dirty = true;
        if (this.first || this.time_parametric) {
          this.apply_fun(false);
          this.refresh();
        } else {
          this.apply_fun(true);
        }
        return this.first = false;
      }
    };

    return GraphIt;

  })();

  $((function(_this) {
    return function() {
      var fun;
      _this.git = new GraphIt();
      _this.git.animate();
      fun = atob(location.hash.slice(1)) || "cos(x) * sin(y)";
      $('input').on('input', git.input).focus().val(fun).trigger('input', true);
      $(window).resize(function() {
        _this.git.camera.aspect = window.innerWidth / window.innerHeight;
        _this.git.renderer.setSize(window.innerWidth, window.innerHeight);
        _this.git.camera.updateProjectionMatrix();
        _this.git.controls.handleResize();
        return _this.git.renderer.render(_this.git.scene, _this.git.camera);
      });
      return _this.addEventListener("popstate", function() {
        if (location.hash && atob(location.hash.slice(1)) !== $('input').val()) {
          return $('input').val(atob(location.hash.slice(1))).trigger('input', true);
        }
      });
    };
  })(this));

  _ref = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan', 'E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'PI', 'SQRT1_2', 'SQRT2'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    key = _ref[_i];
    window[key.toLowerCase()] = Math[key];
  }

}).call(this);

//# sourceMappingURL=main.js.map
