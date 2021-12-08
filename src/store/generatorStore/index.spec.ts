import { ParsedGenerator } from 'gritparse'
import path from 'path'
import { GeneratorStore } from './'

describe('Generator Store', () => {
	const storePath = path.join(__dirname, 'fixtures')
	const generator: ParsedGenerator = {
		type: 'local',
		path: 'aalskdjfalksdjf',
		hash: 'hash',
	}

	const store = new GeneratorStore({
		storePath,
	})

	it('set generator into store', () => {
		store.set('12345678', generator)
	})

	it('get generators from store', () => {
		expect(store.get('12345678')).toEqual(generator)
	})

	it('read store', () => {
		const content = store.read()
		console.log(content)
		expect(content).toBeDefined()
	})
	//create after all statement to clean up the test store
})
