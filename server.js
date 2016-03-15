import express from 'express';
import graphQLHTTP from 'express-graphql';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import Mebel from './data/mebel';
import Category from './data/category';
import { json } from 'body-parser';
import graffiti from '@risingstack/graffiti';
import { getSchema } from '@risingstack/graffiti-mongoose';
import mongoose from 'mongoose';

const APP_PORT = 3000;
const GRAPHQL_PORT = 8080;


// Expose a GraphQL endpoint
var graphQLServer = express();
//connect to mongoose
mongoose.connect('mongodb://localhost/graphql');
graphQLServer.use(json());

graphQLServer.use(graffiti.express({
  schema: getSchema([Mebel,Category])
}));
graphQLServer.use((req, res) => {
  res.redirect('/graphql');
});
graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
));

// Serve the Relay app
var compiler = webpack({
  entry: path.resolve(__dirname, 'js', 'app.js'),
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          plugins: ['./build/babelRelayPlugin'],
        },
        test: /\.js$/,
      },
    ]
  },
  output: {filename: 'app.js', path: '/'}
});
var app = new WebpackDevServer(compiler, {
  contentBase: '/public/',
  proxy: {'/graphql': `http://localhost:${GRAPHQL_PORT}`},
  publicPath: '/js/',
  stats: {colors: true}
});
// Serve static resources
app.use('/', express.static(path.resolve(__dirname, 'public')));
app.listen(APP_PORT, () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`);
});
