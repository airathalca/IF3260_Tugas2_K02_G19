import { degToRad } from './helper.js';
import mat4 from './matrix.js';

function drawGeometry(gl,program,model){
    // Set up positions buffer
    const positionsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    var obj = [];
    var matrix = mat4.xRotate(Math.PI);
    matrix = mat4.multiply(matrix, mat4.translate(-50, -75, -15));

    for (var ii = 0; ii < model.positions.length; ii += 3) {
      var vector = mat4.multiplyVector(matrix, [model.positions[ii + 0], model.positions[ii + 1], model.positions[ii + 2], 1]);
      obj.push(vector[0]);
      obj.push(vector[1]);
      obj.push(vector[2]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj), gl.STATIC_DRAW);

    // Set up colors buffer
    const colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.colors), gl.STATIC_DRAW);

    // Set up normals buffer
    const normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);

    // Set up attribute pointers
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, true, 0, 0);

    const normalAttributeLocation = gl.getAttribLocation(program, 'a_normal');
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    // gl.drawArrays(gl.TRIANGLES, 0, model.positions.length / 3);
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
}

function resizeCanvasToDisplaySize(canvas)  {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;
    
    // Check if the canvas is not the same size.
    if (canvas.width  !== displayWidth ||
        canvas.height !== displayHeight) {

        // Make the canvas the same size
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}


export function drawScene(gl, params) {
    resizeCanvasToDisplaySize(gl.canvas);
    gl.clearDepth(1.0);            // Clear everything
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);            // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Set the viewport
    gl.viewport(0.0, 0.0, gl.canvas.clientWidth, gl.canvas.clientHeight);

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(params.program);
  
    // lookup uniforms
    var modelLocation = gl.getUniformLocation(params.program, "u_modelMatrix");
    var viewLocation = gl.getUniformLocation(params.program, "u_viewMatrix");
    var projLocation = gl.getUniformLocation(params.program, "u_projMatrix");
    var normalLocation = gl.getUniformLocation(params.program, "u_normal");
    var shadingBool = gl.getUniformLocation(params.program, "u_shading");
    var fudgeLocation = gl.getUniformLocation(params.program, "u_fudgeFactor");

    // Compute projection matrix
    var projMatrix = mat4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 1600);

    // compute model matrix
    if (params.projType == "perspective") {
        gl.uniform1f(fudgeLocation, params.fudgeFactor);
    }
    else{
        gl.uniform1f(fudgeLocation, 0);
    }

    if (params.projType == "oblique"){
        projMatrix = mat4.multiply(projMatrix, mat4.oblique(degToRad(60), degToRad(105)));
    }
    
    var modelMatrix = mat4.translate(params.translation[0], params.translation[1], params.translation[2]);
    modelMatrix = mat4.multiply(modelMatrix, mat4.translate(params.center[0], params.center[1], params.center[2]));
    modelMatrix = mat4.multiply(modelMatrix, mat4.xRotate(params.rotation[0]));
    modelMatrix = mat4.multiply(modelMatrix, mat4.yRotate(params.rotation[1]));
    modelMatrix = mat4.multiply(modelMatrix, mat4.zRotate(params.rotation[2]));
    modelMatrix = mat4.multiply(modelMatrix, mat4.scale(params.scale[0]*params.zoom, params.scale[1]*params.zoom, params.scale[2]*params.zoom));
    modelMatrix = mat4.multiply(modelMatrix, mat4.translate(-params.center[0], -params.center[1], -params.center[2]));

    // compute view matrix
    var eye = [0, 0, params.cameraRadius];
    // var target = [0, 0, 0];
    // var up = [0, 1, 0];
    var viewMatrix = mat4.identity();
    viewMatrix = mat4.multiply(viewMatrix, mat4.translate(gl.canvas.clientWidth/2, gl.canvas.clientHeight/2, 0));
    viewMatrix = mat4.multiply(viewMatrix, mat4.xRotate(params.cameraAngleRadians[0]));
    viewMatrix = mat4.multiply(viewMatrix, mat4.yRotate(params.cameraAngleRadians[1]));
    viewMatrix = mat4.multiply(viewMatrix, mat4.zRotate(params.cameraAngleRadians[2]));
    viewMatrix = mat4.multiply(viewMatrix, mat4.translate(...eye));
    viewMatrix = mat4.multiply(viewMatrix, mat4.translate(-gl.canvas.clientWidth/2, -gl.canvas.clientHeight/2, 0));
    viewMatrix = mat4.inverse(viewMatrix);

    var modelViewMatrix = mat4.multiply(viewMatrix, modelMatrix);

    // Compute the normal matrix
    var normalMatrix = mat4.inverse(modelViewMatrix);
    normalMatrix = mat4.transpose(normalMatrix);

    normalMatrix = mat4.multiply(normalMatrix, mat4.xRotate(params.cameraAngleRadians[0]));
    normalMatrix = mat4.multiply(normalMatrix, mat4.yRotate(params.cameraAngleRadians[1]));
    normalMatrix = mat4.multiply(normalMatrix, mat4.zRotate(params.cameraAngleRadians[2]));

    // Set the matrix.
    gl.uniformMatrix4fv(projLocation, false, projMatrix);
    gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
    // gl.uniformMatrix4fv(modelLocation, false, modelMatrix);
    gl.uniformMatrix4fv(normalLocation, false, normalMatrix);
    gl.uniform1i(shadingBool, params.shading);

    // Draw the geometry.
    drawGeometry(gl, params.program, params.hollowObject);

    // create 5 model
    for (let i = 0; i < 5; i++) {
      var angle = i * Math.PI * 2 / 5;
      var x = Math.cos(angle) * 100;
      var y = Math.sin(angle) * 100;
      var matrix = mat4.multiply(modelMatrix, mat4.translate(x, 0, y));
      matrix = mat4.multiply(matrix, mat4.scale(0.5, 0.5, 0.5));
      gl.uniformMatrix4fv(modelLocation, false, matrix);

      gl.drawArrays(gl.TRIANGLES, 0, params.hollowObject.positions.length/3);
    }
    return modelViewMatrix;
}

export function createProgram(gl) {
    const program = gl.createProgram();

    //get shader source
    const vertexShaderSource = document.querySelector("#vertex-shader-3d").text;
    const fragmentShaderSource = document.querySelector("#fragment-shader-3d").text;

    //create shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
  
    // Check if it linked.
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
  
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }