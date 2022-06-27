"use strict";

let gl;
let normalProgram;
let whitePlaneProgram;
let grayPlaneProgram;

let rectVertBuffer;
let colorBuffer;

let whitePlaneVertBuffer;
let whitePlaneTextureCoordBuffer;

let grayPlaneVertexBuffer;
let grayPlaneTextureCoordBuffer;

let texName;
let rotDegree = 0.0;
let doAnimation = false;


function createNormalRectangle() {
    
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, "attribute vec4 position;\n attribute vec4 colors;\n  varying lowp vec4 colorVarying; uniform mediump float rotDegree; void main(void){ float theta = radians(rotDegree); mat4 rotateMatrix = mat4(cos(theta), sin(theta), 0.0, 0.0, -sin(theta), cos(theta), 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0); mat4 translateMatrix = mat4(1.0, 0.0, 0.0, -0.48, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0); colorVarying = colors; gl_Position = position * rotateMatrix * translateMatrix; }");
    gl.compileShader(vertShader);
    
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, "varying lowp vec4 colorVarying;\n void main(void){ gl_FragColor = colorVarying; }");
    gl.compileShader(fragShader);
    
    normalProgram = gl.createProgram();
    gl.attachShader(normalProgram, vertShader);
    gl.attachShader(normalProgram, fragShader);
    gl.linkProgram(normalProgram);
    
    const rectVertices = new Float32Array([-0.4, 0.4,
                                         -0.4, -0.4,
                                         0.4, 0.4,
                                         0.4, -0.4
                                         ]);
    
    const colors = new Float32Array([0.9, 0.1, 0.1, 1.0,
                                   0.1, 0.9, 0.1, 1.0,
                                   0.1, 0.1, 0.9, 1.0,
                                   0.1, 0.1, 0.1, 1.0
                                   ]);
    
    rectVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rectVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rectVertices, gl.STATIC_DRAW);
    
    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
}

function createCommonTexture() {
    texName = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texName);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    // 注意！这里可能会出现文件访问跨域问题！
    // 对Chrome浏览器快捷方式属性中的“目标(T)”后面追加：`  --allow-file-access-from-files` 即可解决
    let image = document.getElementById("texture");
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

function createWhitePlane() {
    
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, "attribute vec4 position; attribute vec2 textureCoordsInput;\n varying mediump vec2 textureCoords; uniform mediump float rotDegree; void main(){ float theta = radians(rotDegree); mat4 rotateMatrix = mat4(cos(theta), 0.0, sin(theta), 0.0, 0.0, 1.0, 0.0, 0.0, -sin(theta), 0, cos(theta), 0.0, 0.0, 0.0, 0.0, 1.0); mat4 translateMatrix = mat4(1.0, 0.0, 0.0, 0.5, 0.0, 1.0, 0.0, 0.5, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0); textureCoords = textureCoordsInput; gl_Position = position * rotateMatrix * translateMatrix; }");
    gl.compileShader(vertShader);
    
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, "varying mediump vec2 textureCoords;\n uniform sampler2D texSampler;\n void main(){ lowp vec4 color = texture2D(texSampler, textureCoords.st); gl_FragColor = color; }");
    gl.compileShader(fragShader);
    
    whitePlaneProgram = gl.createProgram();
    gl.attachShader(whitePlaneProgram, vertShader);
    gl.attachShader(whitePlaneProgram, fragShader);
    gl.linkProgram(whitePlaneProgram);
    
    const rectVertices = new Float32Array([-0.4, 0.4,
                                         -0.4, -0.4,
                                         0.4, 0.4,
                                         0.4, -0.4
                                         ]);
    
    const texCoords = new Float32Array([0.0, 0.0,
                                      0.0, 0.336,
                                      0.382, 0.0,
                                      0.382, 0.336]);
    
    whitePlaneVertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, whitePlaneVertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rectVertices, gl.STATIC_DRAW);
    
    whitePlaneTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, whitePlaneTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
}

function createGrayPlane() {
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, "attribute vec4 position; attribute vec2 textureCoordsInput;\n varying mediump vec2 textureCoords; uniform mediump float rotDegree; void main(){ float theta = radians(rotDegree); mat4 rotateMatrix = mat4(1.0, 0.0, 0.0, 0.0, 0.0, cos(theta), -sin(theta), 0.0, 0.0, sin(theta), cos(theta), 0.0, 0.0, 0.0, 0.0, 1.0); mat4 translateMatrix = mat4(1.0, 0.0, 0.0, 0.5, 0.0, 1.0, 0.0, -0.5, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0); textureCoords = textureCoordsInput; gl_Position = position * rotateMatrix * translateMatrix; }");
    gl.compileShader(vertShader);
    
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, "varying mediump vec2 textureCoords;\n uniform sampler2D texSampler;\n void main(){ lowp vec4 color = texture2D(texSampler, textureCoords.st); gl_FragColor = color; }");
    gl.compileShader(fragShader);
    
    grayPlaneProgram = gl.createProgram();
    gl.attachShader(grayPlaneProgram, vertShader);
    gl.attachShader(grayPlaneProgram, fragShader);
    gl.linkProgram(grayPlaneProgram);
    
    const rectVertices = new Float32Array([-0.4, 0.4,
                                         -0.4, -0.4,
                                         0.4, 0.4,
                                         0.4, -0.4
                                         ]);
    
    const texCoords = new Float32Array([0.4, 0.0,
                                      0.4, 0.382,
                                      0.837, 0.0,
                                      0.837, 0.382]);
    
    grayPlaneVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, grayPlaneVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, rectVertices, gl.STATIC_DRAW);
    
    grayPlaneTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, grayPlaneTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
}

function doGLInit()
{
    let canvas = document.getElementById("canvas");

    canvas.width = 320 * window.devicePixelRatio;
    canvas.height = 320 * window.devicePixelRatio;
    
    gl = canvas.getContext("webgl", {antialias:true});
    
    createNormalRectangle();
    createCommonTexture();
    createWhitePlane();
    createGrayPlane();
    
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    
    gl.clearColor(0.4, 0.5, 0.4, 1.0);
    
    gl.frontFace(gl.CCW);
    
    gl.enable(gl.BLEND);
    
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // 绘制普通的梯度渐变正方形
    gl.useProgram(normalProgram);
    
    gl.enable(gl.CULL_FACE);
    
    let posAttr = gl.getAttribLocation(normalProgram, "position");
    gl.enableVertexAttribArray(posAttr);
    
    const colorAttr = gl.getAttribLocation(normalProgram, "colors");
    gl.enableVertexAttribArray(colorAttr);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, rectVertBuffer);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttr, 4, gl.FLOAT, false, 0, 0);
    
    let rotLocation = gl.getUniformLocation(normalProgram, "rotDegree");
    gl.uniform1f(rotLocation, rotDegree);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // 准备纹理
    gl.bindTexture(gl.TEXTURE_2D, texName);
    
    gl.disable(gl.CULL_FACE);
    
    // 绘制白色飞机
    gl.useProgram(whitePlaneProgram);
    
    posAttr = gl.getAttribLocation(whitePlaneProgram, "position");
    gl.enableVertexAttribArray(posAttr);
    
    let texAttr = gl.getAttribLocation(whitePlaneProgram, "textureCoordsInput");
    gl.enableVertexAttribArray(texAttr);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, whitePlaneVertBuffer);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, whitePlaneTextureCoordBuffer);
    gl.vertexAttribPointer(texAttr, 2, gl.FLOAT, false, 0, 0);
    
    rotLocation = gl.getUniformLocation(whitePlaneProgram, "rotDegree");
    gl.uniform1f(rotLocation, rotDegree);
    
    let samplerLocation = gl.getUniformLocation(whitePlaneProgram, "texSampler");
    gl.uniform1i(samplerLocation, 0);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // 绘制灰色飞机
    gl.useProgram(grayPlaneProgram);
    
    posAttr = gl.getAttribLocation(grayPlaneProgram, "position");
    gl.enableVertexAttribArray(posAttr);
    
    texAttr = gl.getAttribLocation(grayPlaneProgram, "textureCoordsInput");
    gl.enableVertexAttribArray(texAttr);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, grayPlaneVertexBuffer);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, grayPlaneTextureCoordBuffer);
    gl.vertexAttribPointer(texAttr, 2, gl.FLOAT, false, 0, 0);
    
    rotLocation = gl.getUniformLocation(grayPlaneProgram, "rotDegree");
    gl.uniform1f(rotLocation, rotDegree);
    
    samplerLocation = gl.getUniformLocation(grayPlaneProgram, "texSampler");
    gl.uniform1i(samplerLocation, 0);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    rotDegree += 1.0;
    if(rotDegree >= 360.0) {
        rotDegree = 0.0;
    }
    
    if(doAnimation) {
        requestAnimationFrame(render);
    }
}

function drawMyGLCanvas() {
    if(!doAnimation) {
        doAnimation = true;
        render();
    }
}

function stopDraw() {
    doAnimation = false;
}

