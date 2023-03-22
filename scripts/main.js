import { drawScene, createProgram } from './script.js';
import { model_F } from '../models/model_F.js';
import { degToRad, radToDeg } from './helper.js';
import { value, slider, button } from './querySelector.js';
import mat4 from './matrix.js';

const main = () => {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#myCanvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var hollowObject = model_F;
  var program = createProgram(gl);
  var translation = [250, 250, 0];
  var rotation = [degToRad(0), degToRad(0), degToRad(0)];
  var scale = [1, 1, 1];
  var zoom = 1.0;
  var cameraAngleRadians = [degToRad(0), degToRad(0), degToRad(0)];
  var center = centerpoint();

  var defTranslation = [...translation];
  var defRotation = [...rotation];
  var defScale = [...scale];
  var defZoom = 1.0;
  var defCameraAngleRadians = [...cameraAngleRadians];

  //setup UI
  defaultSlider();
  slider.slider_transX.oninput = updatePosition(0);
  slider.slider_transY.oninput = updatePosition(1);
  slider.slider_transZ.oninput = updatePosition(2);
  slider.slider_angleX.oninput = updateRotation(0);
  slider.slider_angleY.oninput = updateRotation(1);
  slider.slider_angleZ.oninput = updateRotation(2);
  slider.slider_scaleX.oninput = updateScale(0);
  slider.slider_scaleY.oninput = updateScale(1);
  slider.slider_scaleZ.oninput = updateScale(2);
  slider.slider_zoom.oninput = updateZoom();
  slider.slider_cameraX.oninput = updateCameraAngle(0);
  slider.slider_cameraY.oninput = updateCameraAngle(1);
  slider.slider_cameraZ.oninput = updateCameraAngle(2);

  button.button_reset.onclick = resetState();
  button.button_save.onclick = save();

  button.input_file.onchange = load();

  drawScene(gl,program, hollowObject, translation, rotation, scale, zoom, cameraAngleRadians, center);

  function load() {
    return function(event) {
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = function(event) {
        var contents = event.target.result;
        var data = JSON.parse(contents);;
        hollowObject = data;
        center = centerpoint();
        reset();
      };
      reader.readAsText(file);
    };
  }

  function save() {
    return function(event) {
      var copyObj = JSON.parse(JSON.stringify(hollowObject));
      var matrix = mat4.translate(translation[0], translation[1], translation[2]);
      matrix = mat4.multiply(matrix, mat4.translate(center[0], center[1], center[2]));
      matrix = mat4.multiply(matrix, mat4.xRotate(rotation[0]));
      matrix = mat4.multiply(matrix, mat4.yRotate(rotation[1]));
      matrix = mat4.multiply(matrix, mat4.zRotate(rotation[2]));
      matrix = mat4.multiply(matrix, mat4.scale(scale[0], scale[1], scale[2]));
      matrix = mat4.multiply(matrix, mat4.scale(zoom, zoom, zoom));
      matrix = mat4.multiply(matrix, mat4.translate(-center[0], -center[1], -center[2]));
      for (let i = 0; i < hollowObject.positions.length; i+=3) {
        var res = mat4.multiplyVector(matrix, [hollowObject.positions[i], hollowObject.positions[i+1], hollowObject.positions[i+2], 1]);
        copyObj.positions[i] = res[0];
        copyObj.positions[i+1] = res[1];
        copyObj.positions[i+2] = res[2];
      }
      var data = JSON.stringify(copyObj);
      var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
      var url  = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.download    = "model.json";
      a.href        = url;
      a.textContent = "Download model.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  }

  function updatePosition(index) {
    return function(event) {
      translation[index] = event.target.value;
      if (index == 0)
        value.value_transX.innerHTML = translation[index];
      else if (index == 1)
        value.value_transY.innerHTML = translation[index];
      else
        value.value_transZ.innerHTML = translation[index];
      drawScene(gl,program, hollowObject, translation, rotation, scale, zoom, cameraAngleRadians, center);
    };
  }

  function updateRotation(index) {
    return function(event) {
      var angleInDegrees = event.target.value;
      var angleInRadians = angleInDegrees * Math.PI / 180;
      rotation[index] = angleInRadians;
      if (index == 0)
        value.value_angleX.innerHTML = angleInDegrees;
      else if (index == 1)
        value.value_angleY.innerHTML = angleInDegrees;
      else
        value.value_angleZ.innerHTML = angleInDegrees;
      drawScene(gl,program, hollowObject, translation, rotation, scale, zoom, cameraAngleRadians, center);
    };
  }

  function updateScale(index) {
    return function(event) {
      scale[index] = event.target.value;
      if (index == 0)
        value.value_scaleX.innerHTML = scale[index];
      else if (index == 1)
        value.value_scaleY.innerHTML = scale[index];
      else
        value.value_scaleZ.innerHTML = scale[index];
      drawScene(gl,program, hollowObject, translation, rotation, scale, zoom, cameraAngleRadians, center);
    };
  }

  function updateZoom() {
    return function(event) {
      zoom = event.target.value;
      value.value_zoom.innerHTML = zoom;
      drawScene(gl,program, hollowObject, translation, rotation, scale, zoom, cameraAngleRadians, center);
    };
  }

  function updateCameraAngle(index) {
    return function(event) {
      var angleInDegrees = event.target.value;
      var angleInRadians = angleInDegrees * Math.PI / 180;
      cameraAngleRadians[index] = angleInRadians;
      if (index == 0)
        value.value_cameraX.innerHTML = angleInDegrees;
      else if (index == 1)
        value.value_cameraY.innerHTML = angleInDegrees;
      else
        value.value_cameraZ.innerHTML = angleInDegrees;
      drawScene(gl,program, hollowObject, translation, rotation, scale, zoom, cameraAngleRadians, center);
    };
  }

  function defaultSlider() {
    // set default value innerHTML
    value.value_transX.innerHTML = defTranslation[0];
    value.value_transY.innerHTML = defTranslation[1];
    value.value_transZ.innerHTML = defTranslation[2];
    value.value_angleX.innerHTML = radToDeg(defRotation[0]);
    value.value_angleY.innerHTML = radToDeg(defRotation[1]);
    value.value_angleZ.innerHTML = radToDeg(defRotation[2]);
    value.value_scaleX.innerHTML = defScale[0];
    value.value_scaleY.innerHTML = defScale[1];
    value.value_scaleZ.innerHTML = defScale[2];
    value.value_zoom.innerHTML = zoom;
    value.value_cameraX.innerHTML = radToDeg(cameraAngleRadians[0]);
    value.value_cameraY.innerHTML = radToDeg(cameraAngleRadians[1]);
    value.value_cameraZ.innerHTML = radToDeg(cameraAngleRadians[2]);

    // set default value slider
    slider.slider_transX.value = defTranslation[0];
    slider.slider_transY.value = defTranslation[1];
    slider.slider_transZ.value = defTranslation[2];
    slider.slider_angleX.value = radToDeg(defRotation[0]);
    slider.slider_angleY.value = radToDeg(defRotation[1]);
    slider.slider_angleZ.value = radToDeg(defRotation[2]);
    slider.slider_scaleX.value = defScale[0];
    slider.slider_scaleY.value = defScale[1];
    slider.slider_scaleZ.value = defScale[2];
    slider.slider_zoom.value = zoom;
    slider.slider_cameraX.value = radToDeg(cameraAngleRadians[0]);
    slider.slider_cameraY.value = radToDeg(cameraAngleRadians[1]);
    slider.slider_cameraZ.value = radToDeg(cameraAngleRadians[2]);
  }

  function resetState() {
    return function(event) {
      reset();
    };
  }

  function reset() {
    translation = [...defTranslation];
    rotation = [...defRotation];
    scale = [...defScale];
    zoom = defZoom;
    cameraAngleRadians = [...defCameraAngleRadians];
    defaultSlider();
    drawScene(gl,program, hollowObject, translation, rotation, scale, zoom, cameraAngleRadians, center);
  }

  function centerpoint() {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let i = 0; i < hollowObject.positions.length; i+=3) {
      x += hollowObject.positions[i];
      y += hollowObject.positions[i+1];
      z += hollowObject.positions[i+2];
    }
    x /= hollowObject.positions.length/3;
    y /= hollowObject.positions.length/3;
    z /= hollowObject.positions.length/3;
    return [x, y, z];
  }
}

  
window.onload = main