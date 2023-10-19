const BlocksToMarkdown = require('@sanity/block-content-to-markdown')
const groq = require('groq')
const client = require('./sanityClient.js')

function generatePost(post) {
	return {
		...post,
		body: BlocksToMarkdown(post.body, { ...client.config() }),
		excerpt: BlocksToMarkdown(post.excerpt, { ...client.config() })
	}
}

async function getReleases() {
	// const filter = groq`*[_type == "release" && outnow==true]`
	const filter = groq`*[
  	_type == "release" &&
	  (
	    // Is either a draft -> drafts are always fresher
	    _id in path("drafts.**") ||
	    // Or a published document with no draft
	    !defined(*[_id == "drafts." + ^._id][0])
	  ) && outnow == true
	]`
	const projection = groq`{
    ...,
    'slug': slug.current,
  }`
	const order = `| order(date asc)`
	const query = [filter, projection, order].join(' ')
	const docs = await client.fetch(query).catch((err) => console.error(err))
	const preparePosts = docs.map(generatePost)
	return preparePosts
}

module.exports = getReleases
