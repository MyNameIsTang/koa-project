import * as WebpackDevMiddleware from 'webpack-dev-middleware'
import * as Koa from 'koa'
import { NextHandleFunction } from 'connect'
import webpack = require('webpack')

const devMiddleware = (compiler: webpack.ICompiler, opts: WebpackDevMiddleware.Options) => {
    const middleware = WebpackDevMiddleware(compiler, opts)
    return async (ctx: Koa.Context, next: NextHandleFunction) => {
        await middleware(ctx.req, {
            //@ts-ignore
            end: (content: string) => {
                ctx.body = content
            },
            setHeader: (name, value: any) => {
                ctx.set(name, value)
            }
        }, next)
    }
}

export default devMiddleware