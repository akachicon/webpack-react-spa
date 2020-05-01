const ImageminPlugin = require('imagemin-webpack');
const { faviconPrefix } = require('../../project.config');

// As of time of writing this config webp plugin compresses
// all .jpg, .jpeg, and .png files into wepb format but does
// not change the extensions. If you use other plugins along
// the way they will get rewritten.

module.exports = new ImageminPlugin({
  test: /.(jpe?g|png|svg)$/i,
  filter: (source, sourcePath) => !sourcePath.match(new RegExp(faviconPrefix)),
  name: '[name].[contenthash:6].[ext]',
  cache: true,
  imageminOptions: {
    plugins: [
      [
        'jpegtran',
        {
          progressive: true
        }
      ],
      [
        'optipng',
        {
          optimizationLevel: 5,
          bitDepthReduction: false,
          colorTypeReduction: false,
          interlaced: true,
          errorRecovery: true
        }
      ],
      // [
      //   'svgo',
      //   {
      //     plugins: [
      //       {
      //         removeViewBox: false
      //       }
      //     ]
      //   }
      // ]
    ]
  }
});
