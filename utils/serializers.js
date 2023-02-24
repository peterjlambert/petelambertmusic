const { h } = require('@sanity/block-content-to-html')

module.exports = {
	types: {
		cta: ({ node }) => {
			return h(
				'a',
				{
					className: 'bg-yellow-500 text-white',
					href: node.ctaUrl
				},
				node.ctaText
			)
		},
		infoText: ({ node }) => {
			return h(
				'p',
				{
					className: 'bg-blue-500 text-white'
				},
				node.bodyInfo.map((children) => children.text).join('')
			)
		}
	}
}
