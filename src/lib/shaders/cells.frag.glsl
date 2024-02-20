precision highp float;

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
    float r = 0.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);

    float x = gl_PointCoord.x;
    float y = gl_PointCoord.y;
    // float distanceCursor = sqrt(pow((x) - (uCursorPosition.x), 2.0) + pow((y) - (-uCursorPosition.y), 2.0));
    float distanceCursor = distance(gl_PointCoord, vec2(uCursorPosition.x, -uCursorPosition.y));

    if (r > 1.0) {
        discard;
    }

    float falloffStop = distance(gl_PointCoord, vec2(r));
    vec2 edges = smoothstep(falloffStop, r, vec2(r));
    float d = dot(edges, edges);

    vec3 color = vec3((255.0 / 255.0));
    gl_FragColor = vec4(color, max(0.0, 1.0 - (1.0 * r)));
}
