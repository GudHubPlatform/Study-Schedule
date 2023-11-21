import MiniCssExtractPlugin from "mini-css-extract-plugin";

export default {
    experiments: {
        outputModule: true,
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    entry: {
        main: './src/data.js',
    },
    output: {
        filename: '[name].js',
        library: {
            type: 'module'
        }
    },
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: "html-loader",
                options: {
                    minimize: false
                }
            },
            {
                test: /\.(sass|scss|css)$/,
                exclude: [/\.styles.scss$/, /node_modules/],
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            sourceMap: false,
                            modules: false,
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.styles.scss$/,
                exclude: /node_modules/,
                use: [
                  "sass-to-string",
                  {
                    loader: "sass-loader",
                    options: {
                      sassOptions: {
                        outputStyle: "compressed",
                      },
                    },
                  },
                ],
              },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'style.css'
        })
    ]
};