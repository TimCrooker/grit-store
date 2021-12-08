import { logger, LogLevel } from 'swaglog'
import { AnswerStore } from './answerStore'
import { GeneratorStore } from './generatorStore'

export interface StoreOptions {
	logLevel?: LogLevel
}

export class Store {
	logger = logger
	/**
	 * Manage stored generators
	 */
	generators: GeneratorStore = new GeneratorStore({
		storeFileName: 'generators.json',
	})
	/**
	 * Manage stored answers to generator prompts
	 */
	answers: AnswerStore = new AnswerStore({ storeFileName: 'answers.json' })

	constructor(opts: StoreOptions) {
		if (opts.logLevel) {
			logger.setOptions({ logLevel: opts.logLevel })
		}
	}
}
