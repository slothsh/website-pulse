#version 300 es

precision highp float;

in vec4 aPosition;

uniform float uDeltaTime;
uniform vec2 uWindowDimensions;
uniform vec2 uCursorPosition;

// out highp vec2 vPosition;

void main() {
    gl_Position = vec4(aPosition.xy, 1.0, 1.0);
    gl_PointSize = aPosition.z * aPosition.w;
}
