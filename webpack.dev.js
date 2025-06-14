import pkg from 'webpack-merge';
const { merge } = pkg;
import common from './webpack.common.js'

export default merge(common, {
    mode: 'development',
    devServer: {
        port: 3000,
        static: {
            directory: './dist',
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        hot: false,
        liveReload: false,
    },
})
