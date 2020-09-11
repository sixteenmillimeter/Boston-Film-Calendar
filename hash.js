
const bcrypt = require('bcryptjs')

function main () {
	let pwd = process.argv[process.argv.length - 1]
	try {
		hash = bcrypt.hashSync(pwd, 12)
	} catch (err) {
		console.error(err)
	}

	console.log(`pwd: "${pwd}"`)
	console.log(`hash: "${hash}"`)
}

main()