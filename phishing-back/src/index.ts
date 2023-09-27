import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

type AppContext = {
	Bindings: {
		sisinfo_phishing: KVNamespace;
	};
};

const app = new Hono<AppContext>().basePath('/');

app.use('/*', cors({
	origin: '*',
	allowMethods: ['GET', 'POST', 'DELETE'],
}));

const countProtection: MiddlewareHandler<AppContext> = async (c, next) => {
	const victims = await c.env.sisinfo_phishing.get('victims');
	if (victims === null) {
		c.env.sisinfo_phishing.put('victims', '[]');
	}
	await next();
};

app.get('/victims', countProtection, async (c) => {
	const victims = await c.env.sisinfo_phishing.get('victims');
	const victims_len = JSON.parse(victims || '[]').length;
	return c.json({
		victims: victims_len,
	});
});

app.post('/victim', countProtection, async (c) => {
	const body = await c.req.parseBody();
	const username = 'victim';
	const victims = await c.env.sisinfo_phishing.get('victims');
	await c.env.sisinfo_phishing.put('victims', JSON.stringify([...JSON.parse(victims!), username]));
	return c.json({
		moralOfTheStory: "Don't get phished!",
	});
});

app.delete('/victims-secret-path', countProtection, async (c) => {
	await c.env.sisinfo_phishing.put('victims', '[]');
	return c.json({
		moralOfTheStory: 'Victims list reset!',
	});
});

export default app;
