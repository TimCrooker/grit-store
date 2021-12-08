import os from 'os'
import path from 'path'

// Store configs
const STORE_VERSION = 1
export const ROOT_CACHE_PATH = path.join(
	os.homedir(),
	`.grit/V${STORE_VERSION}`
)
export const GENERATORS_CACHE_PATH = path.join(ROOT_CACHE_PATH, 'generators')
export const PACKAGES_CACHE_PATH = path.join(GENERATORS_CACHE_PATH, 'packages')
export const REPOS_CACHE_PATH = path.join(GENERATORS_CACHE_PATH, 'repos')
