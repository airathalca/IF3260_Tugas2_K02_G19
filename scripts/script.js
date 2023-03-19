import { drawScene } from './utils.js';
import { model_F } from '../models/model_F.js';

const main = () => {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.querySelector("#myCanvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }
  
    // setup GLSL program
    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

    // Draw the scene.
    drawScene(gl,program, model_F);
  }

  
window.onload = main