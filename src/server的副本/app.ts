import * as Koa from 'koa'
import * as path from 'path'
import router from './routes'
const app: Koa = new Koa()
const env = process.env.NODE_ENV || 'development'
const isDev = env === 'development'


//render
require('koa-ejs')(app, {
    //@ts-ignore
    //root 为经过webpack编译后的真实模板路径
    root: path.resolve(__dirname, isDev ? '../dist/views' : '../views'),
    layout: false,
    viewExt: 'html',
    cache: false,
    debug: false
})

app.use(router.routes()).use(router.allowedMethods())

export {
    Koa
}
export default app