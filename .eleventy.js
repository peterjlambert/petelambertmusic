const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')

const EleventyPluginNavigation = require('@11ty/eleventy-navigation')
const EleventyPluginRss = require('@11ty/eleventy-plugin-rss')
const EleventyPluginSyntaxhighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite')
const embedSpotify = require('eleventy-plugin-embed-spotify')
const {
	fortawesomeBrandsPlugin
} = require('@vidhill/fortawesome-brands-11ty-shortcode')

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')

const { resolve } = require('path')

const Image = require('@11ty/eleventy-img')

async function imageShortcode(src, alt, sizes, cls) {
	let metadata = await Image(src, {
		widths: [320, 640, 900, 1500],
		formats: ['avif', 'webp', 'jpeg'],
		urlPath: '/assets/images/',
		outputDir: './src/assets/images'
	})

	let imageAttributes = {
		alt,
		sizes,
		class: cls,
		loading: 'lazy',
		decoding: 'async'
	}

	// You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
	return Image.generateHTML(metadata, imageAttributes)
}

module.exports = function (eleventyConfig) {
	eleventyConfig.setServerPassthroughCopyBehavior('copy')
	eleventyConfig.addPassthroughCopy('public')

	// Plugins
	eleventyConfig.addPlugin(embedSpotify)
	eleventyConfig.addPlugin(EleventyPluginNavigation)
	eleventyConfig.addPlugin(EleventyPluginRss)
	eleventyConfig.addPlugin(EleventyPluginSyntaxhighlight)
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		tempFolderName: '.11ty-vite', // Default name of the temp folder

		// Vite options (equal to vite.config.js inside project root)
		viteOptions: {
			publicDir: 'public',
			clearScreen: false,
			server: {
				mode: 'development',
				middlewareMode: true
			},
			appType: 'custom',
			assetsInclude: ['**/*.xml', '**/*.txt'],
			build: {
				mode: 'production',
				sourcemap: 'true',
				manifest: true
			}
		}
	})

	// Filters
	Object.keys(filters).forEach((filterName) => {
		eleventyConfig.addFilter(filterName, filters[filterName])
	})

	// Transforms
	Object.keys(transforms).forEach((transformName) => {
		eleventyConfig.addTransform(transformName, transforms[transformName])
	})

	// Shortcodes
	Object.keys(shortcodes).forEach((shortcodeName) => {
		eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName])
	})

	eleventyConfig.addAsyncShortcode('image', imageShortcode)
	eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`)
	eleventyConfig.addPlugin(fortawesomeBrandsPlugin)

	// Collections
	eleventyConfig.addCollection('futureShows', function (collectionApi) {
		return collectionApi.getFilteredByTag('shows').filter((p) => {
			let now = new Date().getTime()
			if (now > p.date.getTime()) return false
			return true
		})
	})

	// Customize Markdown library and settings:
	let markdownLibrary = markdownIt({
		html: true,
		breaks: true,
		linkify: true
	}).use(markdownItAnchor, {
		permalink: markdownItAnchor.permalink.ariaHidden({
			placement: 'after',
			class: 'direct-link',
			symbol: '#',
			level: [1, 2, 3, 4]
		}),
		slugify: eleventyConfig.getFilter('slug')
	})
	eleventyConfig.setLibrary('md', markdownLibrary)

	// Layouts
	eleventyConfig.addLayoutAlias('base', 'base.njk')
	eleventyConfig.addLayoutAlias('show', 'show.njk')

	// Copy/pass-through files
	eleventyConfig.addPassthroughCopy('src/assets/css')
	eleventyConfig.addPassthroughCopy('src/assets/js')
	eleventyConfig.addPassthroughCopy('src/assets/images')

	return {
		templateFormats: ['md', 'njk', 'html', 'liquid'],
		htmlTemplateEngine: 'njk',
		passthroughFileCopy: true,
		dir: {
			input: 'src',
			// better not use "public" as the name of the output folder (see above...)
			output: '_site',
			includes: '_includes',
			layouts: 'layouts',
			data: '_data'
		}
	}
}
