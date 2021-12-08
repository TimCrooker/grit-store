import path from 'path'
import { AnswerStore } from '.'
import { Answers } from 'inquirer'

describe('Answer Store', () => {
	const storePath = path.join(__dirname, 'fixtures')
	const answer: Answers = {
		name: 'test',
		value: 'test',
	}

	const store = new AnswerStore({
		storePath,
	})

	it('set generator into store', () => {
		store.set('12345678', answer)
	})

	it('get generators from store', () => {
		expect(store.get('12345678')).toEqual(answer)
	})

	it('read store', () => {
		const content = store.read()
		console.log(content)
		expect(content).toBeDefined()
	})
	//create after all statement to clean up the test store
})
