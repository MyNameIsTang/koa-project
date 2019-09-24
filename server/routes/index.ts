import { Koa } from '../app'
import * as Router from 'koa-router'

const router: Router = new Router()

router.get('/', async (ctx: Koa.Context) => {
    await ctx.render('index', {
        title: '123',
    })
})

export default router