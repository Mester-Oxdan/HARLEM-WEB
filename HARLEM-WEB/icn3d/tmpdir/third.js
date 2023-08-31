var $NGL_shaderTextHash = {};

$NGL_shaderTextHash['SphereImpostor.frag'] = ["#define STANDARD",
"#define IMPOSTOR",
"",
"uniform vec3 diffuse;",
"uniform vec3 emissive;",
"uniform float roughness;",
"uniform float metalness;",
"uniform float opacity;",
"uniform float nearClip;",
"uniform mat4 projectionMatrix;",
"uniform float ortho;",
"",
"varying float vRadius;",
"varying float vRadiusSq;",
"varying vec3 vPoint;",
"varying vec3 vPointViewPosition;",
"",
"#ifdef PICKING",
"    uniform float objectId;",
"    varying vec3 vPickingColor;",
"#else",
"    #include common",
"    #include color_pars_fragment",
"    #include fog_pars_fragment",
"    #include bsdfs",
"    #include lights_pars_begin",
"    #include lights_physical_pars_fragment",
"#endif",
"",
"bool flag2 = false;",
"bool interior = false;",
"vec3 cameraPos;",
"vec3 cameraNormal;",
"",
"// Calculate depth based on the given camera position.",
"float calcDepth( in vec3 cameraPos ){",
"    vec2 clipZW = cameraPos.z * projectionMatrix[2].zw + projectionMatrix[3].zw;",
"    return 0.5 + 0.5 * clipZW.x / clipZW.y;",
"}",
"",
"float calcClip( vec3 cameraPos ){",
"    return dot( vec4( cameraPos, 1.0 ), vec4( 0.0, 0.0, 1.0, nearClip - 0.5 ) );",
"}",
"",
"bool Impostor( out vec3 cameraPos, out vec3 cameraNormal ){",
"",
"    vec3 cameraSpherePos = -vPointViewPosition;",
"    cameraSpherePos.z += vRadius;",
"",
"    vec3 rayOrigin = mix( vec3( 0.0, 0.0, 0.0 ), vPoint, ortho );",
"    vec3 rayDirection = mix( normalize( vPoint ), vec3( 0.0, 0.0, 1.0 ), ortho );",
"    vec3 cameraSphereDir = mix( cameraSpherePos, rayOrigin - cameraSpherePos, ortho );",
"",
"    float B = dot( rayDirection, cameraSphereDir );",
"    float det = B * B + vRadiusSq - dot( cameraSphereDir, cameraSphereDir );",
"",
"    if( det < 0.0 ){",
"        discard;",
"        return false;",
"    }",
"        float sqrtDet = sqrt( det );",
"        float posT = mix( B + sqrtDet, B + sqrtDet, ortho );",
"        float negT = mix( B - sqrtDet, sqrtDet - B, ortho );",
"",
"        cameraPos = rayDirection * negT + rayOrigin;",
"",
"        #ifdef NEAR_CLIP",
"if( calcDepth( cameraPos ) <= 0.0 ){",
"    cameraPos = rayDirection * posT + rayOrigin;",
"    interior = true;",
"    return false;",
"}else if( calcClip( cameraPos ) > 0.0 ){",
"    cameraPos = rayDirection * posT + rayOrigin;",
"    interior = true;",
"    flag2 = true;",
"    return false;",
"}else{",
"    cameraNormal = normalize( cameraPos - cameraSpherePos );",
"}",
"        #else",
"if( calcDepth( cameraPos ) <= 0.0 ){",
"    cameraPos = rayDirection * posT + rayOrigin;",
"    interior = true;",
"    return false;",
"}else{",
"    cameraNormal = normalize( cameraPos - cameraSpherePos );",
"}",
"        #endif",
"",
"        cameraNormal = normalize( cameraPos - cameraSpherePos );",
"        cameraNormal *= float(!interior) * 2.0 - 1.0;",
"         return !interior;",
"",
"}",
"",
"void main(void){",
"",
"    bool flag = Impostor( cameraPos, cameraNormal );",
"",
"    #ifdef NEAR_CLIP",
"        if( calcClip( cameraPos ) > 0.0 )",
"            discard;",
"    #endif",
"",
"    // FIXME not compatible with custom clipping plane",
"    //Set the depth based on the new cameraPos.",
"    gl_FragDepthEXT = calcDepth( cameraPos );",
"    if( !flag ){",
"",
"        // clamp to near clipping plane and add a tiny value to",
"        // make spheres with a greater radius occlude smaller ones",
"        #ifdef NEAR_CLIP",
"if( flag2 ){",
"    gl_FragDepthEXT = max( 0.0, calcDepth( vec3( - ( nearClip - 0.5 ) ) ) + ( 0.0000001 / vRadius ) );",
"}else if( gl_FragDepthEXT >= 0.0 ){",
"    gl_FragDepthEXT = 0.0 + ( 0.0000001 / vRadius );",
"}",
"        #else",
"if( gl_FragDepthEXT >= 0.0 ){",
"    gl_FragDepthEXT = 0.0 + ( 0.0000001 / vRadius );",
"}",
"        #endif",
"",
"    }",
"",
"    // bugfix (mac only?)",
"    if (gl_FragDepthEXT < 0.0)",
"        discard;",
"    if (gl_FragDepthEXT > 1.0)",
"        discard;",
"",
"    #ifdef PICKING",
"",
"        gl_FragColor = vec4( vPickingColor, objectId );",
"",
"    #else",
"",
"        vec3 vNormal = cameraNormal;",
"        vec3 vViewPosition = -cameraPos;",
"",
"        vec4 diffuseColor = vec4( diffuse, opacity );",
"        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
"        vec3 totalEmissiveLight = emissive;",
"",
"        #include color_fragment",
"        #include roughnessmap_fragment",
"        #include metalnessmap_fragment",
"",
"        // don't use include normal_fragment",
"        vec3 normal = normalize( vNormal );",
"",
"        #include lights_physical_fragment",
"        //include lights_template",
"        #include lights_fragment_begin",
"        #include lights_fragment_end",
"",
"        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveLight;",
"",
"        gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
"        //gl_FragColor = vec4( reflectedLight.directSpecular, diffuseColor.a );",
"",
"        #include premultiplied_alpha_fragment",
"        #include tonemapping_fragment",
"        #include encodings_fragment",
"        //include fog_fragment",
"        #ifdef USE_FOG",
"            #ifdef USE_LOGDEPTHBUF_EXT",
"                float depth = gl_FragDepthEXT / gl_FragCoord.w;",
"            #else",
"                float depth = gl_FragCoord.z / gl_FragCoord.w;",
"            #endif",
"            #ifdef FOG_EXP2",
"                float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) );",
"            #else",
"                float fogFactor = smoothstep( fogNear, fogFar, depth );",
"            #endif",
"            gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );",
"        #endif",
"",
"    #endif",
"",
"}"
].join("\n");

$NGL_shaderTextHash['SphereImpostor.vert'] = ["uniform mat4 projectionMatrixInverse;",
"uniform float nearClip;",
"",
"varying float vRadius;",
"varying float vRadiusSq;",
"varying vec3 vPoint;",
"varying vec3 vPointViewPosition;",
"varying float fogDepth;",
"varying float fogNear;",
"varying float fogFar;",
"",
"attribute vec2 mapping;",
"//attribute vec3 position;",
"attribute float radius;",
"",
"#ifdef PICKING",
"    #include unpack_clr",
"    attribute float primitiveId;",
"    varying vec3 vPickingColor;",
"#else",
"    #include color_pars_vertex",
"#endif",
"",
"//include matrix_scale",
"float matrixScale( in mat4 m ){",
"    vec4 r = m[ 0 ];",
"    return sqrt( r[ 0 ] * r[ 0 ] + r[ 1 ] * r[ 1 ] + r[ 2 ] * r[ 2 ] );",
"}",
"",
"const mat4 D = mat4(",
"    1.0, 0.0, 0.0, 0.0,",
"    0.0, 1.0, 0.0, 0.0,",
"    0.0, 0.0, 1.0, 0.0,",
"    0.0, 0.0, 0.0, -1.0",
");",
"",
"mat4 transposeTmp( in mat4 inMatrix ) {",
"    vec4 i0 = inMatrix[0];",
"    vec4 i1 = inMatrix[1];",
"    vec4 i2 = inMatrix[2];",
"    vec4 i3 = inMatrix[3];",
"",
"    mat4 outMatrix = mat4(",
"        vec4(i0.x, i1.x, i2.x, i3.x),",
"        vec4(i0.y, i1.y, i2.y, i3.y),",
"        vec4(i0.z, i1.z, i2.z, i3.z),",
"        vec4(i0.w, i1.w, i2.w, i3.w)",
"    );",
"    return outMatrix;",
"}",
"",
"//------------------------------------------------------------------------------",
"// Compute point size and center using the technique described in:",
"// 'GPU-Based Ray-Casting of Quadratic Surfaces'",
"// by Christian Sigg, Tim Weyrich, Mario Botsch, Markus Gross.",
"//",
"// Code based on",
"/*=========================================================================",
"",
" Program:   Visualization Toolkit",
" Module:    Quadrics_fs.glsl and Quadrics_vs.glsl",
"",
" Copyright (c) Ken Martin, Will Schroeder, Bill Lorensen",
" All rights reserved.",
" See Copyright.txt or http://www.kitware.com/Copyright.htm for details.",
"",
" This software is distributed WITHOUT ANY WARRANTY; without even",
" the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR",
" PURPOSE.  See the above copyright notice for more information.",
"",
" =========================================================================*/",
"",
"// .NAME Quadrics_fs.glsl and Quadrics_vs.glsl",
"// .SECTION Thanks",
"// <verbatim>",
"//",
"//  This file is part of the PointSprites plugin developed and contributed by",
"//",
"//  Copyright (c) CSCS - Swiss National Supercomputing Centre",
"//                EDF - Electricite de France",
"//",
"//  John Biddiscombe, Ugo Varetto (CSCS)",
"//  Stephane Ploix (EDF)",
"//",
"// </verbatim>",
"//",
"// Contributions by Alexander Rose",
"// - ported to WebGL",
"// - adapted to work with quads",
"void ComputePointSizeAndPositionInClipCoordSphere(){",
"",
"    vec2 xbc;",
"    vec2 ybc;",
"",
"    mat4 T = mat4(",
"        radius, 0.0, 0.0, 0.0,",
"        0.0, radius, 0.0, 0.0,",
"        0.0, 0.0, radius, 0.0,",
"        position.x, position.y, position.z, 1.0",
"    );",
"",
"    mat4 R = transposeTmp( projectionMatrix * modelViewMatrix * T );",
"    float A = dot( R[ 3 ], D * R[ 3 ] );",
"    float B = -2.0 * dot( R[ 0 ], D * R[ 3 ] );",
"    float C = dot( R[ 0 ], D * R[ 0 ] );",
"    xbc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );",
"    xbc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );",
"    float sx = abs( xbc[ 0 ] - xbc[ 1 ] ) * 0.5;",
"",
"    A = dot( R[ 3 ], D * R[ 3 ] );",
"    B = -2.0 * dot( R[ 1 ], D * R[ 3 ] );",
"    C = dot( R[ 1 ], D * R[ 1 ] );",
"    ybc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );",
"    ybc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );",
"    float sy = abs( ybc[ 0 ] - ybc[ 1 ]  ) * 0.5;",
"",
"    gl_Position.xy = vec2( 0.5 * ( xbc.x + xbc.y ), 0.5 * ( ybc.x + ybc.y ) );",
"    gl_Position.xy -= mapping * vec2( sx, sy );",
"    gl_Position.xy *= gl_Position.w;",
"",
"}",
"",
"void main(void){",
"",
"    #ifdef PICKING",
"        vPickingColor = unpackColor( primitiveId );",
"    #else",
"        #include color_vertex",
"    #endif",
"",
"    vRadius = radius * matrixScale( modelViewMatrix );",
"",
"    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
"    // avoid clipping, added again in fragment shader",
"    mvPosition.z -= vRadius;",
"",
"    gl_Position = projectionMatrix * vec4( mvPosition.xyz, 1.0 );",
"    ComputePointSizeAndPositionInClipCoordSphere();",
"",
"",
"    vRadiusSq = vRadius * vRadius;",
"    vec4 vPoint4 = projectionMatrixInverse * gl_Position;",
"    vPoint = vPoint4.xyz / vPoint4.w;",
"    vPointViewPosition = -mvPosition.xyz / mvPosition.w;",
"",
"}"
].join("\n");

$NGL_shaderTextHash['CylinderImpostor.frag'] = ["#define STANDARD",
"#define IMPOSTOR",
"",
"// Open-Source PyMOL is Copyright (C) Schrodinger, LLC.",
"//",
"//  All Rights Reserved",
"//",
"//  Permission to use, copy, modify, distribute, and distribute modified",
"//  versions of this software and its built-in documentation for any",
"//  purpose and without fee is hereby granted, provided that the above",
"//  copyright notice appears in all copies and that both the copyright",
"//  notice and this permission notice appear in supporting documentation,",
"//  and that the name of Schrodinger, LLC not be used in advertising or",
"//  publicity pertaining to distribution of the software without specific,",
"//  written prior permission.",
"//",
"//  SCHRODINGER, LLC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,",
"//  INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN",
"//  NO EVENT SHALL SCHRODINGER, LLC BE LIABLE FOR ANY SPECIAL, INDIRECT OR",
"//  CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS",
"//  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE",
"//  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE",
"//  USE OR PERFORMANCE OF THIS SOFTWARE.",
"",
"// Contributions by Alexander Rose",
"// - ported to WebGL",
"// - dual color",
"// - pk color",
"// - custom clipping",
"// - three.js lighting",
"",
"uniform vec3 diffuse;",
"uniform vec3 emissive;",
"uniform float roughness;",
"uniform float metalness;",
"uniform float opacity;",
"uniform float nearClip;",
"uniform mat4 projectionMatrix;",
"uniform float ortho;",
"",
"varying vec3 axis;",
"varying vec4 base_radius;",
"varying vec4 end_b;",
"varying vec3 U;",
"varying vec3 V;",
"varying vec4 w;",
"",
"#ifdef PICKING",
"    uniform float objectId;",
"    varying vec3 vPickingColor;",
"#else",
"    varying vec3 vColor1;",
"    varying vec3 vColor2;",
"    #include common",
"    #include fog_pars_fragment",
"    #include bsdfs",
"    #include lights_pars_begin",
"    #include lights_physical_pars_fragment",
"#endif",
"",
"bool interior = false;",
"",
"float distSq3( vec3 v3a, vec3 v3b ){",
"    return (",
"        ( v3a.x - v3b.x ) * ( v3a.x - v3b.x ) +",
"        ( v3a.y - v3b.y ) * ( v3a.y - v3b.y ) +",
"        ( v3a.z - v3b.z ) * ( v3a.z - v3b.z )",
"    );",
"}",
"",
"// Calculate depth based on the given camera position.",
"float calcDepth( in vec3 cameraPos ){",
"    vec2 clipZW = cameraPos.z * projectionMatrix[2].zw + projectionMatrix[3].zw;",
"    return 0.5 + 0.5 * clipZW.x / clipZW.y;",
"}",
"",
"float calcClip( vec3 cameraPos ){",
"    return dot( vec4( cameraPos, 1.0 ), vec4( 0.0, 0.0, 1.0, nearClip - 0.5 ) );",
"}",
"",
"void main(){",
"",
"    vec3 point = w.xyz / w.w;",
"",
"    // unpacking",
"    vec3 base = base_radius.xyz;",
"    float vRadius = base_radius.w;",
"    vec3 end = end_b.xyz;",
"    float b = end_b.w;",
"",
"    vec3 end_cyl = end;",
"    vec3 surface_point = point;",
"",
"    vec3 ray_target = surface_point;",
"    vec3 ray_origin = vec3(0.0);",
"    vec3 ray_direction = mix(normalize(ray_origin - ray_target), vec3(0.0, 0.0, 1.0), ortho);",
"    mat3 basis = mat3( U, V, axis );",
"",
"    vec3 diff = ray_target - 0.5 * (base + end_cyl);",
"    vec3 P = diff * basis;",
"",
"    // angle (cos) between cylinder cylinder_axis and ray direction",
"    float dz = dot( axis, ray_direction );",
"",
"    float radius2 = vRadius*vRadius;",
"",
"    // calculate distance to the cylinder from ray origin",
"    vec3 D = vec3(dot(U, ray_direction),",
"                dot(V, ray_direction),",
"                dz);",
"    float a0 = P.x*P.x + P.y*P.y - radius2;",
"    float a1 = P.x*D.x + P.y*D.y;",
"    float a2 = D.x*D.x + D.y*D.y;",
"",
"    // calculate a dicriminant of the above quadratic equation",
"    float d = a1*a1 - a0*a2;",
"    if (d < 0.0)",
"        // outside of the cylinder",
"        discard;",
"",
"    float dist = (-a1 + sqrt(d)) / a2;",
"",
"    // point of intersection on cylinder surface",
"    vec3 new_point = ray_target + dist * ray_direction;",
"",
"    vec3 tmp_point = new_point - base;",
"    vec3 _normal = normalize( tmp_point - axis * dot(tmp_point, axis) );",
"",
"    ray_origin = mix( ray_origin, surface_point, ortho );",
"",
"    // test caps",
"    float front_cap_test = dot( tmp_point, axis );",
"    float end_cap_test = dot((new_point - end_cyl), axis);",
"",
"    // to calculate caps, simply check the angle between",
"    // the point of intersection - cylinder end vector",
"    // and a cap plane normal (which is the cylinder cylinder_axis)",
"    // if the angle < 0, the point is outside of cylinder",
"    // test front cap",
"",
"    #ifndef CAP",
"        vec3 new_point2 = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;",
"        vec3 tmp_point2 = new_point2 - base;",
"    #endif",
"",
"    // flat",
"    if (front_cap_test < 0.0)",
"    {",
"        // ray-plane intersection",
"        float dNV = dot(-axis, ray_direction);",
"        if (dNV < 0.0)",
"            discard;",
"        float near = dot(-axis, (base)) / dNV;",
"        vec3 front_point = ray_direction * near + ray_origin;",
"        // within the cap radius?",
"        if (dot(front_point - base, front_point-base) > radius2)",
"            discard;",
"",
"        #ifdef CAP",
"            new_point = front_point;",
"            _normal = axis;",
"        #else",
"            new_point = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;",
"            dNV = dot(-axis, ray_direction);",
"            near = dot(axis, end_cyl) / dNV;",
"            new_point2 = ray_direction * near + ray_origin;",
"            if (dot(new_point2 - end_cyl, new_point2-base) < radius2)",
"                discard;",
"            interior = true;",
"        #endif",
"    }",
"",
"    // test end cap",
"",
"",
"    // flat",
"    if( end_cap_test > 0.0 )",
"    {",
"        // ray-plane intersection",
"        float dNV = dot(axis, ray_direction);",
"        if (dNV < 0.0)",
"            discard;",
"        float near = dot(axis, end_cyl) / dNV;",
"        vec3 end_point = ray_direction * near + ray_origin;",
"        // within the cap radius?",
"        if( dot(end_point - end_cyl, end_point-base) > radius2 )",
"            discard;",
"",
"        #ifdef CAP",
"            new_point = end_point;",
"            _normal = axis;",
"        #else",
"            new_point = ray_target + ( (-a1 - sqrt(d)) / a2 ) * ray_direction;",
"            dNV = dot(-axis, ray_direction);",
"            near = dot(-axis, (base)) / dNV;",
"            new_point2 = ray_direction * near + ray_origin;",
"            if (dot(new_point2 - base, new_point2-base) < radius2)",
"                discard;",
"            interior = true;",
"        #endif",
"    }",
"",
"    gl_FragDepthEXT = calcDepth( new_point );",
"",
"    #ifdef NEAR_CLIP",
"        if( calcClip( new_point ) > 0.0 ){",
"            dist = (-a1 - sqrt(d)) / a2;",
"            new_point = ray_target + dist * ray_direction;",
"            if( calcClip( new_point ) > 0.0 )",
"                discard;",
"            interior = true;",
"            gl_FragDepthEXT = calcDepth( new_point );",
"            if( gl_FragDepthEXT >= 0.0 ){",
"                gl_FragDepthEXT = max( 0.0, calcDepth( vec3( - ( nearClip - 0.5 ) ) ) + ( 0.0000001 / vRadius ) );",
"            }",
"        }else if( gl_FragDepthEXT <= 0.0 ){",
"            dist = (-a1 - sqrt(d)) / a2;",
"            new_point = ray_target + dist * ray_direction;",
"            interior = true;",
"            gl_FragDepthEXT = calcDepth( new_point );",
"            if( gl_FragDepthEXT >= 0.0 ){",
"                gl_FragDepthEXT = 0.0 + ( 0.0000001 / vRadius );",
"            }",
"        }",
"    #else",
"        if( gl_FragDepthEXT <= 0.0 ){",
"            dist = (-a1 - sqrt(d)) / a2;",
"            new_point = ray_target + dist * ray_direction;",
"            interior = true;",
"            gl_FragDepthEXT = calcDepth( new_point );",
"            if( gl_FragDepthEXT >= 0.0 ){",
"                gl_FragDepthEXT = 0.0 + ( 0.0000001 / vRadius );",
"            }",
"        }",
"    #endif",
"",
"    // this is a workaround necessary for Mac",
"    // otherwise the modified fragment won't clip properly",
"    if (gl_FragDepthEXT < 0.0)",
"        discard;",
"    if (gl_FragDepthEXT > 1.0)",
"        discard;",
"",
"    #ifdef PICKING",
"",
"        gl_FragColor = vec4( vPickingColor, objectId );",
"",
"    #else",
"",
"        vec3 vViewPosition = -new_point;",
"        vec3 vNormal = _normal;",
"        vec3 vColor;",
"",
"        if( distSq3( new_point, end_cyl ) < distSq3( new_point, base ) ){",
"            if( b < 0.0 ){",
"                vColor = vColor1;",
"            }else{",
"                vColor = vColor2;",
"            }",
"        }else{",
"            if( b > 0.0 ){",
"                vColor = vColor1;",
"            }else{",
"                vColor = vColor2;",
"            }",
"        }",
"",
"        vec4 diffuseColor = vec4( diffuse, opacity );",
"        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
"        vec3 totalEmissiveLight = emissive;",
"",
"        #include color_fragment",
"     //ifdef USE_COLOR",
"     //diffuseColor.r *= vColor[0];",
"     //diffuseColor.g *= vColor[1];",
"     //diffuseColor.b *= vColor[2];",
"     //endif",
"        #include roughnessmap_fragment",
"        #include metalnessmap_fragment",
"",
"        // don't use include normal_fragment",
"        vec3 normal = normalize( vNormal );",
"",
"        #include lights_physical_fragment",
"        //include lights_template",
"        #include lights_fragment_begin",
"        #include lights_fragment_end",
"",
"        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveLight;",
"",
"        gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
"        //gl_FragColor = vec4( reflectedLight.directSpecular, diffuseColor.a );",
"",
"        #include premultiplied_alpha_fragment",
"        #include tonemapping_fragment",
"        #include encodings_fragment",
"        //include fog_fragment",
"        #ifdef USE_FOG",
"            #ifdef USE_LOGDEPTHBUF_EXT",
"                float depth = gl_FragDepthEXT / gl_FragCoord.w;",
"            #else",
"                float depth = gl_FragCoord.z / gl_FragCoord.w;",
"            #endif",
"            #ifdef FOG_EXP2",
"                float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * depth * depth * LOG2 ) );",
"            #else",
"                float fogFactor = smoothstep( fogNear, fogFar, depth );",
"            #endif",
"            gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );",
"        #endif",
"",
"    #endif",
"",
"}"
].join("\n");

$NGL_shaderTextHash['CylinderImpostor.vert'] = ["// Open-Source PyMOL is Copyright (C) Schrodinger, LLC.",
"//",
"//  All Rights Reserved",
"//",
"//  Permission to use, copy, modify, distribute, and distribute modified",
"//  versions of this software and its built-in documentation for any",
"//  purpose and without fee is hereby granted, provided that the above",
"//  copyright notice appears in all copies and that both the copyright",
"//  notice and this permission notice appear in supporting documentation,",
"//  and that the name of Schrodinger, LLC not be used in advertising or",
"//  publicity pertaining to distribution of the software without specific,",
"//  written prior permission.",
"//",
"//  SCHRODINGER, LLC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,",
"//  INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN",
"//  NO EVENT SHALL SCHRODINGER, LLC BE LIABLE FOR ANY SPECIAL, INDIRECT OR",
"//  CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS",
"//  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE",
"//  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE",
"//  USE OR PERFORMANCE OF THIS SOFTWARE.",
"",
"// Contributions by Alexander Rose",
"// - ported to WebGL",
"// - dual color",
"// - pk color",
"// - shift",
"",
"attribute vec3 mapping;",
"attribute vec3 position1;",
"attribute vec3 position2;",
"attribute float radius;",
"",
"varying vec3 axis;",
"varying vec4 base_radius;",
"varying vec4 end_b;",
"varying vec3 U;",
"varying vec3 V;",
"varying vec4 w;",
"varying float fogDepth;",
"varying float fogNear;",
"varying float fogFar;",
"",
"#ifdef PICKING",
"    #include unpack_clr",
"    attribute float primitiveId;",
"    varying vec3 vPickingColor;",
"#else",
"    //attribute vec3 color;",
"    attribute vec3 color2;",
"    varying vec3 vColor1;",
"    varying vec3 vColor2;",
"#endif",
"",
"uniform mat4 modelViewMatrixInverse;",
"uniform float ortho;",
"",
"//include matrix_scale",
"float matrixScale( in mat4 m ){",
"    vec4 r = m[ 0 ];",
"    return sqrt( r[ 0 ] * r[ 0 ] + r[ 1 ] * r[ 1 ] + r[ 2 ] * r[ 2 ] );",
"}",
"",
"void main(){",
"",
"    #ifdef PICKING",
"        vPickingColor = unpackColor( primitiveId );",
"    #else",
"        vColor1 = color;",
"        vColor2 = color2;",
"    #endif",
"",
"    // vRadius = radius;",
"    base_radius.w = radius * matrixScale( modelViewMatrix );",
"",
"    //vec3 center = position;",
"    vec3 center = ( position2 + position1 ) / 2.0;",
"    vec3 dir = normalize( position2 - position1 );",
"    float ext = length( position2 - position1 ) / 2.0;",
"",
"    // using cameraPosition fails on some machines, not sure why",
"    // vec3 cam_dir = normalize( cameraPosition - mix( center, vec3( 0.0 ), ortho ) );",
"    vec3 cam_dir;",
"    if( ortho == 0.0 ){",
"        cam_dir = ( modelViewMatrixInverse * vec4( 0, 0, 0, 1 ) ).xyz - center;",
"    }else{",
"        cam_dir = ( modelViewMatrixInverse * vec4( 0, 0, 1, 0 ) ).xyz;",
"    }",
"    cam_dir = normalize( cam_dir );",
"",
"    vec3 ldir;",
"",
"    float b = dot( cam_dir, dir );",
"    end_b.w = b;",
"    // direction vector looks away, so flip",
"    if( b < 0.0 )",
"        ldir = -ext * dir;",
"    // direction vector already looks in my direction",
"    else",
"        ldir = ext * dir;",
"",
"    vec3 left = normalize( cross( cam_dir, ldir ) );",
"    left = radius * left;",
"    vec3 up = radius * normalize( cross( left, ldir ) );",
"",
"    // transform to modelview coordinates",
"    axis = normalize( normalMatrix * ldir );",
"    U = normalize( normalMatrix * up );",
"    V = normalize( normalMatrix * left );",
"",
"    vec4 base4 = modelViewMatrix * vec4( center - ldir, 1.0 );",
"    base_radius.xyz = base4.xyz / base4.w;",
"",
"    vec4 top_position = modelViewMatrix * vec4( center + ldir, 1.0 );",
"    vec4 end4 = top_position;",
"    end_b.xyz = end4.xyz / end4.w;",
"",
"    w = modelViewMatrix * vec4(",
"        center + mapping.x*ldir + mapping.y*left + mapping.z*up, 1.0",
"    );",
"",
"    gl_Position = projectionMatrix * w;",
"",
"    // avoid clipping (1.0 seems to induce flickering with some drivers)",
"    gl_Position.z = 0.99;",
"",
"}"
].join("\n");

$NGL_shaderTextHash['SphereInstancing.frag'] = $NGL_shaderTextHash['SphereImpostor.frag'];

$NGL_shaderTextHash['SphereInstancing.vert'] = ["uniform mat4 projectionMatrixInverse;",
"uniform float nearClip;",
"",
"varying float vRadius;",
"varying float vRadiusSq;",
"varying vec3 vPoint;",
"varying vec3 vPointViewPosition;",
"varying float fogDepth;",
"varying float fogNear;",
"varying float fogFar;",
"",
"attribute vec2 mapping;",
"//attribute vec3 position;",
"attribute float radius;",
"attribute vec4 matrix1;",
"attribute vec4 matrix2;",
"attribute vec4 matrix3;",
"attribute vec4 matrix4;",
"",
"#ifdef PICKING",
"    #include unpack_clr",
"    attribute float primitiveId;",
"    varying vec3 vPickingColor;",
"#else",
"    #include color_pars_vertex",
"#endif",
"",
"//include matrix_scale",
"float matrixScale( in mat4 m ){",
"    vec4 r = m[ 0 ];",
"    return sqrt( r[ 0 ] * r[ 0 ] + r[ 1 ] * r[ 1 ] + r[ 2 ] * r[ 2 ] );",
"}",
"",
"const mat4 D = mat4(",
"    1.0, 0.0, 0.0, 0.0,",
"    0.0, 1.0, 0.0, 0.0,",
"    0.0, 0.0, 1.0, 0.0,",
"    0.0, 0.0, 0.0, -1.0",
");",
"",
"mat4 transposeTmp( in mat4 inMatrix ) {",
"    vec4 i0 = inMatrix[0];",
"    vec4 i1 = inMatrix[1];",
"    vec4 i2 = inMatrix[2];",
"    vec4 i3 = inMatrix[3];",
"",
"    mat4 outMatrix = mat4(",
"        vec4(i0.x, i1.x, i2.x, i3.x),",
"        vec4(i0.y, i1.y, i2.y, i3.y),",
"        vec4(i0.z, i1.z, i2.z, i3.z),",
"        vec4(i0.w, i1.w, i2.w, i3.w)",
"    );",
"    return outMatrix;",
"}",
"",
"//------------------------------------------------------------------------------",
"// Compute point size and center using the technique described in:",
"// 'GPU-Based Ray-Casting of Quadratic Surfaces'",
"// by Christian Sigg, Tim Weyrich, Mario Botsch, Markus Gross.",
"//",
"// Code based on",
"/*=========================================================================",
"",
" Program:   Visualization Toolkit",
" Module:    Quadrics_fs.glsl and Quadrics_vs.glsl",
"",
" Copyright (c) Ken Martin, Will Schroeder, Bill Lorensen",
" All rights reserved.",
" See Copyright.txt or http://www.kitware.com/Copyright.htm for details.",
"",
" This software is distributed WITHOUT ANY WARRANTY; without even",
" the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR",
" PURPOSE.  See the above copyright notice for more information.",
"",
" =========================================================================*/",
"",
"// .NAME Quadrics_fs.glsl and Quadrics_vs.glsl",
"// .SECTION Thanks",
"// <verbatim>",
"//",
"//  This file is part of the PointSprites plugin developed and contributed by",
"//",
"//  Copyright (c) CSCS - Swiss National Supercomputing Centre",
"//                EDF - Electricite de France",
"//",
"//  John Biddiscombe, Ugo Varetto (CSCS)",
"//  Stephane Ploix (EDF)",
"//",
"// </verbatim>",
"//",
"// Contributions by Alexander Rose",
"// - ported to WebGL",
"// - adapted to work with quads",
"void ComputePointSizeAndPositionInClipCoordSphere(vec4 updatePosition){",
"",
"    vec2 xbc;",
"    vec2 ybc;",
"",
"    mat4 T = mat4(",
"        radius, 0.0, 0.0, 0.0,",
"        0.0, radius, 0.0, 0.0,",
"        0.0, 0.0, radius, 0.0,",
"        updatePosition.x, updatePosition.y, updatePosition.z, 1.0",
"    );",
"",
"    mat4 R = transposeTmp( projectionMatrix * modelViewMatrix * T );",
"    float A = dot( R[ 3 ], D * R[ 3 ] );",
"    float B = -2.0 * dot( R[ 0 ], D * R[ 3 ] );",
"    float C = dot( R[ 0 ], D * R[ 0 ] );",
"    xbc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );",
"    xbc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );",
"    float sx = abs( xbc[ 0 ] - xbc[ 1 ] ) * 0.5;",
"",
"    A = dot( R[ 3 ], D * R[ 3 ] );",
"    B = -2.0 * dot( R[ 1 ], D * R[ 3 ] );",
"    C = dot( R[ 1 ], D * R[ 1 ] );",
"    ybc[ 0 ] = ( -B - sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );",
"    ybc[ 1 ] = ( -B + sqrt( B * B - 4.0 * A * C ) ) / ( 2.0 * A );",
"    float sy = abs( ybc[ 0 ] - ybc[ 1 ]  ) * 0.5;",
"",
"    gl_Position.xy = vec2( 0.5 * ( xbc.x + xbc.y ), 0.5 * ( ybc.x + ybc.y ) );",
"    gl_Position.xy -= mapping * vec2( sx, sy );",
"    gl_Position.xy *= gl_Position.w;",
"",
"}",
"",
"  mat4 computeMat(vec4 v1, vec4 v2, vec4 v3, vec4 v4) {",
"    return mat4(",
"      v1.x, v1.y, v1.z, v1.w,",
"      v2.x, v2.y, v2.z, v2.w,",
"      v3.x, v3.y, v3.z, v3.w,",
"      v4.x, v4.y, v4.z, v4.w",
"    );",
"  }",
"",
"void main(void){",
"",
"    #ifdef PICKING",
"        vPickingColor = unpackColor( primitiveId );",
"    #else",
"        #include color_vertex",
"    #endif",
"",
"    vRadius = radius * matrixScale( modelViewMatrix );",
"",
"    mat4 matrix = computeMat(matrix1, matrix2, matrix3, matrix4);",
"    vec4 updatePosition = matrix * vec4(position, 1.0);",
"",
"//    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
"    vec4 mvPosition = modelViewMatrix * vec4( updatePosition.xyz, 1.0 );",
"    // avoid clipping, added again in fragment shader",
"    mvPosition.z -= vRadius;",
"",
"//    gl_Position = projectionMatrix * vec4( mvPosition.xyz, 1.0 );",
"    gl_Position = projectionMatrix * vec4( mvPosition.xyz, 1.0 );",
"    ComputePointSizeAndPositionInClipCoordSphere(updatePosition);",
"",
"",
"    vRadiusSq = vRadius * vRadius;",
"    vec4 vPoint4 = projectionMatrixInverse * gl_Position;",
"    vPoint = vPoint4.xyz / vPoint4.w;",
"    vPointViewPosition = -mvPosition.xyz / mvPosition.w;",
"",
"}"
].join("\n");

$NGL_shaderTextHash['CylinderInstancing.frag'] = $NGL_shaderTextHash['CylinderImpostor.frag'];
$NGL_shaderTextHash['CylinderInstancing.vert'] = ["// Open-Source PyMOL is Copyright (C) Schrodinger, LLC.",
"//",
"//  All Rights Reserved",
"//",
"//  Permission to use, copy, modify, distribute, and distribute modified",
"//  versions of this software and its built-in documentation for any",
"//  purpose and without fee is hereby granted, provided that the above",
"//  copyright notice appears in all copies and that both the copyright",
"//  notice and this permission notice appear in supporting documentation,",
"//  and that the name of Schrodinger, LLC not be used in advertising or",
"//  publicity pertaining to distribution of the software without specific,",
"//  written prior permission.",
"//",
"//  SCHRODINGER, LLC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,",
"//  INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN",
"//  NO EVENT SHALL SCHRODINGER, LLC BE LIABLE FOR ANY SPECIAL, INDIRECT OR",
"//  CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS",
"//  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE",
"//  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE",
"//  USE OR PERFORMANCE OF THIS SOFTWARE.",
"",
"// Contributions by Alexander Rose",
"// - ported to WebGL",
"// - dual color",
"// - pk color",
"// - shift",
"",
"attribute vec3 mapping;",
"attribute vec3 position1;",
"attribute vec3 position2;",
"attribute float radius;",
"attribute vec4 matrix1;",
"attribute vec4 matrix2;",
"attribute vec4 matrix3;",
"attribute vec4 matrix4;",
"",
"varying vec3 axis;",
"varying vec4 base_radius;",
"varying vec4 end_b;",
"varying vec3 U;",
"varying vec3 V;",
"varying vec4 w;",
"varying float fogDepth;",
"varying float fogNear;",
"varying float fogFar;",
"",
"#ifdef PICKING",
"    #include unpack_clr",
"    attribute float primitiveId;",
"    varying vec3 vPickingColor;",
"#else",
"    //attribute vec3 color;",
"    attribute vec3 color2;",
"    varying vec3 vColor1;",
"    varying vec3 vColor2;",
"#endif",
"",
"uniform mat4 modelViewMatrixInverse;",
"uniform float ortho;",
"",
"//include matrix_scale",
"float matrixScale( in mat4 m ){",
"    vec4 r = m[ 0 ];",
"    return sqrt( r[ 0 ] * r[ 0 ] + r[ 1 ] * r[ 1 ] + r[ 2 ] * r[ 2 ] );",
"}",
"",
"  mat4 computeMat(vec4 v1, vec4 v2, vec4 v3, vec4 v4) {",
"    return mat4(",
"      v1.x, v1.y, v1.z, v1.w,",
"      v2.x, v2.y, v2.z, v2.w,",
"      v3.x, v3.y, v3.z, v3.w,",
"      v4.x, v4.y, v4.z, v4.w",
"    );",
"  }",
"",
"void main(){",
"",
"    #ifdef PICKING",
"        vPickingColor = unpackColor( primitiveId );",
"    #else",
"        vColor1 = color;",
"        vColor2 = color2;",
"    #endif",
"",
"    // vRadius = radius;",
"    base_radius.w = radius * matrixScale( modelViewMatrix );",
"",
"    //vec3 center = ( position2 + position1 ) / 2.0;",
"",
"    mat4 matrix = computeMat(matrix1, matrix2, matrix3, matrix4);",
"    vec4 updatePosition1 = matrix * vec4(position1, 1.0);",
"    vec4 updatePosition2 = matrix * vec4(position2, 1.0);",
"    vec3 center = ( updatePosition2.xyz + updatePosition1.xyz ) / 2.0;",
"",
"    //vec3 dir = normalize( position2 - position1 );",
"    vec3 dir = normalize( updatePosition2.xyz - updatePosition1.xyz );",
"    float ext = length( position2 - position1 ) / 2.0;",
"",
"    // using cameraPosition fails on some machines, not sure why",
"    // vec3 cam_dir = normalize( cameraPosition - mix( center, vec3( 0.0 ), ortho ) );",
"    vec3 cam_dir;",
"    if( ortho == 0.0 ){",
"        cam_dir = ( modelViewMatrixInverse * vec4( 0, 0, 0, 1 ) ).xyz - center;",
"    }else{",
"        cam_dir = ( modelViewMatrixInverse * vec4( 0, 0, 1, 0 ) ).xyz;",
"    }",
"    cam_dir = normalize( cam_dir );",
"",
"    vec3 ldir;",
"",
"    float b = dot( cam_dir, dir );",
"    end_b.w = b;",
"    // direction vector looks away, so flip",
"    if( b < 0.0 )",
"        ldir = -ext * dir;",
"    // direction vector already looks in my direction",
"    else",
"        ldir = ext * dir;",
"",
"    vec3 left = normalize( cross( cam_dir, ldir ) );",
"    left = radius * left;",
"    vec3 up = radius * normalize( cross( left, ldir ) );",
"",
"    // transform to modelview coordinates",
"    axis = normalize( normalMatrix * ldir );",
"    U = normalize( normalMatrix * up );",
"    V = normalize( normalMatrix * left );",
"",
"    vec4 base4 = modelViewMatrix * vec4( center - ldir, 1.0 );",
"    base_radius.xyz = base4.xyz / base4.w;",
"",
"    vec4 top_position = modelViewMatrix * vec4( center + ldir, 1.0 );",
"    vec4 end4 = top_position;",
"    end_b.xyz = end4.xyz / end4.w;",
"",
"    w = modelViewMatrix * vec4(",
"        center + mapping.x*ldir + mapping.y*left + mapping.z*up, 1.0",
"    );",
"",
"    gl_Position = projectionMatrix * w;",
"",
"    // avoid clipping (1.0 seems to induce flickering with some drivers)",
"    gl_Position.z = 0.99;",
"",
"}"
].join("\n");

$NGL_shaderTextHash['Instancing.frag'] = ["#define STANDARD",
"uniform vec3 diffuse;",
"uniform vec3 emissive;",
"uniform float roughness;",
"uniform float metalness;",
"uniform float opacity;",
"uniform float nearClip;",
"uniform float clipRadius;",
"uniform mat4 projectionMatrix;",
"uniform float ortho;",
"varying float bCylinder;",
"",
"#if defined( NEAR_CLIP ) || defined( RADIUS_CLIP ) || ( !defined( PICKING ) && !defined( NOLIGHT ) )",
"    varying vec3 vViewPosition;",
"#endif",
"",
"#if defined( RADIUS_CLIP )",
"    varying vec3 vClipCenter;",
"#endif",
"",
"#if defined( PICKING )",
"    uniform float objectId;",
"    varying vec3 vPickingColor;",
"#elif defined( NOLIGHT )",
"    varying vec3 vColor;",
"#else",
"    #ifndef FLAT_SHADED",
"        varying vec3 vNormal;",
"    #endif",
"    #include common",
"    #include color_pars_fragment",
"    #include fog_pars_fragment",
"    #include bsdfs",
"    #include lights_pars_begin",
"    #include lights_physical_pars_fragment",
"#endif",
"",
"void main(){",
"    #include nearclip_fragment",
"    #include radiusclip_fragment",
"",
"    #if defined( PICKING )",
"",
"        gl_FragColor = vec4( vPickingColor, objectId );",
"",
"    #elif defined( NOLIGHT )",
"",
"        gl_FragColor = vec4( vColor, opacity );",
"",
"    #else",
"",
"        vec4 diffuseColor = vec4( diffuse, opacity );",
"        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
"        vec3 totalEmissiveLight = emissive;",
"",
"        #include color_fragment",
"        #include roughnessmap_fragment",
"        #include metalnessmap_fragment",
"        #include normal_flip",
"        #include normal_fragment_begin",
"",
"        //include dull_interior_fragment",
"",
"        #include lights_physical_fragment",
"        //include lights_template",
"        #include lights_fragment_begin",
"        #include lights_fragment_end",
"",
"        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveLight;",
"",
"        #include interior_fragment",
"",
"        gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
"",
"        #include premultiplied_alpha_fragment",
"        #include tonemapping_fragment",
"        #include encodings_fragment",
"        #include fog_fragment",
"",
"        #include opaque_back_fragment",
"",
"    #endif",
"",
"}"
].join("\n");

$NGL_shaderTextHash['Instancing.vert'] = ["#define STANDARD",
"",
"uniform mat4 projectionMatrixInverse;",
"uniform float nearClip;",
"uniform vec3 clipCenter;",
"attribute vec4 matrix1;",
"attribute vec4 matrix2;",
"attribute vec4 matrix3;",
"attribute vec4 matrix4;",
"attribute float cylinder;",
"varying float bCylinder;",
"",
"#if defined( NEAR_CLIP ) || defined( RADIUS_CLIP ) || ( !defined( PICKING ) && !defined( NOLIGHT ) )",
"    varying vec3 vViewPosition;",
"#endif",
"",
"#if defined( RADIUS_CLIP )",
"    varying vec3 vClipCenter;",
"#endif",
"",
"#if defined( PICKING )",
"    #include unpack_color",
"    attribute float primitiveId;",
"    varying vec3 vPickingColor;",
"#elif defined( NOLIGHT )",
"    varying vec3 vColor;",
"#else",
"    #include color_pars_vertex",
"    #ifndef FLAT_SHADED",
"        varying vec3 vNormal;",
"    #endif",
"#endif",
"",
"#include common",
"",
"  mat4 computeMat(vec4 v1, vec4 v2, vec4 v3, vec4 v4) {",
"    return mat4(",
"      v1.x, v1.y, v1.z, v1.w,",
"      v2.x, v2.y, v2.z, v2.w,",
"      v3.x, v3.y, v3.z, v3.w,",
"      v4.x, v4.y, v4.z, v4.w",
"    );",
"  }",
"",
"void main(){",
"    bCylinder = cylinder;",
"",
"    mat4 matrix = computeMat(matrix1, matrix2, matrix3, matrix4);",
"    vec4 updatePosition = matrix * vec4(position, 1.0);",
"",
"    #if defined( PICKING )",
"        vPickingColor = unpackColor( primitiveId );",
"    #elif defined( NOLIGHT )",
"        vColor = color;",
"    #else",
"        #include color_vertex",
"        //include beginnormal_vertex",
"        //vec3 objectNormal = vec3( normal );",
"        vec3 objectNormal = vec3(matrix * vec4(normal,0.0));",
"        #include defaultnormal_vertex",
"        // Normal computed with derivatives when FLAT_SHADED",
"        #ifndef FLAT_SHADED",
"            vNormal = normalize( transformedNormal );",
"        #endif",
"    #endif",
"",
"    //include begin_vertex",
"    vec3 transformed = updatePosition.xyz;",
"    //include project_vertex",
"    vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );",
"    gl_Position = projectionMatrix * mvPosition;",
"",
"    #if defined( NEAR_CLIP ) || defined( RADIUS_CLIP ) || ( !defined( PICKING ) && !defined( NOLIGHT ) )",
"        vViewPosition = -mvPosition.xyz;",
"    #endif",
"",
"    #if defined( RADIUS_CLIP )",
"        vClipCenter = -( modelViewMatrix * vec4( clipCenter, 1.0 ) ).xyz;",
"    #endif",
"",
"    #include nearclip_vertex",
"",
"}"
].join("\n");

/* Projector.js from http://threejs.org/
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */



THREE.RenderableObject = function () {
    "use strict";

    this.id = 0;

    this.object = null;
    this.z = 0;

};

//

THREE.RenderableFace = function () {
    "use strict";

    this.id = 0;

    this.v1 = new THREE.RenderableVertex();
    this.v2 = new THREE.RenderableVertex();
    this.v3 = new THREE.RenderableVertex();

    this.normalModel = new THREE.Vector3();

    this.vertexNormalsModel = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
    this.vertexNormalsLength = 0;

    this.color = new THREE.Color();
    this.material = null;
    this.uvs = [ new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() ];

    this.z = 0;

};

//

THREE.RenderableVertex = function () {
    "use strict";

    this.position = new THREE.Vector3();
    this.positionWorld = new THREE.Vector3();
    this.positionScreen = new THREE.Vector4();

    this.visible = true;

};

THREE.RenderableVertex.prototype.copy = function ( vertex ) {
    "use strict";

    this.positionWorld.copy( vertex.positionWorld );
    this.positionScreen.copy( vertex.positionScreen );

};

//

THREE.RenderableLine = function () {
    "use strict";

    this.id = 0;

    this.v1 = new THREE.RenderableVertex();
    this.v2 = new THREE.RenderableVertex();

    this.vertexColors = [ new THREE.Color(), new THREE.Color() ];
    this.material = null;

    this.z = 0;

};

//

THREE.RenderableSprite = function () {
    "use strict";

    this.id = 0;

    this.object = null;

    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.rotation = 0;
    this.scale = new THREE.Vector2();

    this.material = null;

};

//

THREE.Projector = function () {
    "use strict";

    var _object, _objectCount, _objectPool = [], _objectPoolLength = 0,
    _vertex, _vertexCount, _vertexPool = [], _vertexPoolLength = 0,
    _face, _faceCount, _facePool = [], _facePoolLength = 0,
    _line, _lineCount, _linePool = [], _linePoolLength = 0,
    _sprite, _spriteCount, _spritePool = [], _spritePoolLength = 0,

    _renderData = { objects: [], lights: [], elements: [] },

    _vA = new THREE.Vector3(),
    _vB = new THREE.Vector3(),
    _vC = new THREE.Vector3(),

    _vector3 = new THREE.Vector3(),
    _vector4 = new THREE.Vector4(),

    _clipBox = new THREE.Box3( new THREE.Vector3( - 1, - 1, - 1 ), new THREE.Vector3( 1, 1, 1 ) ),
    _boundingBox = new THREE.Box3(),
    _pnts3 = new Array( 3 ),
    _pnts4 = new Array( 4 ),

    _viewMatrix = new THREE.Matrix4(),
    _viewProjectionMatrix = new THREE.Matrix4(),

    _modelMatrix,
    _modelViewProjectionMatrix = new THREE.Matrix4(),

    _normalMatrix = new THREE.Matrix3(),

    _frustum = new THREE.Frustum(),

    _clippedVertex1PositionScreen = new THREE.Vector4(),
    _clippedVertex2PositionScreen = new THREE.Vector4();

    //

    this.projectVector = function ( vector, camera ) {

        console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
        vector.project( camera );

    };

    this.unprojectVector = function ( vector, camera ) {

        console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
        vector.unproject( camera );

    };

    this.pkRay = function ( vector, camera ) {

        console.error( 'THREE.Projector: .pkRay() is now raycaster.setFromCamera().' );

    };

    //

    var RenderList = function () {

        var normals = [];
        var uvs = [];

        var object = null;
        var material = null;

        var normalMatrix = new THREE.Matrix3();

        var setObject = function ( value ) {

            object = value;
            material = object.material;

            normalMatrix.getNormalMatrix( object.matrixWorld );

            normals.length = 0;
            uvs.length = 0;

        };

        var projectVertex = function ( vertex ) {

            var position = vertex.position;
            var positionWorld = vertex.positionWorld;
            var positionScreen = vertex.positionScreen;

            positionWorld.copy( position ).applyMatrix4( _modelMatrix );
            positionScreen.copy( positionWorld ).applyMatrix4( _viewProjectionMatrix );

            var invW = 1 / positionScreen.w;

            positionScreen.x *= invW;
            positionScreen.y *= invW;
            positionScreen.z *= invW;

            vertex.visible = positionScreen.x >= - 1 && positionScreen.x <= 1 &&
                     positionScreen.y >= - 1 && positionScreen.y <= 1 &&
                     positionScreen.z >= - 1 && positionScreen.z <= 1;

        };

        var pushVertex = function ( x, y, z ) {

            _vertex = getNextVertexInPool();
            _vertex.position.set( x, y, z );

            projectVertex( _vertex );

        };

        var pushNormal = function ( x, y, z ) {

            normals.push( x, y, z );

        };

        var pushUv = function ( x, y ) {

            uvs.push( x, y );

        };

        var checkTriangleVisibility = function ( v1, v2, v3 ) {

            if ( v1.visible === true || v2.visible === true || v3.visible === true ) return true;

            _pnts3[ 0 ] = v1.positionScreen;
            _pnts3[ 1 ] = v2.positionScreen;
            _pnts3[ 2 ] = v3.positionScreen;

            return _clipBox.isIntersectionBox( _boundingBox.setFromPoints( _pnts3 ) );

        };

        var checkBackfaceCulling = function ( v1, v2, v3 ) {

            return ( ( v3.positionScreen.x - v1.positionScreen.x ) *
                    ( v2.positionScreen.y - v1.positionScreen.y ) -
                    ( v3.positionScreen.y - v1.positionScreen.y ) *
                    ( v2.positionScreen.x - v1.positionScreen.x ) ) < 0;

        };

        var pushLine = function ( a, b ) {

            var v1 = _vertexPool[ a ];
            var v2 = _vertexPool[ b ];

            _line = getNextLineInPool();

            _line.id = object.id;
            _line.v1.copy( v1 );
            _line.v2.copy( v2 );
            _line.z = ( v1.positionScreen.z + v2.positionScreen.z ) / 2;

            _line.material = object.material;

            _renderData.elements.push( _line );

        };

        var pushTriangle = function ( a, b, c ) {

            var v1 = _vertexPool[ a ];
            var v2 = _vertexPool[ b ];
            var v3 = _vertexPool[ c ];

            if ( checkTriangleVisibility( v1, v2, v3 ) === false ) return;

            if ( material.side === THREE.DoubleSide || checkBackfaceCulling( v1, v2, v3 ) === true ) {

                _face = getNextFaceInPool();

                _face.id = object.id;
                _face.v1.copy( v1 );
                _face.v2.copy( v2 );
                _face.v3.copy( v3 );
                _face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;

                for ( var i = 0; i < 3; i ++ ) {

                    var offset = arguments[ i ] * 3;
                    var normal = _face.vertexNormalsModel[ i ];

                    normal.set( normals[ offset ], normals[ offset + 1 ], normals[ offset + 2 ] );
                    normal.applyMatrix3( normalMatrix ).normalize();

                    var offset2 = arguments[ i ] * 2;

                    var uv = _face.uvs[ i ];
                    uv.set( uvs[ offset2 ], uvs[ offset2 + 1 ] );

                }

                _face.vertexNormalsLength = 3;

                _face.material = object.material;

                _renderData.elements.push( _face );

            }

        };

        return {
            setObject: setObject,
            projectVertex: projectVertex,
            checkTriangleVisibility: checkTriangleVisibility,
            checkBackfaceCulling: checkBackfaceCulling,
            pushVertex: pushVertex,
            pushNormal: pushNormal,
            pushUv: pushUv,
            pushLine: pushLine,
            pushTriangle: pushTriangle
        }

    };

    var renderList = new RenderList();

    this.projectScene = function ( scene, camera, sortObjects, sortElements ) {

        _faceCount = 0;
        _lineCount = 0;
        _spriteCount = 0;

        _renderData.elements.length = 0;

        if ( scene.autoUpdate === true ) scene.updateMatrixWorld();
        if ( camera.parent === undefined ) camera.updateMatrixWorld();

        //_viewMatrix.copy( camera.matrixWorldInverse.getInverse( camera.matrixWorld ) );
        _viewMatrix.copy( camera.matrixWorldInverse.copy(camera.matrixWorld).invert() );
        _viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

        _frustum.setFromMatrix( _viewProjectionMatrix );

        //

        _objectCount = 0;

        _renderData.objects.length = 0;
        _renderData.lights.length = 0;

        scene.traverseVisible( function ( object ) {

            if ( object instanceof THREE.Light ) {

                _renderData.lights.push( object );

            } else if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite ) {

                if ( object.material.visible === false ) return;

                if ( object.frustumCulled === false || _frustum.intersectsObject( object ) === true ) {

                    _object = getNextObjectInPool();
                    _object.id = object.id;
                    _object.object = object;

                    _vector3.setFromMatrixPosition( object.matrixWorld );
                    _vector3.applyProjection( _viewProjectionMatrix );
                    _object.z = _vector3.z;

                    _renderData.objects.push( _object );

                }

            }

        } );

        if ( sortObjects === true ) {

            _renderData.objects.sort( painterSort );

        }

        //

        for ( var o = 0, ol = _renderData.objects.length; o < ol; o ++ ) {

            var object = _renderData.objects[ o ].object;
            var geometry = object.geometry;

            renderList.setObject( object );

            _modelMatrix = object.matrixWorld;

            _vertexCount = 0;

            if ( object instanceof THREE.Mesh ) {

                if ( geometry instanceof THREE.BufferGeometry ) {

                    var attributes = geometry.attributes;
                    var offsets = geometry.offsets;

                    if ( attributes.position === undefined ) continue;

                    var positions = attributes.position.array;

                    for ( var i = 0, l = positions.length; i < l; i += 3 ) {

                        renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

                    }

                    if ( attributes.normal !== undefined ) {

                        var normals = attributes.normal.array;

                        for ( var i = 0, l = normals.length; i < l; i += 3 ) {

                            renderList.pushNormal( normals[ i ], normals[ i + 1 ], normals[ i + 2 ] );

                        }

                    }

                    if ( attributes.uv !== undefined ) {

                        var uvs = attributes.uv.array;

                        for ( var i = 0, l = uvs.length; i < l; i += 2 ) {

                            renderList.pushUv( uvs[ i ], uvs[ i + 1 ] );

                        }

                    }

                    if ( attributes.index !== undefined ) {

                        var indices = attributes.index.array;

                        if ( offsets.length > 0 ) {

                            for ( var o = 0; o < offsets.length; o ++ ) {

                                var offset = offsets[ o ];
                                var index = offset.index;

                                for ( var i = offset.start, l = offset.start + offset.count; i < l; i += 3 ) {

                                    renderList.pushTriangle( indices[ i ] + index, indices[ i + 1 ] + index, indices[ i + 2 ] + index );

                                }

                            }

                        } else {

                            for ( var i = 0, l = indices.length; i < l; i += 3 ) {

                                renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

                            }

                        }

                    } else {

                        for ( var i = 0, l = positions.length / 3; i < l; i += 3 ) {

                            renderList.pushTriangle( i, i + 1, i + 2 );

                        }

                    }

                }
                /*
                else if ( geometry instanceof THREE.Geometry ) {

                    var vertices = geometry.vertices;
                    var faces = geometry.faces;
                    var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

                    _normalMatrix.getNormalMatrix( _modelMatrix );

                    var isFaceMaterial = object.material instanceof THREE.MeshFaceMaterial;
                    var objectMaterials = isFaceMaterial === true ? object.material : null;

                    for ( var v = 0, vl = vertices.length; v < vl; v ++ ) {

                        var vertex = vertices[ v ];
                        renderList.pushVertex( vertex.x, vertex.y, vertex.z );

                    }

                    for ( var f = 0, fl = faces.length; f < fl; f ++ ) {

                        var face = faces[ f ];

                        var material = isFaceMaterial === true
                             ? objectMaterials.materials[ face.materialIndex ]
                             : object.material;

                        if ( material === undefined ) continue;

                        var side = material.side;

                        var v1 = _vertexPool[ face.a ];
                        var v2 = _vertexPool[ face.b ];
                        var v3 = _vertexPool[ face.c ];

                        if ( material.morphTargets === true ) {

                            var morphTargets = geometry.morphTargets;
                            var morphInfluences = object.morphTargetInfluences;

                            var v1p = v1.position;
                            var v2p = v2.position;
                            var v3p = v3.position;

                            _vA.set( 0, 0, 0 );
                            _vB.set( 0, 0, 0 );
                            _vC.set( 0, 0, 0 );

                            for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

                                var influence = morphInfluences[ t ];

                                if ( influence === 0 ) continue;

                                var targets = morphTargets[ t ].vertices;

                                _vA.x += ( targets[ face.a ].x - v1p.x ) * influence;
                                _vA.y += ( targets[ face.a ].y - v1p.y ) * influence;
                                _vA.z += ( targets[ face.a ].z - v1p.z ) * influence;

                                _vB.x += ( targets[ face.b ].x - v2p.x ) * influence;
                                _vB.y += ( targets[ face.b ].y - v2p.y ) * influence;
                                _vB.z += ( targets[ face.b ].z - v2p.z ) * influence;

                                _vC.x += ( targets[ face.c ].x - v3p.x ) * influence;
                                _vC.y += ( targets[ face.c ].y - v3p.y ) * influence;
                                _vC.z += ( targets[ face.c ].z - v3p.z ) * influence;

                            }

                            v1.position.add( _vA );
                            v2.position.add( _vB );
                            v3.position.add( _vC );

                            renderList.projectVertex( v1 );
                            renderList.projectVertex( v2 );
                            renderList.projectVertex( v3 );

                        }

                        if ( renderList.checkTriangleVisibility( v1, v2, v3 ) === false ) continue;

                        var visible = renderList.checkBackfaceCulling( v1, v2, v3 );

                        if ( side !== THREE.DoubleSide ) {
                            if ( side === THREE.FrontSide && visible === false ) continue;
                            if ( side === THREE.BackSide && visible === true ) continue;
                        }

                        _face = getNextFaceInPool();

                        _face.id = object.id;
                        _face.v1.copy( v1 );
                        _face.v2.copy( v2 );
                        _face.v3.copy( v3 );

                        _face.normalModel.copy( face.normal );

                        if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

                            _face.normalModel.negate();

                        }

                        _face.normalModel.applyMatrix3( _normalMatrix ).normalize();

                        var faceVertexNormals = face.vertexNormals;

                        for ( var n = 0, nl = Math.min( faceVertexNormals.length, 3 ); n < nl; n ++ ) {

                            var normalModel = _face.vertexNormalsModel[ n ];
                            normalModel.copy( faceVertexNormals[ n ] );

                            if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

                                normalModel.negate();

                            }

                            normalModel.applyMatrix3( _normalMatrix ).normalize();

                        }

                        _face.vertexNormalsLength = faceVertexNormals.length;

                        var vertexUvs = faceVertexUvs[ f ];

                        if ( vertexUvs !== undefined ) {

                            for ( var u = 0; u < 3; u ++ ) {

                                _face.uvs[ u ].copy( vertexUvs[ u ] );

                            }

                        }

                        _face.color = face.color;
                        _face.material = material;

                        _face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;

                        _renderData.elements.push( _face );

                    }

                }
                */

            } else if ( object instanceof THREE.Line ) {

                if ( geometry instanceof THREE.BufferGeometry ) {

                    var attributes = geometry.attributes;

                    if ( attributes.position !== undefined ) {

                        var positions = attributes.position.array;

                        for ( var i = 0, l = positions.length; i < l; i += 3 ) {

                            renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

                        }

                        if ( attributes.index !== undefined ) {

                            var indices = attributes.index.array;

                            for ( var i = 0, l = indices.length; i < l; i += 2 ) {

                                renderList.pushLine( indices[ i ], indices[ i + 1 ] );

                            }

                        } else {

                            var step = object.mode === THREE.LinePieces ? 2 : 1;

                            for ( var i = 0, l = ( positions.length / 3 ) - 1; i < l; i += step ) {

                                renderList.pushLine( i, i + 1 );

                            }

                        }

                    }

                }
                /*
                else if ( geometry instanceof THREE.Geometry ) {

                    _modelViewProjectionMatrix.multiplyMatrices( _viewProjectionMatrix, _modelMatrix );

                    var vertices = object.geometry.vertices;

                    if ( vertices.length === 0 ) continue;

                    v1 = getNextVertexInPool();
                    v1.positionScreen.copy( vertices[ 0 ] ).applyMatrix4( _modelViewProjectionMatrix );

                    // Handle LineStrip and LinePieces
                    var step = object.mode === THREE.LinePieces ? 2 : 1;

                    for ( var v = 1, vl = vertices.length; v < vl; v ++ ) {

                        v1 = getNextVertexInPool();
                        v1.positionScreen.copy( vertices[ v ] ).applyMatrix4( _modelViewProjectionMatrix );

                        if ( ( v + 1 ) % step > 0 ) continue;

                        v2 = _vertexPool[ _vertexCount - 2 ];

                        _clippedVertex1PositionScreen.copy( v1.positionScreen );
                        _clippedVertex2PositionScreen.copy( v2.positionScreen );

                        if ( clipLine( _clippedVertex1PositionScreen, _clippedVertex2PositionScreen ) === true ) {

                            // Perform the perspective divide
                            _clippedVertex1PositionScreen.multiplyScalar( 1 / _clippedVertex1PositionScreen.w );
                            _clippedVertex2PositionScreen.multiplyScalar( 1 / _clippedVertex2PositionScreen.w );

                            _line = getNextLineInPool();

                            _line.id = object.id;
                            _line.v1.positionScreen.copy( _clippedVertex1PositionScreen );
                            _line.v2.positionScreen.copy( _clippedVertex2PositionScreen );

                            _line.z = Math.max( _clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z );

                            _line.material = object.material;

                            if ( object.material.vertexColors === THREE.VertexColors ) {

                                _line.vertexColors[ 0 ].copy( object.geometry.colors[ v ] );
                                _line.vertexColors[ 1 ].copy( object.geometry.colors[ v - 1 ] );

                            }

                            _renderData.elements.push( _line );

                        }

                    }

                }
                */

            } else if ( object instanceof THREE.Sprite ) {

                _vector4.set( _modelMatrix.elements[ 12 ], _modelMatrix.elements[ 13 ], _modelMatrix.elements[ 14 ], 1 );
                _vector4.applyMatrix4( _viewProjectionMatrix );

                var invW = 1 / _vector4.w;

                _vector4.z *= invW;

                if ( _vector4.z >= - 1 && _vector4.z <= 1 ) {

                    _sprite = getNextSpriteInPool();
                    _sprite.id = object.id;
                    _sprite.x = _vector4.x * invW;
                    _sprite.y = _vector4.y * invW;
                    _sprite.z = _vector4.z;
                    _sprite.object = object;

                    _sprite.rotation = object.rotation;

                    _sprite.scale.x = object.scale.x * Math.abs( _sprite.x - ( _vector4.x + camera.projectionMatrix.elements[ 0 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 12 ] ) );
                    _sprite.scale.y = object.scale.y * Math.abs( _sprite.y - ( _vector4.y + camera.projectionMatrix.elements[ 5 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 13 ] ) );

                    _sprite.material = object.material;

                    _renderData.elements.push( _sprite );

                }

            }

        }

        if ( sortElements === true ) {

            _renderData.elements.sort( painterSort );

        }

        return _renderData;

    };

    // Pools

    function getNextObjectInPool() {

        if ( _objectCount === _objectPoolLength ) {

            var object = new THREE.RenderableObject();
            _objectPool.push( object );
            _objectPoolLength ++;
            _objectCount ++;
            return object;

        }

        return _objectPool[ _objectCount ++ ];

    }

    function getNextVertexInPool() {

        if ( _vertexCount === _vertexPoolLength ) {

            var vertex = new THREE.RenderableVertex();
            _vertexPool.push( vertex );
            _vertexPoolLength ++;
            _vertexCount ++;
            return vertex;

        }

        return _vertexPool[ _vertexCount ++ ];

    }

    function getNextFaceInPool() {

        if ( _faceCount === _facePoolLength ) {

            var face = new THREE.RenderableFace();
            _facePool.push( face );
            _facePoolLength ++;
            _faceCount ++;
            return face;

        }

        return _facePool[ _faceCount ++ ];


    }

    function getNextLineInPool() {

        if ( _lineCount === _linePoolLength ) {

            var line = new THREE.RenderableLine();
            _linePool.push( line );
            _linePoolLength ++;
            _lineCount ++
            return line;

        }

        return _linePool[ _lineCount ++ ];

    }

    function getNextSpriteInPool() {

        if ( _spriteCount === _spritePoolLength ) {

            var sprite = new THREE.RenderableSprite();
            _spritePool.push( sprite );
            _spritePoolLength ++;
            _spriteCount ++
            return sprite;

        }

        return _spritePool[ _spriteCount ++ ];

    }

    //

    function painterSort( a, b ) {

        if ( a.z !== b.z ) {

            return b.z - a.z;

        } else if ( a.id !== b.id ) {

            return a.id - b.id;

        } else {

            return 0;

        }

    }

    function clipLine( s1, s2 ) {

        var alpha1 = 0, alpha2 = 1,

        // Calculate the boundary coordinate of each vertex for the near and far clip planes,
        // Z = -1 and Z = +1, respectively.
        bc1near =  s1.z + s1.w,
        bc2near =  s2.z + s2.w,
        bc1far =  - s1.z + s1.w,
        bc2far =  - s2.z + s2.w;

        if ( bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0 ) {

            // Both vertices lie entirely within all clip planes.
            return true;

        } else if ( ( bc1near < 0 && bc2near < 0 ) || ( bc1far < 0 && bc2far < 0 ) ) {

            // Both vertices lie entirely outside one of the clip planes.
            return false;

        } else {

            // The line segment spans at least one clip plane.

            if ( bc1near < 0 ) {

                // v1 lies outside the near plane, v2 inside
                alpha1 = Math.max( alpha1, bc1near / ( bc1near - bc2near ) );

            } else if ( bc2near < 0 ) {

                // v2 lies outside the near plane, v1 inside
                alpha2 = Math.min( alpha2, bc1near / ( bc1near - bc2near ) );

            }

            if ( bc1far < 0 ) {

                // v1 lies outside the far plane, v2 inside
                alpha1 = Math.max( alpha1, bc1far / ( bc1far - bc2far ) );

            } else if ( bc2far < 0 ) {

                // v2 lies outside the far plane, v2 inside
                alpha2 = Math.min( alpha2, bc1far / ( bc1far - bc2far ) );

            }

            if ( alpha2 < alpha1 ) {

                // The line segment spans two boundaries, but is outside both of them.
                // (This can't happen when we're only clipping against just near/far but good
                //  to leave the check here for future usage if other clip planes are added.)
                return false;

            } else {

                // Update the s1 and s2 vertices to match the clipped line segment.
                s1.lerp( s2, alpha1 );
                s2.lerp( s1, 1 - alpha2 );

                return true;

            }

        }

    }

};

/* TrackballControls.js from http://threejs.org/
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin  / http://mark-lundin.com
 * modified by Jiyao Wang
 */



THREE.TrackballControls = function ( object, domElement, icn3d ) {
    "use strict";

    var _this = this;

    this.STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // API
    this.enabled = true;

    this.screen = { left: 0, top: 0, width: 0, height: 0 };

    this.rotateSpeed = 1.0;
    this.zoomSpeed = 1.2;
    this.panSpeed = 0.3;

    this.noRotate = false;
    this.noZoom = false;
    this.noPan = false;
    this.noRoll = false;

    this.staticMoving = false;
    this.dynamicDampingFactor = 0.2;

    this.minDistance = 0;
    this.maxDistance = Infinity;

    this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

    // internals

    this.target = new THREE.Vector3();

    var EPS = 0.000001;

    var lastPosition = new THREE.Vector3();

    this._state = this.STATE.NONE;
    var _prevState = this.STATE.NONE;

    var _eye = new THREE.Vector3();

    this._rotateStart = new THREE.Vector3();
    this._rotateEnd = new THREE.Vector3();

    this._zoomStart = new THREE.Vector2();
    this._zoomEnd = new THREE.Vector2();

    var _touchZoomDistanceStart = 0;
    var _touchZoomDistanceEnd = 0;

    this._panStart = new THREE.Vector2();
    this._panEnd = new THREE.Vector2();

    // for reset

    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.up0 = this.object.up.clone();

    // events

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start'};
    var endEvent = { type: 'end'};


    // methods

    this.handleResize = function () {

        if ( this.domElement === document ) {

            this.screen.left = 0;
            this.screen.top = 0;
            this.screen.width = window.innerWidth;
            this.screen.height = window.innerHeight;

        } else if(this.domElement) {

            var box = this.domElement.getBoundingClientRect();
            // adjustments come from similar code in the jquery offset() function
            var d = this.domElement.ownerDocument.documentElement;
            this.screen.left = box.left + window.pageXOffset - d.clientLeft;
            this.screen.top = box.top + window.pageYOffset - d.clientTop;
            this.screen.width = box.width;
            this.screen.height = box.height;

        }

    };

    this.handleEvent = function ( event ) {

        if ( typeof this[ event.type ] === 'function' ) {

            this[ event.type ]( event );

        }

    };

    var getMouseOnScreen = ( function () {

        var vector = new THREE.Vector2();

        return function ( pageX, pageY ) {

            vector.set(
                ( pageX - _this.screen.left ) / _this.screen.width,
                ( pageY - _this.screen.top ) / _this.screen.height
            );

            return vector;

        };

    }() );

    var getMouseProjectionOnBall = ( function () {

        var vector = new THREE.Vector3();
        var objectUp = new THREE.Vector3();
        var mouseOnBall = new THREE.Vector3();

        return function ( pageX, pageY ) {

            mouseOnBall.set(
                ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / (_this.screen.width*.5),
                ( _this.screen.height * 0.5 + _this.screen.top - pageY ) / (_this.screen.height*.5),
                0.0
            );

            var length = mouseOnBall.length();

            if ( _this.noRoll ) {

                if ( length < Math.SQRT1_2 ) {

                    mouseOnBall.z = Math.sqrt( 1.0 - length*length );

                } else {

                    mouseOnBall.z = .5 / length;

                }

            } else if ( length > 1.0 ) {

                mouseOnBall.normalize();

            } else {

                mouseOnBall.z = Math.sqrt( 1.0 - length * length );

            }

            _eye.copy( _this.object.position ).sub( _this.target );

            vector.copy( _this.object.up ).setLength( mouseOnBall.y )
            vector.add( objectUp.copy( _this.object.up ).cross( _eye ).setLength( mouseOnBall.x ) );
            vector.add( _eye.setLength( mouseOnBall.z ) );

            return vector;

        };

    }() );

    this.rotateCamera = (function(quaternionIn, bUpdate){

        var axis = new THREE.Vector3(),
            quaternion = new THREE.Quaternion();


        return function (quaternionIn, bUpdate) {

            var angle;
            if(quaternionIn === undefined) {
              angle = Math.acos( _this._rotateStart.dot( _this._rotateEnd ) / _this._rotateStart.length() / _this._rotateEnd.length() );
            }

            //var angle = Math.acos( _this._rotateStart.dot( _this._rotateEnd ) / _this._rotateStart.length() / _this._rotateEnd.length() );

            if ( angle || quaternionIn !== undefined) {
                if(quaternionIn === undefined) {
                  axis.crossVectors( _this._rotateStart, _this._rotateEnd ).normalize();

                  angle *= _this.rotateSpeed;

                  quaternion.setFromAxisAngle( axis, -angle );
                }
                else {
                  quaternion.copy(quaternionIn);
                }

                // order matters in quaernion multiplication: http://www.cprogramming.com/tutorial/3d/quaternions.html
                if(icn3d !== undefined && icn3d.quaternion !== undefined && (bUpdate === undefined || bUpdate === true)) {
                    icn3d.quaternion.multiplyQuaternions(quaternion, icn3d.quaternion);
                }

                _eye.applyQuaternion( quaternion );
                _this.object.up.applyQuaternion( quaternion );

                _this._rotateEnd.applyQuaternion( quaternion );

                if ( _this.staticMoving ) {

                    _this._rotateStart.copy( _this._rotateEnd );

                } else {

                    quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
                    _this._rotateStart.applyQuaternion( quaternion );

                }
            }

        }

    }());

    this.zoomCamera = function (zoomFactor, bUpdate) {
        if ( _this._state === _this.STATE.TOUCH_ZOOM_PAN ) {

            var factor;

            if(zoomFactor !== undefined) {
              factor = zoomFactor;
            }
            else {

              factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
              _touchZoomDistanceStart = _touchZoomDistanceEnd;
            }

            _eye.multiplyScalar( factor );

            if(icn3d !== undefined && icn3d._zoomFactor !== undefined && (bUpdate === undefined || bUpdate === true)) {
                icn3d._zoomFactor *= factor;
                icn3d.fogCls.setFog();
            }

        } else {

            var factor;

            if(zoomFactor !== undefined) {
              factor = zoomFactor;
            }
            else {
              factor = 1.0 + ( _this._zoomEnd.y - _this._zoomStart.y ) * _this.zoomSpeed;
            }

            if(icn3d !== undefined && icn3d._zoomFactor !== undefined && (bUpdate === undefined || bUpdate === true)) {
                icn3d._zoomFactor *= factor;
                icn3d.fogCls.setFog();
            }

            //if ( factor !== 1.0 && factor > 0.0 ) {
            if ( factor !== 1.0 ) {

                _eye.multiplyScalar( factor );

                if ( _this.staticMoving ) {

                    _this._zoomStart.copy( _this._zoomEnd );

                } else {

                    _this._zoomStart.y += ( _this._zoomEnd.y - _this._zoomStart.y ) * this.dynamicDampingFactor;
                }
            }

        }

    };

    this.panCamera = (function(mouseChangeIn, bUpdate){

        var mouseChange = new THREE.Vector2(),
            objectUp = new THREE.Vector3(),
            pan = new THREE.Vector3();

        return function (mouseChangeIn, bUpdate) {

            if(mouseChangeIn !== undefined) {
              mouseChange = mouseChangeIn;

              if(icn3d !== undefined && icn3d.mouseChange !== undefined && (bUpdate === undefined || bUpdate === true)) icn3d.mouseChange.add(mouseChangeIn);
            }
            else {
              mouseChange.copy( _this._panEnd ).sub( _this._panStart );

              if(icn3d !== undefined && icn3d.mouseChange !== undefined && (bUpdate === undefined || bUpdate === true)) icn3d.mouseChange.add( _this._panEnd ).sub( _this._panStart );
            }

            if ( mouseChange.lengthSq() ) {
                mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

                pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
                pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );

                _this.object.position.add( pan );
                _this.target.add( pan );

                if ( _this.staticMoving ) {

                    _this._panStart.copy( _this._panEnd );

                } else {

                    _this._panStart.add( mouseChange.subVectors( _this._panEnd, _this._panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

                }

            }
        }

    }());

    this.checkDistances = function () {

        if ( !_this.noZoom || !_this.noPan ) {

            if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

                _this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );

            }

            if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

                _this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );

            }

        }

    };

    this.update = function (para) {

        _eye.subVectors( _this.object.position, _this.target );

        if ( !_this.noRotate ) {

            if(para !== undefined && para.quaternion !== undefined) {
              _this.rotateCamera(para.quaternion, para.update);
            }
            else {
              _this.rotateCamera();
            }

        }

        if ( !_this.noZoom ) {

            if(para !== undefined && para._zoomFactor !== undefined) {
              _this.zoomCamera(para._zoomFactor, para.update);
            }
            else {
              _this.zoomCamera();
            }

        }

        if ( !_this.noPan ) {

            if(para !== undefined && para.mouseChange !== undefined) {
              _this.panCamera(para.mouseChange, para.update);
            }
            else {
              _this.panCamera();
            }

        }

        _this.object.position.addVectors( _this.target, _eye );

        _this.checkDistances();

        _this.object.lookAt( _this.target );

        if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {

            _this.dispatchEvent( changeEvent );

            lastPosition.copy( _this.object.position );

        }

    };

    this.reset = function () {

        _this._state = _this.STATE.NONE;
        _prevState = _this.STATE.NONE;

        _this.target.copy( _this.target0 );
        _this.object.position.copy( _this.position0 );
        _this.object.up.copy( _this.up0 );

        _eye.subVectors( _this.object.position, _this.target );

        _this.object.lookAt( _this.target );

        _this.dispatchEvent( changeEvent );

        lastPosition.copy( _this.object.position );

    };

    // listeners

    function keydown( event ) {
//console.log("keydown");

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        window.removeEventListener( 'keydown', keydown );

        _prevState = _this._state;


        if ( _this._state !== _this.STATE.NONE ) {

            return;

        } else if ( event.keyCode === _this.keys[ _this.STATE.ROTATE ] &&  !_this.noRotate) {

            _this._state = _this.STATE.ROTATE;

        } else if ( (event.keyCode === _this.keys[ _this.STATE.ZOOM ]) && !_this.noZoom ) {

            _this._state = _this.STATE.ZOOM;

        } else if ( (event.keyCode === _this.keys[ _this.STATE.PAN ]) && !_this.noPan ) {

            _this._state = _this.STATE.PAN;

        }


    }

    function keyup( event ) {
//console.log("keyup");

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        _this._state = _prevState;

        window.addEventListener( 'keydown', keydown, false );

    }

    function mousedown( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        if ( _this._state === _this.STATE.NONE ) {

            _this._state = event.button;

        }

        if ( _this._state === _this.STATE.ROTATE && !_this.noRotate ) {

            _this._rotateStart.copy( getMouseProjectionOnBall( event.pageX, event.pageY ) );
            _this._rotateEnd.copy( _this._rotateStart );

        } else if ( _this._state === _this.STATE.ZOOM && !_this.noZoom ) {

            _this._zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
            _this._zoomEnd.copy(_this._zoomStart);

        } else if ( _this._state === _this.STATE.PAN && !_this.noPan ) {

            _this._panStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
            _this._panEnd.copy(_this._panStart)

        }

        document.addEventListener( 'mousemove', mousemove, false );
        document.addEventListener( 'mouseup', mouseup, false );

        _this.dispatchEvent( startEvent );

    }

    function mousemove( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        if ( _this._state === _this.STATE.ROTATE && !_this.noRotate ) {

//console.log("ROTATE");
            _this._rotateEnd.copy( getMouseProjectionOnBall( event.pageX, event.pageY ) );

        } else if ( _this._state === _this.STATE.ZOOM && !_this.noZoom ) {

            _this._zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

        } else if ( _this._state === _this.STATE.PAN && !_this.noPan ) {

            _this._panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

        }

    }

    function mouseup( event ) {
        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        _this._state = _this.STATE.NONE;

        document.removeEventListener( 'mousemove', mousemove );
        document.removeEventListener( 'mouseup', mouseup );
        _this.dispatchEvent( endEvent );

    }

    function mousewheel( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        var delta = 0;

        if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta / 40;

        } else if ( event.detail ) { // Firefox

            delta = - event.detail / 3;

        }

        //_this._zoomStart.y += delta * 0.01;
        //_this._zoomStart.y = delta * 0.01;
        _this._zoomStart.y = delta * 0.005;
        _this.dispatchEvent( startEvent );
        _this.dispatchEvent( endEvent );

    }

    function touchstart( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        switch ( event.touches.length ) {
            case 1:
                _this._state = _this.STATE.TOUCH_ROTATE;
                _this._rotateStart.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                _this._rotateEnd.copy( _this._rotateStart );
                break;

            case 2:
                _this._state = _this.STATE.TOUCH_ZOOM_PAN;
                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                _this._panStart.copy( getMouseOnScreen( x, y ) );
                _this._panEnd.copy( _this._panStart );
                break;

            default:
                _this._state = _this.STATE.NONE;

        }
        _this.dispatchEvent( startEvent );


    }

    function touchmove( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        switch ( event.touches.length ) {

            case 1:
                _this._rotateEnd.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                break;

            case 2:
                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                _this._panEnd.copy( getMouseOnScreen( x, y ) );
                break;

            default:
                _this._state = _this.STATE.NONE;

        }

    }

    function touchend( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        switch ( event.touches.length ) {

            case 1:
                _this._rotateEnd.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                _this._rotateStart.copy( _this._rotateEnd );
                break;

            case 2:
                _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;

                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                _this._panEnd.copy( getMouseOnScreen( x, y ) );
                _this._panStart.copy( _this._panEnd );
                break;

        }

        _this._state = _this.STATE.NONE;
        _this.dispatchEvent( endEvent );

    }

    if(Object.keys(window).length >= 2 && this.domElement) {
        this.domElement.addEventListener( 'contextmn', function ( event ) {
            //event.preventDefault();
        }, false );

        this.domElement.addEventListener( 'mousedown', mousedown, false );

        this.domElement.addEventListener( 'mousewheel', mousewheel, false );
        this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

        this.domElement.addEventListener( 'touchstart', touchstart, false );
        this.domElement.addEventListener( 'touchend', touchend, false );
        this.domElement.addEventListener( 'touchmove', touchmove, false );

        if(Object.keys(window).length >= 2) window.addEventListener( 'keydown', keydown, false );
        if(Object.keys(window).length >= 2) window.addEventListener( 'keyup', keyup, false );
    }

    this.handleResize();

    // force an update at start
    this.update();

};

THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.TrackballControls.prototype.constructor = THREE.TrackballControls;

/* OrthographicTrackballControls.js from http://threejs.org/
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin  / http://mark-lundin.com
 * @author Patrick Fuller / http://patrick-fuller.com
 * modified by Jiyao Wang
 */



THREE.OrthographicTrackballControls = function ( object, domElement, icn3d ) { var me = this, ic = me.icn3d; "use strict";
    var _this = this;
    var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

    this.object = object;
    this.domElement = ( domElement !== undefined ) ? domElement : document;

    // API
    this.enabled = true;

    this.screen = { left: 0, top: 0, width: 0, height: 0 };

    // JW: the rotation speed of orthographic should be much less than that of perspective
    //this.rotateSpeed = 1.0;
    this.rotateSpeed = 0.5;
    this.zoomSpeed = 1.2;

    var zoomSpeedAdjust = 0.01;
    this.zoomSpeed *= zoomSpeedAdjust;

    //this.panSpeed = 0.3;
    this.panSpeed = 0.03;

    this.noRotate = false;
    this.noZoom = false;
    this.noPan = false;
    this.noRoll = false;

    this.staticMoving = false;
    this.dynamicDampingFactor = 0.2;

    this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

    // internals

    this.target = new THREE.Vector3();

    var EPS = 0.000001;

    var lastPosition = new THREE.Vector3();

    this._state = STATE.NONE;
    var _prevState = STATE.NONE;

    var _eye = new THREE.Vector3();

    this._rotateStart = new THREE.Vector3();
    this._rotateEnd = new THREE.Vector3();

    this._zoomStart = new THREE.Vector2();
    this._zoomEnd = new THREE.Vector2();
    var _zoomFactor = 1;

    var _touchZoomDistanceStart = 0;
    var _touchZoomDistanceEnd = 0;

    this._panStart = new THREE.Vector2();
    this._panEnd = new THREE.Vector2();

    // for reset

    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.up0 = this.object.up.clone();

    this.left0 = this.object.left;
    this.right0 = this.object.right;
    this.top0 = this.object.top;
    this.bottom0 = this.object.bottom;
    this.center0 = new THREE.Vector2((this.left0 + this.right0) / 2.0, (this.top0 + this.bottom0) / 2.0);

    // events

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start'};
    var endEvent = { type: 'end'};


    // methods

    this.handleResize = function () {

        if ( this.domElement === document ) {

            this.screen.left = 0;
            this.screen.top = 0;
            this.screen.width = window.innerWidth;
            this.screen.height = window.innerHeight;

        } else if(this.domElement) {

            var box = this.domElement.getBoundingClientRect();
            // adjustments come from similar code in the jquery offset() function
            var d = this.domElement.ownerDocument.documentElement;
            this.screen.left = box.left + window.pageXOffset - d.clientLeft;
            this.screen.top = box.top + window.pageYOffset - d.clientTop;
            this.screen.width = box.width;
            this.screen.height = box.height;
        }

        this.left0 = this.object.left;
        this.right0 = this.object.right;
        this.top0 = this.object.top;
        this.bottom0 = this.object.bottom;
        this.center0.set((this.left0 + this.right0) / 2.0, (this.top0 + this.bottom0) / 2.0);

    };

    this.handleEvent = function ( event ) {

        if ( typeof this[ event.type ] === 'function' ) {

            this[ event.type ]( event );

        }

    };

    var getMouseOnScreen = ( function () {

        var vector = new THREE.Vector2();

        return function ( pageX, pageY ) {

            vector.set(
                ( pageX - _this.screen.left ) / _this.screen.width,
                ( pageY - _this.screen.top ) / _this.screen.height
            );

            return vector;

        };

    }() );

    var getMouseProjectionOnBall = ( function () {

        var vector = new THREE.Vector3();
        var objectUp = new THREE.Vector3();
        var mouseOnBall = new THREE.Vector3();

        return function ( pageX, pageY ) {

            mouseOnBall.set(
                ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / (_this.screen.width*.5),
                ( _this.screen.height * 0.5 + _this.screen.top - pageY ) / (_this.screen.height*.5),
                0.0
            );

            var length = mouseOnBall.length();

            if ( _this.noRoll ) {

                if ( length < Math.SQRT1_2 ) {

                    mouseOnBall.z = Math.sqrt( 1.0 - length*length );

                } else {

                    mouseOnBall.z = .5 / length;

                }

            } else if ( length > 1.0 ) {

                mouseOnBall.normalize();

            } else {

                mouseOnBall.z = Math.sqrt( 1.0 - length * length );

            }

            _eye.copy( _this.object.position ).sub( _this.target );

            vector.copy( _this.object.up ).setLength( mouseOnBall.y )
            vector.add( objectUp.copy( _this.object.up ).cross( _eye ).setLength( mouseOnBall.x ) );
            vector.add( _eye.setLength( mouseOnBall.z ) );

            return vector;

        };

    }() );

    this.rotateCamera = (function(quaternionIn, bUpdate){

        var axis = new THREE.Vector3(),
            quaternion = new THREE.Quaternion();

        return function (quaternionIn, bUpdate) {

            var angle;
            if(quaternionIn === undefined) {
              angle = Math.acos( _this._rotateStart.dot( _this._rotateEnd ) / _this._rotateStart.length() / _this._rotateEnd.length() );
            }

            //var angle = Math.acos( _this._rotateStart.dot( _this._rotateEnd ) / _this._rotateStart.length() / _this._rotateEnd.length() );

            if ( angle || quaternionIn !== undefined) {
                if(quaternionIn === undefined) {
                  axis.crossVectors( _this._rotateStart, _this._rotateEnd ).normalize();

                  angle *= _this.rotateSpeed;

                  quaternion.setFromAxisAngle( axis, -angle );
                }
                else {
                  quaternion.copy(quaternionIn);
                }

                // order matters in quaernion multiplication: http://www.cprogramming.com/tutorial/3d/quaternions.html
                if(icn3d !== undefined && icn3d.quaternion !== undefined && (bUpdate === undefined || bUpdate === true)) icn3d.quaternion.multiplyQuaternions(quaternion, icn3d.quaternion);

                _eye.applyQuaternion( quaternion );
                _this.object.up.applyQuaternion( quaternion );

                _this._rotateEnd.applyQuaternion( quaternion );

                if ( _this.staticMoving ) {

                    _this._rotateStart.copy( _this._rotateEnd );

                } else {

                    quaternion.setFromAxisAngle( axis, angle * ( _this.dynamicDampingFactor - 1.0 ) );
                    _this._rotateStart.applyQuaternion( quaternion );

                }

            }
        }

    }());

    this.zoomCamera = function (zoomFactor, bUpdate) {

        var factor;
        if ( _this._state === STATE.TOUCH_ZOOM_PAN ) {

            if(zoomFactor !== undefined) {
              factor = zoomFactor;
            }
            else {

              factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
              _touchZoomDistanceStart = _touchZoomDistanceEnd;
            }

        } else {

            if(zoomFactor !== undefined) {
              factor = zoomFactor;
            }
            else {

              factor = 1.0 + ( _this._zoomEnd.y - _this._zoomStart.y ) * _this.zoomSpeed / zoomSpeedAdjust;
            }
        }

        if(icn3d !== undefined && icn3d._zoomFactor !== undefined && (bUpdate === undefined || bUpdate === true)) icn3d._zoomFactor *= factor;

        //if ( factor !== 1.0 && factor > 0.0 ) {
        if ( factor !== 1.0 ) {

            //_zoomFactor *= factor;
            _zoomFactor = factor;

            _this.object.left = _zoomFactor * _this.left0 + ( 1 - _zoomFactor ) *  _this.center0.x;
            _this.object.right = _zoomFactor * _this.right0 + ( 1 - _zoomFactor ) *  _this.center0.x;
            _this.object.top = _zoomFactor * _this.top0 + ( 1 - _zoomFactor ) *  _this.center0.y;
            _this.object.bottom = _zoomFactor * _this.bottom0 + ( 1 - _zoomFactor ) *  _this.center0.y;

            if ( _this.staticMoving ) {

                _this._zoomStart.copy( _this._zoomEnd );

            } else {

                _this._zoomStart.y += ( _this._zoomEnd.y - _this._zoomStart.y ) * this.dynamicDampingFactor;

            }

        }

    };

    this.panCamera = (function(mouseChangeIn, bUpdate){

        var mouseChange = new THREE.Vector2(),
            objectUp = new THREE.Vector3(),
            pan = new THREE.Vector3();

        return function (mouseChangeIn, bUpdate) {

            if(mouseChangeIn !== undefined) {
              mouseChange = mouseChangeIn;

              if(icn3d !== undefined && icn3d.mouseChange !== undefined && (bUpdate === undefined || bUpdate === true)) icn3d.mouseChange.add(mouseChangeIn);
            }
            else {
              mouseChange.copy( _this._panEnd ).sub( _this._panStart );

              if(icn3d !== undefined && icn3d.mouseChange !== undefined && (bUpdate === undefined || bUpdate === true)) icn3d.mouseChange.add( _this._panEnd ).sub( _this._panStart );
            }

            if ( mouseChange.lengthSq() ) {

                mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );

                pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
                pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );

                _this.object.position.add( pan );
                _this.target.add( pan );

                if ( _this.staticMoving ) {

                    _this._panStart.copy( _this._panEnd );

                } else {

                    _this._panStart.add( mouseChange.subVectors( _this._panEnd, _this._panStart ).multiplyScalar( _this.dynamicDampingFactor ) );

                }

            }
        }

    }());

    this.update = function (para) {

        _eye.subVectors( _this.object.position, _this.target );

        if ( !_this.noRotate ) {

            if(para !== undefined && para.quaternion !== undefined) {
              _this.rotateCamera(para.quaternion, para.update);
            }
            else {
              _this.rotateCamera();
            }

        }

        if ( !_this.noZoom ) {

            if(para !== undefined && para._zoomFactor !== undefined) {
              _this.zoomCamera(para._zoomFactor, para.update);
            }
            else {
              _this.zoomCamera();
            }

            _this.object.updateProjectionMatrix();

        }

        if ( !_this.noPan ) {

            if(para !== undefined && para.mouseChange !== undefined) {
              _this.panCamera(para.mouseChange, para.update);
            }
            else {
              _this.panCamera();
            }

        }

        _this.object.position.addVectors( _this.target, _eye );

        _this.object.lookAt( _this.target );

        if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {

            _this.dispatchEvent( changeEvent );

            lastPosition.copy( _this.object.position );

        }

    };

    this.reset = function () {

        _this._state = STATE.NONE;
        _prevState = STATE.NONE;

        _this.target.copy( _this.target0 );
        _this.object.position.copy( _this.position0 );
        _this.object.up.copy( _this.up0 );

        _eye.subVectors( _this.object.position, _this.target );

        _this.object.left = _this.left0;
        _this.object.right = _this.right0;
        _this.object.top = _this.top0;
        _this.object.bottom = _this.bottom0;

        _this.object.lookAt( _this.target );

        _this.dispatchEvent( changeEvent );

        lastPosition.copy( _this.object.position );

    };

    // listeners

    function keydown( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        window.removeEventListener( 'keydown', keydown );

        _prevState = _this._state;

        if ( _this._state !== STATE.NONE ) {

            return;

        } else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && !_this.noRotate ) {

            _this._state = STATE.ROTATE;

        } else if ( (event.keyCode === _this.keys[ STATE.ZOOM ]) && !_this.noZoom ) {

            _this._state = STATE.ZOOM;

        } else if ( (event.keyCode === _this.keys[ STATE.PAN ]) && !_this.noPan ) {

            _this._state = STATE.PAN;

        }

    }

    function keyup( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        _this._state = _prevState;

        window.addEventListener( 'keydown', keydown, false );

    }

    function mousedown( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        if ( _this._state === STATE.NONE ) {

            _this._state = event.button;

        }

        if ( _this._state === STATE.ROTATE && !_this.noRotate ) {

            _this._rotateStart.copy( getMouseProjectionOnBall( event.pageX, event.pageY ) );
            _this._rotateEnd.copy( _this._rotateStart );

        } else if ( _this._state === STATE.ZOOM && !_this.noZoom ) {

            _this._zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
            _this._zoomEnd.copy(_this._zoomStart);

        } else if ( _this._state === STATE.PAN && !_this.noPan ) {

            _this._panStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
            _this._panEnd.copy(_this._panStart)

        }

        document.addEventListener( 'mousemove', mousemove, false );
        document.addEventListener( 'mouseup', mouseup, false );

        _this.dispatchEvent( startEvent );

    }

    function mousemove( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        if ( _this._state === STATE.ROTATE && !_this.noRotate ) {

            _this._rotateEnd.copy( getMouseProjectionOnBall( event.pageX, event.pageY ) );

        } else if ( _this._state === STATE.ZOOM && !_this.noZoom ) {

            _this._zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

        } else if ( _this._state === STATE.PAN && !_this.noPan ) {

            _this._panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

        }

    }

    function mouseup( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        _this._state = STATE.NONE;

        document.removeEventListener( 'mousemove', mousemove );
        document.removeEventListener( 'mouseup', mouseup );
        _this.dispatchEvent( endEvent );

    }

    function mousewheel( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        var delta = 0;

        if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta / 40;

        } else if ( event.detail ) { // Firefox

            delta = - event.detail / 3;

        }

        //_this._zoomStart.y += delta * 0.01;
        _this._zoomStart.y = delta * 0.01;
        _this.dispatchEvent( startEvent );
        _this.dispatchEvent( endEvent );

    }

    function touchstart( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        switch ( event.touches.length ) {

            case 1:
                _this._state = STATE.TOUCH_ROTATE;
                _this._rotateStart.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                _this._rotateEnd.copy( _this._rotateStart );
                break;

            case 2:
                _this._state = STATE.TOUCH_ZOOM_PAN;
                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                _this._panStart.copy( getMouseOnScreen( x, y ) );
                _this._panEnd.copy( _this._panStart );
                break;

            default:
                _this._state = STATE.NONE;

        }
        _this.dispatchEvent( startEvent );


    }

    function touchmove( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        //event.preventDefault();
        event.stopPropagation();

        switch ( event.touches.length ) {

            case 1:
                _this._rotateEnd.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                break;

            case 2:
                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                _this._panEnd.copy( getMouseOnScreen( x, y ) );
                break;

            default:
                _this._state = STATE.NONE;

        }

    }

    function touchend( event ) {

        if ( _this.enabled === false || Object.keys(window).length < 2)  return;

        switch ( event.touches.length ) {

            case 1:
                _this._rotateEnd.copy( getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                _this._rotateStart.copy( _this._rotateEnd );
                break;

            case 2:
                _touchZoomDistanceStart = _touchZoomDistanceEnd = 0;

                var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                _this._panEnd.copy( getMouseOnScreen( x, y ) );
                _this._panStart.copy( _this._panEnd );
                break;

        }

        _this._state = STATE.NONE;
        _this.dispatchEvent( endEvent );

    }

    if(Object.keys(window).length >= 2 && this.domElement) {
        this.domElement.addEventListener( 'contextmn', function ( event ) {
            //event.preventDefault();
        }, false );

        this.domElement.addEventListener( 'mousedown', mousedown, false );

        this.domElement.addEventListener( 'mousewheel', mousewheel, false );
        this.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

        this.domElement.addEventListener( 'touchstart', touchstart, false );
        this.domElement.addEventListener( 'touchend', touchend, false );
        this.domElement.addEventListener( 'touchmove', touchmove, false );

        window.addEventListener( 'keydown', keydown, false );
        window.addEventListener( 'keyup', keyup, false );
    }

    this.handleResize();

    // force an update at start
    this.update();

};

THREE.OrthographicTrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrthographicTrackballControls.prototype.constructor = THREE.OrthographicTrackballControls;

/*
! function(r, t) {
    "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t(r.MMTF = r.MMTF || {})
}(this, function(r) {
    "use strict";
*/

var MMTF = {};

MMTF = initIcn3dpyMMTF(MMTF);

function initIcn3dpyMMTF(r) {
function t(r,t,n){for(var e=(r.byteLength,0),i=n.length;i>e;e++){var o=n.charCodeAt(e);if(128>o)r.setUint8(t++,o>>>0&127|0);else if(2048>o)r.setUint8(t++,o>>>6&31|192),r.setUint8(t++,o>>>0&63|128);else if(65536>o)r.setUint8(t++,o>>>12&15|224),r.setUint8(t++,o>>>6&63|128),r.setUint8(t++,o>>>0&63|128);else{if(!(1114112>o))throw new Error("bad codepoint "+o);r.setUint8(t++,o>>>18&7|240),r.setUint8(t++,o>>>12&63|128),r.setUint8(t++,o>>>6&63|128),r.setUint8(t++,o>>>0&63|128)}}}function n(r){for(var t=0,n=0,e=r.length;e>n;n++){var i=r.charCodeAt(n);if(128>i)t+=1;else if(2048>i)t+=2;else if(65536>i)t+=3;else{if(!(1114112>i))throw new Error("bad codepoint "+i);t+=4}}return t}function e(r,i,o){var a=typeof r;if("string"===a){var u=n(r);if(32>u)return i.setUint8(o,160|u),t(i,o+1,r),1+u;if(256>u)return i.setUint8(o,217),i.setUint8(o+1,u),t(i,o+2,r),2+u;if(65536>u)return i.setUint8(o,218),i.setUint16(o+1,u),t(i,o+3,r),3+u;if(4294967296>u)return i.setUint8(o,219),i.setUint32(o+1,u),t(i,o+5,r),5+u}if(r instanceof Uint8Array){var u=r.byteLength,s=new Uint8Array(i.buffer);if(256>u)return i.setUint8(o,196),i.setUint8(o+1,u),s.set(r,o+2),2+u;if(65536>u)return i.setUint8(o,197),i.setUint16(o+1,u),s.set(r,o+3),3+u;if(4294967296>u)return i.setUint8(o,198),i.setUint32(o+1,u),s.set(r,o+5),5+u}if("number"===a){if(!isFinite(r))throw new Error("Number not finite: "+r);if(Math.floor(r)!==r)return i.setUint8(o,203),i.setFloat64(o+1,r),9;if(r>=0){if(128>r)return i.setUint8(o,r),1;if(256>r)return i.setUint8(o,204),i.setUint8(o+1,r),2;if(65536>r)return i.setUint8(o,205),i.setUint16(o+1,r),3;if(4294967296>r)return i.setUint8(o,206),i.setUint32(o+1,r),5;throw new Error("Number too big 0x"+r.toString(16))}if(r>=-32)return i.setInt8(o,r),1;if(r>=-128)return i.setUint8(o,208),i.setInt8(o+1,r),2;if(r>=-32768)return i.setUint8(o,209),i.setInt16(o+1,r),3;if(r>=-2147483648)return i.setUint8(o,210),i.setInt32(o+1,r),5;throw new Error("Number too small -0x"+(-r).toString(16).substr(1))}if(null===r)return i.setUint8(o,192),1;if("boolean"===a)return i.setUint8(o,r?195:194),1;if("object"===a){var u,f=0,c=Array.isArray(r);if(c)u=r.length;else{var d=Object.keys(r);u=d.length}if(16>u?(i.setUint8(o,u|(c?144:128)),f=1):65536>u?(i.setUint8(o,c?220:222),i.setUint16(o+1,u),f=3):4294967296>u&&(i.setUint8(o,c?221:223),i.setUint32(o+1,u),f=5),c)for(var l=0;u>l;l++)f+=e(r[l],i,o+f);else for(var l=0;u>l;l++){var g=d[l];f+=e(g,i,o+f),f+=e(r[g],i,o+f)}return f}throw new Error("Unknown type "+a)}function i(r){var t=typeof r;if("string"===t){var e=n(r);if(32>e)return 1+e;if(256>e)return 2+e;if(65536>e)return 3+e;if(4294967296>e)return 5+e}if(r instanceof Uint8Array){var e=r.byteLength;if(256>e)return 2+e;if(65536>e)return 3+e;if(4294967296>e)return 5+e}if("number"===t){if(Math.floor(r)!==r)return 9;if(r>=0){if(128>r)return 1;if(256>r)return 2;if(65536>r)return 3;if(4294967296>r)return 5;throw new Error("Number too big 0x"+r.toString(16))}if(r>=-32)return 1;if(r>=-128)return 2;if(r>=-32768)return 3;if(r>=-2147483648)return 5;throw new Error("Number too small -0x"+r.toString(16).substr(1))}if("boolean"===t||null===r)return 1;if("object"===t){var e,o=0;if(Array.isArray(r)){e=r.length;for(var a=0;e>a;a++)o+=i(r[a])}else{var u=Object.keys(r);e=u.length;for(var a=0;e>a;a++){var s=u[a];o+=i(s)+i(r[s])}}if(16>e)return 1+o;if(65536>e)return 3+o;if(4294967296>e)return 5+o;throw new Error("Array or object too long 0x"+e.toString(16))}throw new Error("Unknown type "+t)}function o(r){var t=new ArrayBuffer(i(r)),n=new DataView(t);return e(r,n,0),new Uint8Array(t)}function a(r,t,n){return t?new r(t.buffer,t.byteOffset,t.byteLength/(n||1)):void 0}function u(r){return a(DataView,r)}function s(r){return a(Uint8Array,r)}function f(r){return a(Int8Array,r)}function c(r){return a(Int32Array,r,4)}function d(r){return a(Float32Array,r,4)}function l(r,t){var n=r.length/2;t||(t=new Int16Array(n));for(var e=0,i=0;n>e;++e,i+=2)t[e]=r[i]<<8^r[i+1]<<0;return t}function g(r,t){var n=r.length;t||(t=new Uint8Array(2*n));for(var e=u(t),i=0;n>i;++i)e.setInt16(2*i,r[i]);return s(t)}function v(r,t){var n=r.length/4;t||(t=new Int32Array(n));for(var e=0,i=0;n>e;++e,i+=4)t[e]=r[i]<<24^r[i+1]<<16^r[i+2]<<8^r[i+3]<<0;return t}function L(r,t){var n=r.length;t||(t=new Uint8Array(4*n));for(var e=u(t),i=0;n>i;++i)e.setInt32(4*i,r[i]);return s(t)}function h(r,t){var n=r.length;t||(t=new Float32Array(n/4));for(var e=u(t),i=u(r),o=0,a=0,s=n/4;s>o;++o,a+=4)e.setFloat32(a,i.getFloat32(a),!0);return t}function y(r,t,n){var e=r.length,i=1/t;n||(n=new Float32Array(e));for(var o=0;e>o;++o)n[o]=r[o]*i;return n}function m(r,t,n){var e=r.length;n||(n=new Int32Array(e));for(var i=0;e>i;++i)n[i]=Math.round(r[i]*t);return n}function p(r,t){var n,e;if(!t){var i=0;for(n=0,e=r.length;e>n;n+=2)i+=r[n+1];t=new r.constructor(i)}var o=0;for(n=0,e=r.length;e>n;n+=2)for(var a=r[n],u=r[n+1],s=0;u>s;++s)t[o]=a,++o;return t}function U(r){if(0===r.length)return new Int32Array;var t,n,e=2;for(t=1,n=r.length;n>t;++t)r[t-1]!==r[t]&&(e+=2);var i=new Int32Array(e),o=0,a=1;for(t=1,n=r.length;n>t;++t)r[t-1]!==r[t]?(i[o]=r[t-1],i[o+1]=a,a=1,o+=2):++a;return i[o]=r[r.length-1],i[o+1]=a,i}function b(r,t){var n=r.length;t||(t=new r.constructor(n)),n&&(t[0]=r[0]);for(var e=1;n>e;++e)t[e]=r[e]+t[e-1];return t}function I(r,t){var n=r.length;t||(t=new r.constructor(n)),t[0]=r[0];for(var e=1;n>e;++e)t[e]=r[e]-r[e-1];return t}function w(r,t){var n,e,i=r instanceof Int8Array?127:32767,o=-i-1,a=r.length;if(!t){var u=0;for(n=0;a>n;++n)r[n]<i&&r[n]>o&&++u;t=new Int32Array(u)}for(n=0,e=0;a>n;){for(var s=0;r[n]===i||r[n]===o;)s+=r[n],++n;s+=r[n],++n,t[e]=s,++e}return t}function C(r,t){var n,e=t?127:32767,i=-e-1,o=r.length,a=0;for(n=0;o>n;++n){var u=r[n];0===u?++a:u>0?(a+=Math.ceil(u/e),u%e===0&&(a+=1)):(a+=Math.ceil(u/i),u%i===0&&(a+=1))}var s=t?new Int8Array(a):new Int16Array(a),f=0;for(n=0;o>n;++n){var u=r[n];if(u>=0)for(;u>=e;)s[f]=e,++f,u-=e;else for(;i>=u;)s[f]=i,++f,u-=i;s[f]=u,++f}return s}function A(r,t){return b(p(r),t)}function x(r){return U(I(r))}function M(r,t,n){return y(p(r,c(n)),t,n)}function F(r,t){return U(m(r,t))}function S(r,t,n){return y(b(r,c(n)),t,n)}function E(r,t,n){return I(m(r,t),n)}function N(r,t,n){return y(w(r,c(n)),t,n)}function O(r,t,n){var e=w(r,c(n));return S(e,t,d(e))}function T(r,t,n){return C(E(r,t),n)}function k(r){var t=u(r),n=t.getInt32(0),e=t.getInt32(4),i=r.subarray(8,12),r=r.subarray(12);return[n,r,e,i]}function j(r,t,n,e){var i=new ArrayBuffer(12+e.byteLength),o=new Uint8Array(i),a=new DataView(i);return a.setInt32(0,r),a.setInt32(4,t),n&&o.set(n,8),o.set(e,12),o}function q(r){var t=r.length,n=s(r);return j(2,t,void 0,n)}function D(r){var t=r.length,n=L(r);return j(4,t,void 0,n)}function P(r,t){var n=r.length/t,e=L([t]),i=s(r);return j(5,n,e,i)}function z(r){var t=r.length,n=L(U(r));return j(6,t,void 0,n)}function B(r){var t=r.length,n=L(x(r));return j(8,t,void 0,n)}function V(r,t){var n=r.length,e=L([t]),i=L(F(r,t));return j(9,n,e,i)}function G(r,t){var n=r.length,e=L([t]),i=g(T(r,t));return j(10,n,e,i)}function R(r){var t={};return rr.forEach(function(n){void 0!==r[n]&&(t[n]=r[n])}),r.bondAtomList&&(t.bondAtomList=D(r.bondAtomList)),r.bondOrderList&&(t.bondOrderList=q(r.bondOrderList)),t.xCoordList=G(r.xCoordList,1e3),t.yCoordList=G(r.yCoordList,1e3),t.zCoordList=G(r.zCoordList,1e3),r.bFactorList&&(t.bFactorList=G(r.bFactorList,100)),r.atomIdList&&(t.atomIdList=B(r.atomIdList)),r.altLocList&&(t.altLocList=z(r.altLocList)),r.occupancyList&&(t.occupancyList=V(r.occupancyList,100)),t.groupIdList=B(r.groupIdList),t.groupTypeList=D(r.groupTypeList),r.secStructList&&(t.secStructList=q(r.secStructList)),r.insCodeList&&(t.insCodeList=z(r.insCodeList)),r.sequenceIndexList&&(t.sequenceIndexList=B(r.sequenceIndexList)),t.chainIdList=P(r.chainIdList,4),r.chainNameList&&(t.chainNameList=P(r.chainNameList,4)),t}function H(r){function t(r){for(var t={},n=0;r>n;n++){var e=o();t[e]=o()}return t}function n(t){var n=r.subarray(a,a+t);return a+=t,n}function e(t){var n=r.subarray(a,a+t);a+=t;var e=65535;if(t>e){for(var i=[],o=0;o<n.length;o+=e)i.push(String.fromCharCode.apply(null,n.subarray(o,o+e)));return i.join("")}return String.fromCharCode.apply(null,n)}function i(r){for(var t=new Array(r),n=0;r>n;n++)t[n]=o();return t}function o(){var o,s,f=r[a];if(0===(128&f))return a++,f;if(128===(240&f))return s=15&f,a++,t(s);if(144===(240&f))return s=15&f,a++,i(s);if(160===(224&f))return s=31&f,a++,e(s);if(224===(224&f))return o=u.getInt8(a),a++,o;switch(f){case 192:return a++,null;case 194:return a++,!1;case 195:return a++,!0;case 196:return s=u.getUint8(a+1),a+=2,n(s);case 197:return s=u.getUint16(a+1),a+=3,n(s);case 198:return s=u.getUint32(a+1),a+=5,n(s);case 202:return o=u.getFloat32(a+1),a+=5,o;case 203:return o=u.getFloat64(a+1),a+=9,o;case 204:return o=r[a+1],a+=2,o;case 205:return o=u.getUint16(a+1),a+=3,o;case 206:return o=u.getUint32(a+1),a+=5,o;case 208:return o=u.getInt8(a+1),a+=2,o;case 209:return o=u.getInt16(a+1),a+=3,o;case 210:return o=u.getInt32(a+1),a+=5,o;case 217:return s=u.getUint8(a+1),a+=2,e(s);case 218:return s=u.getUint16(a+1),a+=3,e(s);case 219:return s=u.getUint32(a+1),a+=5,e(s);case 220:return s=u.getUint16(a+1),a+=3,i(s);case 221:return s=u.getUint32(a+1),a+=5,i(s);case 222:return s=u.getUint16(a+1),a+=3,t(s);case 223:return s=u.getUint32(a+1),a+=5,t(s)}throw new Error("Unknown type 0x"+f.toString(16))}var a=0,u=new DataView(r.buffer);return o()}function W(r,t,n,e){switch(r){case 1:return h(t);case 2:return f(t);case 3:return l(t);case 4:return v(t);case 5:return s(t);case 6:return p(v(t),new Uint8Array(n));case 7:return p(v(t));case 8:return A(v(t));case 9:return M(v(t),v(e)[0]);case 10:return O(l(t),v(e)[0]);case 11:return y(l(t),v(e)[0]);case 12:return N(l(t),v(e)[0]);case 13:return N(f(t),v(e)[0]);case 14:return w(l(t));case 15:return w(f(t))}}function X(r,t){t=t||{};var n=t.ignoreFields,e={};return nr.forEach(function(t){var i=n?-1!==n.indexOf(t):!1,o=r[t];i||void 0===o||(o instanceof Uint8Array?e[t]=W.apply(null,k(o)):e[t]=o)}),e}function J(r){return String.fromCharCode.apply(null,r).replace(/\0/g,"")}function K(r,t,n){n=n||{};var e,i,o,a,u,s,f=n.firstModelOnly,c=t.onModel,d=t.onChain,l=t.onGroup,g=t.onAtom,v=t.onBond,L=0,h=0,y=0,m=0,p=0,U=-1,b=r.chainNameList,I=r.secStructList,w=r.insCodeList,C=r.sequenceIndexList,A=r.atomIdList,x=r.bFactorList,M=r.altLocList,F=r.occupancyList,S=r.bondAtomList,E=r.bondOrderList;for(e=0,i=r.chainsPerModel.length;i>e&&!(f&&L>0);++e){var N=r.chainsPerModel[L];for(c&&c({chainCount:N,modelIndex:L}),o=0;N>o;++o){var O=r.groupsPerChain[h];if(d){var T=J(r.chainIdList.subarray(4*h,4*h+4)),k=null;b&&(k=J(b.subarray(4*h,4*h+4))),d({groupCount:O,chainIndex:h,modelIndex:L,chainId:T,chainName:k})}for(a=0;O>a;++a){var j=r.groupList[r.groupTypeList[y]],q=j.atomNameList.length;if(l){var D=null;I&&(D=I[y]);var P=null;r.insCodeList&&(P=String.fromCharCode(w[y]));var z=null;C&&(z=C[y]),l({atomCount:q,groupIndex:y,chainIndex:h,modelIndex:L,groupId:r.groupIdList[y],groupType:r.groupTypeList[y],groupName:j.groupName,singleLetterCode:j.singleLetterCode,chemCompType:j.chemCompType,secStruct:D,insCode:P,sequenceIndex:z})}for(u=0;q>u;++u){if(g){var B=null;A&&(B=A[m]);var V=null;x&&(V=x[m]);var G=null;M&&(G=String.fromCharCode(M[m]));var R=null;F&&(R=F[m]),g({atomIndex:m,groupIndex:y,chainIndex:h,modelIndex:L,atomId:B,element:j.elementList[u],atomName:j.atomNameList[u],formalCharge:j.formalChargeList[u],xCoord:r.xCoordList[m],yCoord:r.yCoordList[m],zCoord:r.zCoordList[m],bFactor:V,altLoc:G,occupancy:R})}m+=1}if(v){var H=j.bondAtomList;for(u=0,s=j.bondOrderList.length;s>u;++u)v({atomIndex1:m-q+H[2*u],atomIndex2:m-q+H[2*u+1],bondOrder:j.bondOrderList[u]})}y+=1}h+=1}if(p=U+1,U=m-1,v&&S)for(u=0,s=S.length;s>u;u+=2){var W=S[u],X=S[u+1];(W>=p&&U>=W||X>=p&&U>=X)&&v({atomIndex1:W,atomIndex2:X,bondOrder:E?E[u/2]:null})}L+=1}}function Q(r){return o(R(r))}function Y(r,t){r instanceof ArrayBuffer&&(r=new Uint8Array(r));var n;return n=r instanceof Uint8Array?H(r):r,X(n,t)}function Z(r,t,n,e){function i(){try{var r=Y(o.response);n(r)}catch(t){e(t)}}var o=new XMLHttpRequest;o.addEventListener("load",i,!0),o.addEventListener("error",e,!0),o.responseType="arraybuffer",o.open("GET",t+r.toUpperCase()),o.send()}function $(r,t,n){Z(r,or,t,n)}function _(r,t,n){Z(r,ar,t,n)}

//var rr=["mmtfVersion","mmtfProducer","unitCell","spaceGroup","structureId","title","depositionDate","releaseDate","experimentalMethods","resolution","rFree","rWork","bioAssemblyList","ncsOperatorList","entityList","groupList","numBonds","numAtoms","numGroups","numChains","numModels","groupsPerChain","chainsPerModel"],tr=["xCoordList","yCoordList","zCoordList","groupIdList","groupTypeList","chainIdList","bFactorList","atomIdList","altLocList","occupancyList","secStructList","insCodeList","sequenceIndexList","chainNameList","bondAtomList","bondOrderList"],nr=rr.concat(tr),er="v1.0.1",ir="//mmtf.rcsb.org/v1.0/",or=ir+"full/",ar=ir+"reduced/";r.encode=Q,r.decode=Y,r.traverse=K,r.fetch=$,r.fetchReduced=_,r.version=er,r.fetchUrl=or,r.fetchReducedUrl=ar,r.encodeMsgpack=o,r.encodeMmtf=R,r.decodeMsgpack=H,r.decodeMmtf=X

    var rr = ["mmtfVersion", "mmtfProducer", "unitCell", "spaceGroup", "structureId", "title", "depositionDate", "releaseDate", "experimentalMethods", "resolution", "rFree", "rWork", "bioAssemblyList", "ncsOperatorList", "entityList", "groupList", "numBonds", "numAtoms", "numGroups", "numChains", "numModels", "groupsPerChain", "chainsPerModel"],
        tr = ["xCoordList", "yCoordList", "zCoordList", "groupIdList", "groupTypeList", "chainIdList", "bFactorList", "atomIdList", "altLocList", "occupancyList", "secStructList", "insCodeList", "sequenceIndexList", "chainNameList", "bondAtomList", "bondOrderList"],
        nr = rr.concat(tr),
        er = "v1.0.1",
        ir = "//mmtf.rcsb.org/v1.0/",
        or = ir + "full/",
        ar = ir + "reduced/";
    r.encode = Q, r.decode = Y, r.traverse = K, r.fetch = $, r.fetchReduced = _, r.version = er, r.fetchUrl = or, r.fetchReducedUrl = ar, r.encodeMsgpack = o, r.encodeMmtf = R, r.decodeMsgpack = H, r.decodeMmtf = X

    return r;
}

//});

/*
 * ==========================================================
 *  COLOR PICKER PLUGIN 1.3.9
 * ==========================================================
 * Author: Taufik Nurrohman <https://github.com/tovic>
 * License: MIT
 * ----------------------------------------------------------
 */

(function(win, doc, NS) {

    var instance = '__instance__',
        first = 'firstChild',
        delay = setTimeout;

    function is_set(x) {
        return typeof x !== "undefined";
    }

    function is_string(x) {
        return typeof x === "string";
    }

    function is_object(x) {
        return typeof x === "object";
    }

    function object_length(x) {
        return Object.keys(x).length;
    }

    function edge(a, b, c) {
        if (a < b) return b;
        if (a > c) return c;
        return a;
    }

    function num(i, j) {
        return parseInt(i, j || 10);
    }

    function round(i) {
        return Math.round(i);
    }

    // [h, s, v] ... 0 <= h, s, v <= 1
    function HSV2RGB(a) {
        var h = +a[0],
            s = +a[1],
            v = +a[2],
            r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        i = i || 0;
        q = q || 0;
        t = t || 0;
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        return [round(r * 255), round(g * 255), round(b * 255)];
    }

    function HSV2HEX(a) {
        return RGB2HEX(HSV2RGB(a));
    }

    // [r, g, b] ... 0 <= r, g, b <= 255
    function RGB2HSV(a) {
        var r = +a[0],
            g = +a[1],
            b = +a[2],
            max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            d = max - min,
            h, s = (max === 0 ? 0 : d / max),
            v = max / 255;
        switch (max) {
            case min:
                h = 0;
                break;
            case r:
                h = (g - b) + d * (g < b ? 6 : 0);
                h /= 6 * d;
                break;
            case g:
                h = (b - r) + d * 2;
                h /= 6 * d;
                break;
            case b:
                h = (r - g) + d * 4;
                h /= 6 * d;
                break;
        }
        return [h, s, v];
    }

    function RGB2HEX(a) {
        var s = +a[2] | (+a[1] << 8) | (+a[0] << 16);
        s = '000000' + s.toString(16);
        return s.slice(-6);
    }

    // rrggbb or rgb
    function HEX2HSV(s) {
        return RGB2HSV(HEX2RGB(s));
    }

    function HEX2RGB(s) {
        if (s.length === 3) {
            s = s.replace(/./g, '$&$&');
        }
        return [num(s[0] + s[1], 16), num(s[2] + s[3], 16), num(s[4] + s[5], 16)];
    }

    // convert range from `0` to `360` and `0` to `100` in color into range from `0` to `1`
    function _2HSV_pri(a) {
        return [+a[0] / 360, +a[1] / 100, +a[2] / 100];
    }

    // convert range from `0` to `1` into `0` to `360` and `0` to `100` in color
    function _2HSV_pub(a) {
        return [round(+a[0] * 360), round(+a[1] * 100), round(+a[2] * 100)];
    }

    // convert range from `0` to `255` in color into range from `0` to `1`
    function _2RGB_pri(a) {
        return [+a[0] / 255, +a[1] / 255, +a[2] / 255];
    }

    // *
    function parse(x) {
        if (is_object(x)) return x;
        var rgb = /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i.exec(x),
            hsv = /\s*hsv\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/i.exec(x),
            hex = x[0] === '#' && x.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
        if (hex) {
            return HEX2HSV(x.slice(1));
        } else if (hsv) {
            return _2HSV_pri([+hsv[1], +hsv[2], +hsv[3]]);
        } else if (rgb) {
            return RGB2HSV([+rgb[1], +rgb[2], +rgb[3]]);
        }
        return [0, 1, 1]; // default is red
    }

    (function($) {

        // plugin version
        $.version = '1.3.9';

        // collect all instance(s)
        $[instance] = {};

        // plug to all instance(s)
        $.each = function(fn, t) {
            return delay(function() {
                var ins = $[instance], i;
                for (i in ins) {
                    fn(ins[i], i, ins);
                }
            }, t === 0 ? 0 : (t || 1)), $;
        };

        // static method(s)
        $.parse = parse;
        $._HSV2RGB = HSV2RGB;
        $._HSV2HEX = HSV2HEX;
        $._RGB2HSV = RGB2HSV;
        $._HEX2HSV = HEX2HSV;
        $._HEX2RGB = function(a) {
            return _2RGB_pri(HEX2RGB(a));
        };
        $.HSV2RGB = function(a) {
            return HSV2RGB(_2HSV_pri(a));
        };
        $.HSV2HEX = function(a) {
            return HSV2HEX(_2HSV_pri(a));
        };
        $.RGB2HSV = function(a) {
            return _2HSV_pub(RGB2HSV(a));
        };
        $.RGB2HEX = RGB2HEX;
        $.HEX2HSV = function(s) {
            return _2HSV_pub(HEX2HSV(s));
        };
        $.HEX2RGB = HEX2RGB;

    })(win[NS] = function(target, events, parent) {

        var b = doc.body,
            h = doc.documentElement,
            $ = this,
            $$ = win[NS],
            _ = false,
            hooks = {},
            picker = doc.createElement('div'),
            on_down = "touchstart mousedown",
            on_move = "touchmove mousemove",
            on_up = "touchend mouseup",
            on_resize = "orientationchange resize";

        // return a new instance if `CP` was called without the `new` operator
        if (!($ instanceof $$)) {
            return new $$(target, events);
        }

        // store color picker instance to `CP.__instance__`
        $$[instance][target.id || target.name || object_length($$[instance])] = $;

        // trigger color picker panel on click by default
        if (!is_set(events) || events === true) {
            events = on_down;
        }

        // add event
        function on(ev, el, fn) {
            ev = ev.split(/\s+/);
            for (var i = 0, ien = ev.length; i < ien; ++i) {
                el.addEventListener(ev[i], fn, false);
            }
        }

        // remove event
        function off(ev, el, fn) {
            ev = ev.split(/\s+/);
            for (var i = 0, ien = ev.length; i < ien; ++i) {
                el.removeEventListener(ev[i], fn);
            }
        }

        // get mouse/finger coordinate
        function point(el, e) {
            var T = 'touches',
                X = 'clientX',
                Y = 'clientY',
                x = !!e[T] ? e[T][0][X] : e[X],
                y = !!e[T] ? e[T][0][Y] : e[Y],
                o = offset(el);
            return {
                x: x - o.l,
                y: y - o.t
            };
        }

        // get position
        function offset(el) {
            var left, top, rect;
            if (el === win) {
                left = win.pageXOffset || h.scrollLeft;
                top = win.pageYOffset || h.scrollTop;
            } else {
                rect = el.getBoundingClientRect();
                left = rect.left;
                top = rect.top;
            }
            return {
                l: left,
                t: top
            };
        }

        // get closest parent
        function closest(a, b) {
            while ((a = a.parentElement) && a !== b);
            return a;
        }

        // prevent default
        function prevent(e) {
            if (e) e.preventDefault();
        }

        // get dimension
        function size(el) {
            return el === win ? {
                w: win.innerWidth,
                h: win.innerHeight
            } : {
                w: el.offsetWidth,
                h: el.offsetHeight
            };
        }

        // get color data
        function get_data(a) {
            return _ || (is_set(a) ? a : false);
        }

        // set color data
        function set_data(a) {
            _ = a;
        }

        // add hook
        function add(ev, fn, id) {
            if (!is_set(ev)) return hooks;
            if (!is_set(fn)) return hooks[ev];
            if (!is_set(hooks[ev])) hooks[ev] = {};
            if (!is_set(id)) id = object_length(hooks[ev]);
            return hooks[ev][id] = fn, $;
        }

        // remove hook
        function remove(ev, id) {
            if (!is_set(ev)) return hooks = {}, $;
            if (!is_set(id)) return hooks[ev] = {}, $;
            return delete hooks[ev][id], $;
        }

        // trigger hook
        function trigger(ev, a, id) {
            if (!is_set(hooks[ev])) return $;
            if (!is_set(id)) {
                for (var i in hooks[ev]) {
                    hooks[ev][i].apply($, a);
                }
            } else {
                if (is_set(hooks[ev][id])) {
                    hooks[ev][id].apply($, a);
                }
            }
            return $;
        }

        // initialize data ...
        set_data($$.parse(target.getAttribute('data-color') || target.value || [0, 1, 1]));

        // generate color picker pane ...
        picker.className = 'color-picker';
        picker.innerHTML = '<div class="color-picker-control"><span class="color-picker-h"><i></i></span><span class="color-picker-sv"><i></i></span></div>';
        var c = picker[first].children,
            HSV = get_data([0, 1, 1]), // default is red
            H = c[0],
            SV = c[1],
            H_point = H[first],
            SV_point = SV[first],
            start_H = 0,
            start_SV = 0,
            drag_H = 0,
            drag_SV = 0,
            left = 0,
            top = 0,
            P_W = 0,
            P_H = 0,
            v = HSV2HEX(HSV),
            set;

        // on update ...
        function trigger_(k, x) {
            if (!k || k === "h") {
                trigger("change:h", x);
            }
            if (!k || k === "sv") {
                trigger("change:sv", x);
            }
            trigger("change", x);
        }

        // is visible?
        function visible() {
            return picker.parentNode;
        }

        // create
        function create(first, bucket) {
            if (!first) {
                (parent || bucket || b).appendChild(picker), $.visible = true;
            }
            P_W = size(picker).w;
            P_H = size(picker).h;
            var SV_size = size(SV),
                SV_point_size = size(SV_point),
                H_H = size(H).h,
                SV_W = SV_size.w,
                SV_H = SV_size.h,
                H_point_H = size(H_point).h,
                SV_point_W = SV_point_size.w,
                SV_point_H = SV_point_size.h;
            if (first) {
                picker.style.left = picker.style.top = '-9999px';
                function click(e) {
                    var t = e.target,
                        is_target = t === target || closest(t, target) === target;
                    if (is_target) {
                        create();
                    } else {
                        $.exit();
                    }
                    trigger(is_target ? "enter" : "exit", [$]);
                }
                if (events !== false) {
                    on(events, target, click);
                }
                $.create = function() {
                    return create(1), trigger("create", [$]), $;
                };
                $.destroy = function() {
                    if (events !== false) {
                        off(events, target, click);
                    }
                    $.exit(), set_data(false);
                    return trigger("destroy", [$]), $;
                };
            } else {
                fit();
            }
            set = function() {
                HSV = get_data(HSV), color();
                H_point.style.top = (H_H - (H_point_H / 2) - (H_H * +HSV[0])) + 'px';
                SV_point.style.right = (SV_W - (SV_point_W / 2) - (SV_W * +HSV[1])) + 'px';
                SV_point.style.top = (SV_H - (SV_point_H / 2) - (SV_H * +HSV[2])) + 'px';
            };
            $.exit = function(e) {
                if (visible()) {
                    visible().removeChild(picker);
                    $.visible = false;
                }
                off(on_down, H, down_H);
                off(on_down, SV, down_SV);
                off(on_move, doc, move);
                off(on_up, doc, stop);
                off(on_resize, win, fit);
                return $;
            };
            function color(e) {
                var a = HSV2RGB(HSV),
                    b = HSV2RGB([HSV[0], 1, 1]);
                SV.style.backgroundColor = 'rgb(' + b.join(',') + ')';
                set_data(HSV);
                prevent(e);
            };
            set();
            function do_H(e) {
                var y = edge(point(H, e).y, 0, H_H);
                HSV[0] = (H_H - y) / H_H;
                H_point.style.top = (y - (H_point_H / 2)) + 'px';
                color(e);
            }
            function do_SV(e) {
                var o = point(SV, e),
                    x = edge(o.x, 0, SV_W),
                    y = edge(o.y, 0, SV_H);
                HSV[1] = 1 - ((SV_W - x) / SV_W);
                HSV[2] = (SV_H - y) / SV_H;
                SV_point.style.right = (SV_W - x - (SV_point_W / 2)) + 'px';
                SV_point.style.top = (y - (SV_point_H / 2)) + 'px';
                color(e);
            }
            function move(e) {
                if (drag_H) {
                    do_H(e), v = HSV2HEX(HSV);
                    if (!start_H) {
                        trigger("drag:h", [v, $]);
                        trigger("drag", [v, $]);
                        trigger_("h", [v, $]);
                    }
                }
                if (drag_SV) {
                    do_SV(e), v = HSV2HEX(HSV);
                    if (!start_SV) {
                        trigger("drag:sv", [v, $]);
                        trigger("drag", [v, $]);
                        trigger_("sv", [v, $]);
                    }
                }
                start_H = 0,
                start_SV = 0;
            }
            function stop(e) {
                var t = e.target,
                    k = drag_H ? "h" : "sv",
                    a = [HSV2HEX(HSV), $],
                    is_target = t === target || closest(t, target) === target,
                    is_picker = t === picker || closest(t, picker) === picker;
                if (!is_target && !is_picker) {
                    // click outside the target or picker element to exit
                    if (visible() && events !== false) $.exit(), trigger("exit", [$]), trigger_(0, a);
                } else {
                    if (is_picker) {
                        trigger("stop:" + k, a);
                        trigger("stop", a);
                        trigger_(k, a);
                    }
                }
                drag_H = 0,
                drag_SV = 0;
            }
            function down_H(e) {
                start_H = 1,
                drag_H = 1,
                move(e), prevent(e);
                trigger("start:h", [v, $]);
                trigger("start", [v, $]);
                trigger_("h", [v, $]);
            }
            function down_SV(e) {
                start_SV = 1,
                drag_SV = 1,
                move(e), prevent(e);
                trigger("start:sv", [v, $]);
                trigger("start", [v, $]);
                trigger_("sv", [v, $]);
            }
            if (!first) {
                on(on_down, H, down_H);
                on(on_down, SV, down_SV);
                on(on_move, doc, move);
                on(on_up, doc, stop);
                on(on_resize, win, fit);
            }
        } create(1);

        delay(function() {
            var a = [HSV2HEX(HSV), $];
            trigger("create", a);
            trigger_(0, a);
        }, 0);

        // fit to window
        $.fit = function(o) {
            var w = size(win),
                y = size(h),
                screen_w = w.w - y.w, // vertical scroll bar
                screen_h = w.h - h.clientHeight, // horizontal scroll bar
                ww = offset(win),
                to = offset(target);
            left = to.l + ww.l;
            top = to.t + ww.t + size(target).h; // drop!
            if (is_object(o)) {
                is_set(o[0]) && (left = o[0]);
                is_set(o[1]) && (top = o[1]);
            } else {
                var min_x = ww.l,
                    min_y = ww.t,
                    max_x = ww.l + w.w - P_W - screen_w,
                    max_y = ww.t + w.h - P_H - screen_h;
                left = edge(left, min_x, max_x) >> 0;
                top = edge(top, min_y, max_y) >> 0;
            }
            picker.style.left = left + 'px';
            picker.style.top = top + 'px';
            return trigger("fit", [$]), $;
        };

        // for event listener ID
        function fit() {
            return $.fit();
        }

        // set hidden color picker data
        $.set = function(a) {
            if (!is_set(a)) return get_data();
            if (is_string(a)) {
                a = $$.parse(a);
            }
            return set_data(a), set(), $;
        };

        // alias for `$.set()`
        $.get = function(a) {
            return get_data(a);
        };

        // register to global ...
        $.target = target;
        $.picker = picker;
        $.visible = false;
        $.on = add;
        $.off = remove;
        $.fire = trigger;
        $.hooks = hooks;
        $.enter = function(bucket) {
            return create(0, bucket);
        };

        // return the global object
        return $;

    });

})(window, document, 'CP');

/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.3.8
 * 2018-03-22 14:03:47
 *
 * By Eli Grey, https://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/* @source http://purl.eligrey.com/github/FileSaver.js/blob/master/src/FileSaver.js */

//var saveAs = saveAs || (function(view) {
var saveAs = (function(view) {
    "use strict";
    // IE <10 is explicitly unsupported
    if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
        return;
    }
    var doc = view.document
          // only get URL when necessary in case Blob.js hasn't overridden it yet
        , get_URL = function() {
            return view.URL || view.webkitURL || view;
        }
        , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
        , can_use_save_link = "download" in save_link
        , click = function(node) {
            var event = new MouseEvent("click");
            node.dispatchEvent(event);
        }
        , is_safari = /constructor/i.test(view.HTMLElement) || view.safari
        , is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
        , setImmediate = view.setImmediate || view.setTimeout
        , throw_outside = function(ex) {
            setImmediate(function() {
                throw ex;
            }, 0);
        }
        , force_saveable_type = "application/octet-stream"
        // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
        , arbitrary_revoke_timeout = 1000 * 40 // in ms
        , revoke = function(file) {
            var revoker = function() {
                if (typeof file === "string") { // file is an object URL
                    get_URL().revokeObjectURL(file);
                } else { // file is a File
                    file.remove();
                }
            };
            setTimeout(revoker, arbitrary_revoke_timeout);
        }
        , dispatch = function(filesaver, event_types, event) {
            event_types = [].concat(event_types);
            var i = event_types.length;
            while (i--) {
                var listener = filesaver["on" + event_types[i]];
                if (typeof listener === "function") {
                    try {
                        listener.call(filesaver, event || filesaver);
                    } catch (ex) {
                        throw_outside(ex);
                    }
                }
            }
        }
        , auto_bom = function(blob) {
            // prepend BOM for UTF-8 XML and text/* types (including HTML)
            // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
            //if (blob && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
            if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
            }
            return blob;
        }
        , FileSaver = function(blob, name, no_auto_bom) {
            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            // First try a.download, then web filesystem, then object URLs
            var
                  filesaver = this
                , type = (blob) ? blob.type : undefined
                , force = type === force_saveable_type
                , object_url
                , dispatch_all = function() {
                    dispatch(filesaver, "writestart progress write writeend".split(" "));
                }
                // on any filesys errors revert to saving with object URLs
                , fs_error = function() {
                    if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                        // Safari doesn't allow downloading of blob urls
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                            var urlTarget = '_blank';
                            var popup = view.open(url, urlTarget);
                            if(!popup) view.location.href = url;
                            url=undefined; // release reference before dispatching
                            filesaver.readyState = filesaver.DONE;
                            dispatch_all();
                        };
                        reader.readAsDataURL(blob);
                        filesaver.readyState = filesaver.INIT;
                        return;
                    }
                    // don't create more object URLs than needed
                    if (!object_url) object_url = get_URL().createObjectURL(blob);
                    if (force) {
                        view.location.href = object_url;
                    } else {
                        var opened = view.open(object_url, "_blank");
                        if (!opened) {
                            // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                            view.location.href = object_url;
                        }
                    }
                    filesaver.readyState = filesaver.DONE;
                    dispatch_all();
                    revoke(object_url);
                }
            ;
            filesaver.readyState = filesaver.INIT;

            if (can_use_save_link) {
                if (!object_url) object_url = get_URL().createObjectURL(blob);
                setImmediate(function() {
                    save_link.href = object_url;
                    save_link.download = name;
                    click(save_link);
                    dispatch_all();
                    revoke(object_url);
                    filesaver.readyState = filesaver.DONE;
                }, 0);
                return;
            }

            fs_error();
        }
        , FS_proto = FileSaver.prototype
        , saveAs = function(blob, name, no_auto_bom) {
            return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
        }
    ;

    // IE 10+ (native saveAs)
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
        return function(blob, name, no_auto_bom) {
            name = name || blob.name || "download";

            if (!no_auto_bom) {
                blob = auto_bom(blob);
            }
            return navigator.msSaveOrOpenBlob(blob, name);
        };
    }

    // todo: detect chrome extensions & packaged apps
    //save_link.target = "_blank";

    FS_proto.abort = function(){};
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;

    FS_proto.error =
    FS_proto.onwritestart =
    FS_proto.onprogress =
    FS_proto.onwrite =
    FS_proto.onabort =
    FS_proto.onerror =
    FS_proto.onwriteend =
        null;

    return saveAs;
}(
       typeof self !== "undefined" && self
    || typeof window !== "undefined" && window
    || this
));

/*
 * JavaScript Canvas to Blob
 * https://github.com/blueimp/JavaScript-Canvas-to-Blob
 *
 * Copyright 2012, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on stackoverflow user Stoive's code snippet:
 * http://stackoverflow.com/q/4998908
 */

/* global atob, Blob, define */

;(function (window) {
  'use strict';

  var CanvasPrototype =
    window.HTMLCanvasElement && window.HTMLCanvasElement.prototype
  var hasBlobConstructor =
    window.Blob &&
    (function () {
      try {
        return Boolean(new Blob())
      } catch (e) {
        return false
      }
    })()
  var hasArrayBufferViewSupport =
    hasBlobConstructor &&
    window.Uint8Array &&
    (function () {
      try {
        return new Blob([new Uint8Array(100)]).size === 100
      } catch (e) {
        return false
      }
    })()
  var BlobBuilder =
    window.BlobBuilder ||
    window.WebKitBlobBuilder ||
    window.MozBlobBuilder ||
    window.MSBlobBuilder
  var dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/
  var dataURLtoBlob =
    (hasBlobConstructor || BlobBuilder) &&
    window.atob &&
    window.ArrayBuffer &&
    window.Uint8Array &&
    function (dataURI) {
      var matches,
        mediaType,
        isBase64,
        dataString,
        byteString,
        arrayBuffer,
        intArray,
        i,
        bb
      // Parse the dataURI components as per RFC 2397
      matches = dataURI.match(dataURIPattern)
      if (!matches) {
        throw new Error('invalid data URI')
      }
      // Default to text/plain;charset=US-ASCII
      mediaType = matches[2]
        ? matches[1]
        : 'text/plain' + (matches[3] || ';charset=US-ASCII')
      isBase64 = !!matches[4]
      dataString = dataURI.slice(matches[0].length)
      if (isBase64) {
        // Convert base64 to raw binary data held in a string:
        byteString = atob(dataString)
      } else {
        // Convert base64/URLEncoded data component to raw binary:
        byteString = decodeURIComponent(dataString)
      }
      // Write the bytes of the string to an ArrayBuffer:
      arrayBuffer = new ArrayBuffer(byteString.length)
      intArray = new Uint8Array(arrayBuffer)
      for (i = 0; i < byteString.length; i += 1) {
        intArray[i] = byteString.charCodeAt(i)
      }
      // Write the ArrayBuffer (or ArrayBufferView) to a blob:
      if (hasBlobConstructor) {
        return new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], {
          type: mediaType
        })
      }
      bb = new BlobBuilder()
      bb.append(arrayBuffer)
      return bb.getBlob(mediaType)
    }
  if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
    if (CanvasPrototype.mozGetAsFile) {
      CanvasPrototype.toBlob = function (callback, type, quality) {
        var self = this
        setTimeout(function () {
          if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
            callback(dataURLtoBlob(self.toDataURL(type, quality)))
          } else {
            callback(self.mozGetAsFile('blob', type))
          }
        })
      }
    } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
      CanvasPrototype.toBlob = function (callback, type, quality) {
        var self = this
        setTimeout(function () {
          callback(dataURLtoBlob(self.toDataURL(type, quality)))
        })
      }
    }
  }
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return dataURLtoBlob
    })
  } else if (typeof module === 'object' && module.exports) {
    module.exports = dataURLtoBlob
  } else {
    window.dataURLtoBlob = dataURLtoBlob
  }
})(window)
