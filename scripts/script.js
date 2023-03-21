import { degToRad } from './helper.js';
import mat4 from './matrix.js';

function drawGeometry(gl,program,model){
    // Set up positions buffer
    const positionsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.positions), gl.STATIC_DRAW);

    // Set up colors buffer
    const colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.colors), gl.STATIC_DRAW);

    // Set up attribute pointers
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, true, 0, 0);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, model.positions.length / 3);
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


export function drawScene(gl,program, model, translation, rotation, scale, zoom, angle) {
    resizeCanvasToDisplaySize(gl.canvas);
    gl.clearDepth(1.0);            // Clear everything
    gl.enable(gl.DEPTH_TEST);            // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Set the viewport
    gl.viewport(0.0, 0.0, gl.canvas.clientWidth, gl.canvas.clientHeight);

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
  
    // lookup uniforms
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    var projMatrixLocation = gl.getUniformLocation(program, "u_projMatrix");

    var color = [Math.random(), Math.random(), Math.random(), 1];
    gl.uniform4fv(colorLocation, color);
  
    // Create a buffer to put positions in
    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // Compute the matrices
    var projMatrix = mat4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 1000);
    var matrix = mat4.translate(translation[0], translation[1], translation[2]);
    matrix = mat4.multiply(matrix, mat4.xRotate(rotation[0]));
    matrix = mat4.multiply(matrix, mat4.yRotate(rotation[1]));
    matrix = mat4.multiply(matrix, mat4.zRotate(rotation[2]));
    matrix = mat4.multiply(matrix, mat4.scale(scale[0], scale[1], scale[2]));

    var target = [0, 0, 0];
    var eye = [0, 0, 1];
    var up = [0, 1, 0];

    // Camera Rotation
    var cameraMatrix = mat4.yRotate(angle);
    cameraMatrix = mat4.multiply(cameraMatrix, mat4.translate(...eye))

    var cameraPosition = [
        cameraMatrix[12],
        cameraMatrix[13],
        cameraMatrix[14],
    ];

    cameraMatrix = mat4.lookAt(cameraPosition, target, up);
    var viewMatrix = mat4.inverse(cameraMatrix);

    projMatrix = mat4.multiply(projMatrix, viewMatrix);

    // Zoom
    matrix = mat4.multiply(matrix, mat4.scale(zoom, zoom, zoom));

    // Set the matrix.
    gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    drawGeometry(gl,program,model);
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