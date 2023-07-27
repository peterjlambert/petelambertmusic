const BlocksToMarkdown = require('@sanity/block-content-to-markdown')
const groq = require('groq')
const client = require('./sanityClient.js')

function generatePost(post) {
	return {
		...post,
		body: BlocksToMarkdown(post.body, { ...client.config() })
	}
}

async function getBio() {
	const filter = groq`*[_type == "about"]`
	const projection = groq`{
    ...,
  }`
	const order = ` | order(_createdAt desc)`
	const query = [filter, projection, order].join(' ')
	const docs = await client.fetch(query).catch((err) => console.error(err))
	const preparePosts = docs.map(generatePost)
	return preparePosts
}

module.exports = getBio
