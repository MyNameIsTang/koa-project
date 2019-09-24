const path = require('path')
const glob = require('glob') //glob是一个允许正则匹配文件路径的模块，借助glob模块，很容易遍历某个目录下的所有文件来生成一个入口的map
const HtmlWebpackPlugin = require('html-webpack-plugin') //为html引入静态资源，创建入口文件
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin') //简化了注入webpack打包文件的html的创建
const MiniCssExtractPlugin = require('mini-css-extract-plugin') //将CSS提取为独立的文件的插件，对每个包含css的js文件都会创建一个CSS文件，支持按需加载css和sourceMap
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin') //用于优化或者压缩CSS资源

const env = process.env.NODE_ENV || 'development'
const isDev = env === 'development'

//获取入口文件
const entries = () => {
    //通过glob.sync 方法获取 src/entries/下所有.ts文件
    const entriesFile = glob.sync(path.resolve(__dirname, '../src/entries/*.ts'))
    /**
     * 入口字典
     * {
     *    index: 'src/entries/index.ts',
     *    blog: 'src/entries/blog.ts'
     * }
     */
    const map = Object.create(null)
    for (let i = 0; i < entriesFile.length; i++) {
        const filePath = entriesFile[i]
        const match = filePath.match(/entries\/([a-zA-Z0-9-_]+)\.ts$/)
        // 将文件名作为key， 存入map
        map[match[1]] = filePath
    }
    return map
}

//config
const webpackConfig = {
    entry: entries(),
    mode: 'development',
    output: {
        path: path.resolve(__dirname, '../dist/'),
        filename: isDev ? 'js/[name].js' : 'static/js/[name].[hash:7].js',
        publicPath: '/'
    },
    resolve: {
       // Add `.ts` and `.tsx` as a resolvable extension.
       extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            include: [
                path.resolve(__dirname, '../src/assets'),
                path.resolve(__dirname, '../src/entires')
            ],
            use: [{
                loader: 'ts-loader',
                options: {
                    configFile: path.resolve(__dirname, 'src/tsconfig.front.json')
                }
            }]
        },{
            test: /\.js$/,
            use: [{
                loader: 'babel-loader'
            }],
            exclude: /node_modules/
        },{
            test: /\.scss$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
                'sass-loader'
            ]
        },{
            test: /\.html$/,
            use: [{
                loader: 'html-loader'
            }]
        },{
            test: /\.(jpg|jpeg|png|gif|svg)$/i,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    name: !isDev ? 'static/img/[name].[hash:7].[ext]' : 'img/[name].[ext]'
                }
            }]
        }
    ]},
    plugins: [
        new MiniCssExtractPlugin({
            filename: !isDev ? 'static/css/[name].[hash:7].css' : 'css/[name].css',
            chunkFilename: !isDev ? 'static/css/[name].[hash:7].css' : 'css/[name].css'
        }),
        new OptimizeCSSPlugin({
            safe: true,
            map: false, 
            discardComments: {removeAll: true}
        })
    ],
    //提取公共模块
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: 'app',
                    chunks: 'all',
                    minChunks: 2
                }
            }
        }
    }
}

const isProduction = process.env.NODE_ENV === 'development'

//以入口找模板
Object.keys(webpackConfig.entry).forEach(entry => {
    //在plugins配置中增加了多个htmlWebpackPlugin实例
    webpackConfig.plugins.push(new HtmlWebpackPlugin({
        filename: 'views/' + entry + '.html',
        template: path.resolve(__dirname, `../src/views/${entry}.html`),
        chunks: ['app', entry], //将入口文件打包后的文件注入到对应的页面中
        alwaysWriteToDisk: true, //
        minify: {
            removeComments: isProduction,
            collapseWhitespace: isProduction,
            removeAttributeQuotes: false,
            minifyCSS: isProduction,
            minifyJS: isProduction
        }
    }))
})

webpackConfig.plugins.push(new HtmlWebpackHarddiskPlugin())

module.exports = webpackConfig