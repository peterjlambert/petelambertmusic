const BlocksToMarkdown = require('@sanity/block-content-to-markdown')
const groq = require('groq')
const client = require('./sanityClient.js')

function generatePost(post) {
	return {
		...post
	}
}

async function getVideos() {
	const filter = groq`*[_type == "video"]`
	const projection = groq`{
    ...
  }`
	const order = ``
	const query = [filter, projection, order].join(' ')
	const docs = await client.fetch(query).catch((err) => console.error(err))
	const preparePosts = docs.map(generatePost)
	return preparePosts
}

module.exports = getVideos
