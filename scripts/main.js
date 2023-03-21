import { drawScene, createProgram } from './script.js';
import { model_F } from '../models/model_F.js';
import { degToRad, radToDeg } from './helper.js';
import { value, slider, button } from './querySelector.js';

const main = () => {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#myCanvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = createProgram(gl);
  var translation = [250, 250, 0];
  var rotation = [degToRad(40), degToRad(25), degToRad(325)];
  var scale = [1, 1, 1];
  var zoom = 1.0;
  var cameraAngleRadians = degToRad(0);

  var defTranslation = [...translation];
  var defRotation = [...rotation];
  var defScale = [...scale];
  var defZoom = 1.0;
  var defCameraAngleRadians = degToRad(0);

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
  slider.slider_camera.oninput = updateCameraAngle();

  button.button_reset.onclick = resetState();

  drawScene(gl,program, model_F, translation, rotation, scale, zoom, cameraAngleRadians);

  function updatePosition(index) {
    return function(event) {
      translation[index] = event.target.value;
      if (index == 0)
        value.value_transX.innerHTML = translation[index];
      else if (index == 1)
        value.value_transY.innerHTML = translation[index];
      else
        value.value_transZ.innerHTML = translation[index];
      drawScene(gl,program, model_F, translation, rotation, scale, zoom, cameraAngleRadians);
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
      drawScene(gl,program, model_F, translation, rotation, scale, zoom, cameraAngleRadians);
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
      drawScene(gl,program, model_F, translation, rotation, scale, zoom, cameraAngleRadians);
    };
  }

  function updateZoom() {
    return function(event) {
      zoom = event.target.value;
      value.value_zoom.innerHTML = zoom;
      drawScene(gl,program, model_F, translation, rotation, scale, zoom, cameraAngleRadians);
    };
  }

  function updateCameraAngle() {
    return function(event) {
      cameraAngleRadians = degToRad(event.target.value);
      value.value_camera.innerHTML = Math.round(radToDeg(cameraAngleRadians));
      drawScene(gl,program, model_F, translation, rotation, scale, zoom, cameraAngleRadians);
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
    value.value_camera.innerHTML = radToDeg(cameraAngleRadians);

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
    slider.slider_camera.value = radToDeg(cameraAngleRadians);
  }

  function resetState() {
    return function(event) {
      translation = [...defTranslation];
      rotation = [...defRotation];
      scale = [...defScale];
      zoom = defZoom;
      cameraAngleRadians = defCameraAngleRadians;
      defaultSlider();
      drawScene(gl,program, model_F, translation, rotation, scale, zoom, cameraAngleRadians);
    }
  }
}

  
window.onload = main