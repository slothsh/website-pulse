#version 300 es

#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable
#endif

#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision highp float;

uniform float uDeltaTime;
uniform vec2 uWindowDimensions;
uniform vec2 uCursorPosition;

// in highp vec2 vPosition;

out vec4 fragColor;

float cc(float value) {
    return value / 255.0;
}

void main() {
    float r = 0.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);

    float x = gl_PointCoord.x;
    float y = gl_PointCoord.y;

    float d = length(cxy);
    float wd = fwidth(d);
    float circle = smoothstep(r + wd, r - wd, d);
    vec3 color = vec3(cc(255.0));
    fragColor = vec4(color, 1.0 - circle);
}
