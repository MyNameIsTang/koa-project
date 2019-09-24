import { Koa } from '../app'
import * as Router from 'koa-router'

const router: Router = new Router()

router.get('/', async (ctx: Koa.Context) => {
    await ctx.render('blog', {
        title: '博客'
    })
})

export default router