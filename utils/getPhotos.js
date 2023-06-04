// _data/images.js
const groq = require('groq')
const client = require('../utils/sanityClient.js')
const imageUrl = require('@sanity/image-url')

function generateImageData({ galleryImage, date, slug }) {
	return {
		image: `![${galleryImage.alt}](${imageUrl(client)
			.image(galleryImage)
			.width(3200)
			.url()})`,
		imageUrl: imageUrl(client).image(galleryImage).width(3200).url(),
		caption: galleryImage.caption,
		alt: galleryImage.alt,
		date,
		slug
	}
}

async function getPhotos() {
	// Learn more: https://www.sanity.io/docs/data-store/how-queries-work
	const filter = groq`*[_type == "galleryImageHolder"]`
	const projection = groq`{
    galleryImage,
    date,
    slug
  }`
	const order = `| order(date desc)`
	const query = [filter, projection, order].join(' ')
	const docs = await client.fetch(query).catch((err) => console.error(err))
	const preparePosts = docs.map(generateImageData)
	return preparePosts
}

module.exports = getPhotos
