const BlocksToMarkdown = require('@sanity/block-content-to-markdown')
const groq = require('groq')
const client = require('./sanityClient.js')

function generateEntry(entry) {
	return {
		...entry,
		quote: BlocksToMarkdown(entry.quote, { ...client.config() })
	}
}

async function getQuotes() {
	const filter = groq`*[_type == "quote"]`
	const projection = groq`{
    ...
  }`
	const order = `| order(_createdAt asc)`
	const query = [filter, projection, order].join(' ')
	const docs = await client.fetch(query).catch((err) => console.error(err))
	const prepareEntries = docs.map(generateEntry)
	return prepareEntries
}

module.exports = getQuotes
