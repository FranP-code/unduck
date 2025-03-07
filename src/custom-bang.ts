import { Bang } from "./bang.d";

// Custom bangs
/**
 * Example:
 * {
		c: "AI",
		d: "www.t3.chat",
		r: 0,
		s: "T3 Chat",
		sc: "AI",
		t: "t3",
		u: "https://www.t3.chat/new?q={{{s}}}",
	},
 */

export const bangs: Bang[] = [
	{
		c: "Search",
		d: "www.mercadolibre.com.ar",
		r: 0,
		s: "Mercado Libre",
		sc: "Search",
		t: "ml",
		u: "https://listado.mercadolibre.com.ar/{{{s}}}",
	},
];
