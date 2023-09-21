import { Hono } from 'hono'
import type { MiddlewareHandler } from 'hono'

type AppContext = {
  Bindings: {
    sisinfo_phishing: KVNamespace
  }
}

const app = new Hono<AppContext>().basePath('/')

const countProtection: MiddlewareHandler<AppContext> = async (c, next) => {
	const victims = await c.env.sisinfo_phishing.get("victims")
	if (victims === null) {
		c.env.sisinfo_phishing.put("victims", "[]")
	}
  await next()
}

app.get('/victims', countProtection, async (c) => {
	const victims = await c.env.sisinfo_phishing.get("victims")
  return c.json({
    victims: victims
  })
})

app.post('/victim', countProtection, async (c) => {
	const body = await c.req.parseBody()
	const username = body.username
	const victims = await c.env.sisinfo_phishing.get("victims")
	await c.env.sisinfo_phishing.put("victims", JSON.stringify([...JSON.parse(victims!), username]))
	return c.json({
		"moralOfTheStory": "Don't get phished!"
	})
})

app.delete('/victims-secret-path', countProtection, async (c) => {
	await c.env.sisinfo_phishing.put("victims", "[]")
	return c.json({
		"moralOfTheStory": "Victims list reset!"
	})
})

export default app
