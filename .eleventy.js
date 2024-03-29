const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')

const EleventyPluginNavigation = require('@11ty/eleventy-navigation')
const EleventyPluginRss = require('@11ty/eleventy-plugin-rss')
const EleventyPluginSyntaxhighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite')
const embedSpotify = require('eleventy-plugin-embed-spotify')
const embedYouTube = require('eleventy-plugin-youtube-embed')
const sanityImage = require('eleventy-plugin-sanity-image')
const sanityClient = require('./utils/sanityClient.js')

const {
	fortawesomeBrandsPlugin
} = require('@vidhill/fortawesome-brands-11ty-shortcode')

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')

const { resolve } = require('path')

const Image = require('@11ty/eleventy-img')

const imageShortcode = async (
	src,
	alt,
	className = undefined,
	sizes = '100vw',
	widths = [400, 640, 800, 1280],
	formats = ['avif', 'webp', 'jpeg']
) => {
	const imageMetadata = await Image(src, {
		widths: [...widths, null],
		formats: [...formats, null],
		outputDir: './src/assets/images',
		urlPath: '/assets/images/'
	})

	const imageAttributes = {
		alt,
		sizes,
		class: className,
		loading: 'lazy',
		decoding: 'async'
	}

	return Image.generateHTML(imageMetadata, imageAttributes)
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
	const md = require('markdown-it')({
		html: false,
		breaks: true,
		linkify: true
	})
	eleventyConfig.addNunjucksFilter('markdownify', (markdownString) =>
		md.render(markdownString)
	)

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
	eleventyConfig.addPlugin(sanityImage, {
		client: sanityClient // This is your Sanity connection object
	})
	eleventyConfig.addPlugin(embedYouTube)

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
	eleventyConfig.addLayoutAlias('release', 'release.njk')
	eleventyConfig.addLayoutAlias('photo', 'photo.njk')

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
