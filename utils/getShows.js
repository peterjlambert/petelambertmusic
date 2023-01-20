const BlocksToMarkdown = require('@sanity/block-content-to-markdown')
const groq = require('groq')
const client = require('./sanityClient.js')

function generatePost(post) {
	return {
		...post,
		body: BlocksToMarkdown(post.body, { ...client.config() })
	}
}

async function getShows() {
	const filter = groq`*[_type == "show" && date > now()]`
	const projection = groq`{
    _id,
    date,
    title,
    subtitle,
    link,
    soldout,
    upcoming,
    body[]{
      ...,
      children[]{
        ...,
        // Join inline reference
        _type == "authorReference" => {
          // check /studio/documents/authors.js for more fields
          "name": @.author->name,
          "slug": @.author->slug
        }
      }
    }
  }`
	const order = `| order(date asc)`
	const query = [filter, projection, order].join(' ')
	const docs = await client.fetch(query).catch((err) => console.error(err))
	const preparePosts = docs.map(generatePost)
	return preparePosts
}

module.exports = getShows
