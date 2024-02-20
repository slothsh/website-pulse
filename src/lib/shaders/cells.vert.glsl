precision highp float;

attribute vec4 aPosition;
// attribute vec4 aColor;
// attribute vec2 aOffset;
// attribute vec4 aGridPosition;

uniform float uDeltaTime;
// uniform vec2 uVelocity;
uniform vec2 uWindowDimensions;
uniform vec2 uCursorPosition;
// uniform vec2 uCursorOffset;
// uniform int uMouseLMBPressed;

// varying highp vec2 vPosition;
// varying highp vec4 vColor;
// varying highp vec2 vOffset;
// varying highp vec4 vGridPosition;
// varying highp float vPointSize;

void main() {
    gl_Position = vec4(aPosition.xy, 1.0, 1.0);
    gl_PointSize = aPosition.z * aPosition.w * 2.0;
    // gl_Position = vec4(aGridPosition.xy, 1.0, 1.0);
    // gl_PointSize = aGridPosition.z * aGridPosition.w * 2.0;
    // vPosition = aPosition;
    // vColor = aColor;
    // vOffset = aOffset;
    // vGridPosition = aGridPosition;
    // vPointSize = aGridPosition.z;
}
