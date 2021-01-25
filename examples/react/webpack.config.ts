import webpackConfig from '@psimk/porter-react-tools/webpack.config';
import { cwd } from 'process';
import { resolve } from 'path';
import merge from 'webpack-merge';

export default merge(webpackConfig, { output: { path: resolve(cwd(), './out') } });
