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
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

    const normalAttributeLocation = gl.getAttribLocation(program, 'a_normal');
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

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


export function drawScene(gl,program, model, translation, rotation, scale, zoom, camera, center, shading) {
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
    gl.useProgram(program);
  
    // lookup uniforms
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    var projMatrixLocation = gl.getUniformLocation(program, "u_projMatrix");
    var normalLocation = gl.getUniformLocation(program, "u_normal");
    var shadingBool = gl.getUniformLocation(program, "u_shading");

    // Compute the matrices
    var projMatrix = mat4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 1600);
    var matrix = mat4.translate(translation[0], translation[1], translation[2]);
    matrix = mat4.multiply(matrix, mat4.translate(center[0], center[1], center[2]));
    matrix = mat4.multiply(matrix, mat4.xRotate(rotation[0]));
    matrix = mat4.multiply(matrix, mat4.yRotate(rotation[1]));
    matrix = mat4.multiply(matrix, mat4.zRotate(rotation[2]));
    matrix = mat4.multiply(matrix, mat4.scale(scale[0]*zoom, scale[1]*zoom, scale[2]*zoom));
    matrix = mat4.multiply(matrix, mat4.translate(-center[0], -center[1], -center[2]));

    var eye = [0, 0, 5];
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    // Camera Rotation
    var cameraMatrix = mat4.lookAt(eye, target, up);

    var viewMatrix = mat4.inverse(cameraMatrix);

    var modelViewMatrix = mat4.multiply(viewMatrix, matrix);
    projMatrix = mat4.multiply(projMatrix, mat4.translate(gl.canvas.clientWidth / 2, gl.canvas.clientHeight / 2, 0));
    projMatrix = mat4.multiply(projMatrix, mat4.xRotate(camera[0]));
    projMatrix = mat4.multiply(projMatrix, mat4.yRotate(camera[1]));
    projMatrix = mat4.multiply(projMatrix, mat4.zRotate(camera[2]));
    projMatrix = mat4.multiply(projMatrix, mat4.translate(-gl.canvas.clientWidth / 2, -gl.canvas.clientHeight / 2, 0));

    // Compute the normal matrix
    var normalMatrix = mat4.inverse(modelViewMatrix);
    normalMatrix = mat4.transpose(normalMatrix);

    projMatrix = mat4.multiply(projMatrix, mat4.translate(gl.canvas.clientWidth / 2, gl.canvas.clientHeight / 2, 0));
    normalMatrix = mat4.multiply(normalMatrix, mat4.xRotate(camera[0]));
    normalMatrix = mat4.multiply(normalMatrix, mat4.yRotate(camera[1]));
    normalMatrix = mat4.multiply(normalMatrix, mat4.zRotate(camera[2]));
    projMatrix = mat4.multiply(projMatrix, mat4.translate(-gl.canvas.clientWidth / 2, -gl.canvas.clientHeight / 2, 0));

    // Set the matrix.
    gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix);
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.uniformMatrix4fv(normalLocation, false, normalMatrix);
    gl.uniform1i(shadingBool, shading);

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