import { writeFileSync } from 'fs'
import { readFileSync } from 'fs'
import { mkdirSync } from 'fs'
import dotProp from 'dot-prop'
import path from 'path'
import { ROOT_CACHE_PATH } from '@/config'
import { logger } from 'swaglog'

export type StoreFileData<T = any> = Record<string, T>

export interface BaseStoreOptions {
	storePath?: string
	storeFileName?: string
}

export abstract class BaseStore<T = any> {
	/** contents of the store file */
	data: StoreFileData<T>
	/** Path to the store directory */
	storePath: string
	/** Path to the store config file */
	storeFilePath: string

	constructor(options?: BaseStoreOptions) {
		this.storePath = options?.storePath || ROOT_CACHE_PATH

		logger.debug('Store path:', this.storePath)

		this.storeFilePath = path.join(
			this.storePath,
			options?.storeFileName || 'store.json'
		)

		this.initiateStore()

		this.data = this.read()
	}

	private initiateStore(): void {
		logger.debug('Initializing store directory')
		try {
			mkdirSync(this.storePath, { recursive: true })
		} catch (error) {
			logger.debug(error)
		}
	}

	read(): StoreFileData<T> {
		try {
			return JSON.parse(readFileSync(this.storeFilePath, 'utf8'))
		} catch (_) {
			return {}
		}
	}

	/**
	 * Set an item into the store
	 *
	 * @param overwrite (defaults to true) if set to false, items in the store
	 * are protected from being written to if they already exist
	 */
	set(key: string, value: T | any, overwrite = true): this {
		const alreadyCached = this.safeData[key]
		if (alreadyCached && !overwrite) {
			logger.debug('Not overwriting item in cache:', {
				key: alreadyCached,
			})
			return this
		}
		logger.debug(
			'Setting',
			key,
			'to',
			value,
			'in',
			path.basename(this.storeFilePath)
		)
		dotProp.set(this.data, key, value)
		writeFileSync(this.storeFilePath, JSON.stringify(this.data), 'utf8')
		return this
	}

	/**
	 * Get item from the store whose key matches the provided one
	 */
	get(key: string): T | undefined | any {
		return dotProp.get(this.safeData, key)
	}

	/**
	 * Deletes an item from the store
	 */
	delete(key: string): this {
		this.data = this.read()
		logger.debug('Deleting', key, 'from', path.basename(this.storeFilePath))
		dotProp.delete(this.data, key)
		writeFileSync(this.storeFilePath, JSON.stringify(this.data), 'utf8')
		return this
	}

	/** Return an array of the values in the store for iteration */
	listify(): T[] {
		return Object.values(this.safeData)
	}

	/**
	 * Iterates over the entire store and finds all items where condition is matched
	 *
	 * gets passed a function that is run for each item of of the store used to match items
	 */
	getAllWhere(filterFunction: (key: string, value: any) => boolean): any[] {
		return Object.entries(this.safeData)
			.filter(([key, value]) => filterFunction(key, value))
			.map(([, value]) => {
				return value
			})
	}

	get isEmpty(): boolean {
		return this.listify().length === 0
	}

	get safeData(): typeof this.data {
		this.data = this.read()
		return this.data
	}
}
