// utils/sanityClient.js

let PROJECT_ID = 'xezjwwyz'
let DATASET = 'production'
let READ_TOKEN =
	'sklcOnOUkFWhmAZvHnntlWQL5HmDl36cwsKCg2BIhltnEBUFw3mYjdfi5p1XoQqEQmyPzE5b2gtCcAAahHa0osnqQcY8RvriMDs94CfwULphZd3wXMlZ8y4Q6m1x03Gf2xXeZ1d4XG0YUJtjdoCYnOefHlVOzwSTCo27CTA3jdoZ22wuaqEb'

const sanityClient = require('@sanity/client')
const sanity = {
	projectId: PROJECT_ID,
	dataset: DATASET,
	apiVersion: '2022-03-27'
}

module.exports = sanityClient({
	...sanity,
	useCdn: false,
	token: READ_TOKEN
})
