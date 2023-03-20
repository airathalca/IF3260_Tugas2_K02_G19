const mat4 = {
  projection: function(width, height, depth) {
    return [
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ];
  },

  identity: function() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  translate: function(tx, ty, tz) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1,
    ];
  },

  xRotate: function(angleInRadians) {
    var cosine = Math.cos(angleInRadians);
    var sin = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, cosine,-sin, 0,
      0, sin, cosine, 0,
      0, 0, 0, 1,
    ];
  },

  yRotate: function(angleInRadians) {
    var cosine = Math.cos(angleInRadians);
    var sin = Math.sin(angleInRadians);

    return [
       cosine, 0, sin, 0,
       0, 1, 0, 0,
      -sin, 0, cosine, 0,
       0, 0, 0, 1,
    ];
  },

  zRotate: function(angleInRadians) {
    var cosine = Math.cos(angleInRadians);
    var sin = Math.sin(angleInRadians);

    return [
       cosine,-sin, 0, 0,
       sin, cosine, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ];
  },

  scale: function(sx, sy, sz) {
    return [
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1,
    ];
  },

  multiply: function(a, b) {
    result = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        var sum = 0;
        for (var k = 0; k < 4; k++) {
          sum += a[i * 4 + k] * b[k * 4 + j];
        }
        result.push(sum);
      }
    }
    return result;
  },

  transpose: function(m) {
    return [
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15],
    ];
  },

  getCofactor: function(m, r, c) {
    var result = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (i != r && j != c) {
          result.push(m[i * 4 + j]);
        }
      }
    }
    return result;
  },

  getMinor: function(m, r, c) {
    var cofactor = mat4.getCofactor(m, r, c);
    //calculate determinant 3x3
    var result = 0;
    result += cofactor[0] * cofactor[4] * cofactor[8] + 
    cofactor[1] * cofactor[5] * cofactor[6] +
    cofactor[2] * cofactor[3] * cofactor[7];
    result -= cofactor[2] * cofactor[4] * cofactor[6] +
    cofactor[1] * cofactor[3] * cofactor[8] +
    cofactor[0] * cofactor[5] * cofactor[7];

    return result * Math.pow(-1, r + c);
  },

  determinant: function(m) {
    var result = 0;
    for (var i = 0; i < 4; i++) {
      result += m[i] * mat4.getMinor(m, 0, i);
    }
    return result;
  },

  adjoint: function(m) {
    var result = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        result.push(mat4.getMinor(m, j, i));
      }
    }
    return result;
  },

  inverse: function(m) {
    var det = mat4.determinant(m);
    if (det == 0) {
      return null;
    }
    var adj = mat4.adjoint(m);
    for (var i = 0; i < 16; i++) {
      adj[i] /= det;
    }
    return adj;
  },
}

export { mat4 };