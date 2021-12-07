import { UpdateInfo } from 'update-notifier'
import { BaseStoreOptions, BaseStore } from '../baseStore'

export interface StoreNpmGenerator extends NpmGenerator {
	runCount: number
	update?: UpdateInfo
}

export interface StoreRepoGenerator extends RepoGenerator {
	runCount: number
}

export type StoreGenerator = StoreNpmGenerator | StoreRepoGenerator

export type GroupedGenerators = Map<string, StoreGenerator>

type GeneratorStoreOptions = BaseStoreOptions

export class GeneratorStore extends BaseStore<StoreGenerator> {
	constructor(options?: GeneratorStoreOptions) {
		super({ ...options })
	}

	/** Add a new generator to the store if it doesn't already exist */
	add(generator: ParsedGenerator): this {
		this.set(generator.hash, generator)
		return this
	}

	/** Search the store for generators matching the current one's name */
	getByName(generator: ParsedGenerator): StoreGenerator[] {
		return this.getAllWhere((key, value) => {
			if (generator.type === 'repo' && value.type === 'repo') {
				return (
					`${value.prefix}:${value.user}/${value.repo}` ===
					`${generator.prefix}:${generator.user}/${generator.repo}`
				)
			}
			if (generator.type === 'npm' && value.type === 'npm') {
				return generator.name === value.name
			}
			return false
		})
	}

	/** Group generators by name */
	get generatorNameList(): GroupedGenerators {
		const generatorsMap: GroupedGenerators = new Map()
		this.listify().forEach((generator) => {
			if (generator.type === 'repo') {
				const repoGenerator = generator as StoreRepoGenerator
				const repoGeneratorName = getRepoGeneratorName(repoGenerator)
				if (!generatorsMap.has(repoGeneratorName)) {
					generatorsMap.set(repoGeneratorName, repoGenerator)
				}
			}
			if (generator.type === 'npm') {
				const npmGenerator = generator as StoreNpmGenerator
				const npmGeneratorName = getNpmGeneratorName(npmGenerator)
				if (!generatorsMap.has(npmGeneratorName)) {
					generatorsMap.set(npmGeneratorName, npmGenerator)
				}
			}
		})
		return generatorsMap
	}

	get npmGeneratorsNames(): string[] {
		return this.listify()
			.filter((g) => g.type === 'npm')
			.map((g) => getNpmGeneratorName(g as StoreNpmGenerator))
	}
}
