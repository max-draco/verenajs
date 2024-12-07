const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Add this line

module.exports = {
  entry: {
    sample: path.resolve(__dirname, 'sample.js'),
    // login: path.resolve(__dirname, 'src/assets/js/modules/login'),
    // dashboard: path.resolve(__dirname, 'src/assets/js/modules/dashboard'),
    // forgot: path.resolve(__dirname, 'src/assets/js/modules/forgot'),
    // otp: path.resolve(__dirname, 'src/templates/otp'),
  },
  output: {
    filename: '[name]/js/[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'app'),
    assetModuleFilename: '[name]/images/[name].[contenthash][ext]',
    publicPath: '/', // Ensure static files like manifest are served correctly

  },
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    fallback: {
      process: require.resolve('process/browser'),
      buffer: require.resolve('buffer/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: '[name]/images/[name].[contenthash][ext]',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
          { 
            from: path.resolve(__dirname, 'src/pwaAss'), 
            to: 'src/pwaAss' 
          }, // Ensure the pwaAss folder is copied
          {
            from: path.resolve(__dirname, 'manifest.json'), 
            to: 'manifest.json',
            noErrorOnMissing: true,
                   globOptions: {
            ignore: ['**/*.html'], // Ignore HTML if handled by HtmlWebpackPlugin
          },
          },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'signup/index.html',
      template: path.resolve(__dirname, 'src/templates/signup.html'),
      chunks: ['signup'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      },
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'login/index.html',
      template: path.resolve(__dirname, 'src/templates/login.html'),
      chunks: ['login'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      },
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'otp/index.html',
      template: path.resolve(__dirname, 'src/templates/otp/index.html'),
      chunks: ['otp'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      },
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'dashboard/index.html',
      template: path.resolve(__dirname, 'src/templates/dashboard.html'),
      chunks: ['dashboard'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      },
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      filename: 'forgot/index.html',
      template: path.resolve(__dirname, 'src/templates/forgot.html'),
      chunks: ['forgot'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
      },
      inject: 'body',
    }),
    new MiniCssExtractPlugin({
      filename: '[name]/css/styles.[contenthash].css',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new JavaScriptObfuscator({
      rotateStringArray: true,
    }, ['signup/js/signup.*.bundle.js', 'login/js/login.*.bundle.js', 'dashboard/js/dashboard.*.bundle.js']),

    // PWA Manifest plugin
    // new WebpackPwaManifest({
    //   name: 'Cashly',
    //   short_name: 'Cashly',
    //   description: 'Cashly PWA',
    //   background_color: '#ffffff',
    //   theme_color: '#000000',
    //   display: 'standalone',
    //   start_url: '/',
    //   orientation: 'any',
    //   lang: 'en',
    //   scope: '/',
    //   categories: ['productivity', 'utility'],
    //   icons: [
    //     {
    //       src: path.resolve('src/pwaAss/icons/manifest-icon-192.maskable.png'),
    //       sizes: [96, 128, 192, 256, 384, 512],
    //       destination: path.join('icons'),
    //       purpose: 'any',
    //     },
    //     {
    //       src: path.resolve('src/pwaAss/icons/manifest-icon-192.maskable.png'),
    //       sizes: [192, 512],
    //       destination: path.join('icons'),
    //       purpose: 'maskable',
    //     }
    //   ],
    //   filename: 'manifest.json', // Specify the name of the manifest file
    //   publicPath: '/', // Ensure the manifest file is accessible from the correct path
    //   output: path.resolve(__dirname, '/'), // Specify the output directory for the manifest file
    // }),

    // Workbox Service Worker for PWA
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      swDest: path.resolve(__dirname, 'app/sw.js'), // Specify your service worker file name here for the dashboard
      runtimeCaching: [
        {
          // Cache images
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 Days
            },
          },
        },
        {
          // Cache CSS and JS files, including those with content hashes
          urlPattern: /\.(?:css|js)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'assets-cache',
            plugins: [
              {
                // Cache only valid responses
                cacheWillUpdate: async ({ response }) => {
                  if (!response || response.status !== 200) {
                    return null; // Prevent caching invalid responses
                  }
                  return response; // Cache the valid response
                },
              },
            ],
          },
        },
        {
          // Cache HTML files
          urlPattern: /\.(?:html)$/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'html-cache',
            networkTimeoutSeconds: 5, // Fallback to cache if network fails
          },
        },
      ],
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: 'single',
  },
  cache: {
    type: 'filesystem',
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'app'),
    },
    compress: true,
    port: 9000,
    open: true,
    hot: true,
  },
};
