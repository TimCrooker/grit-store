import os from 'os'
import path from 'path'

// App names
export const APP_NAME = 'Grit'
export const COMMAND_NAME = 'grit'

// Store configs
const CACHE_VERSION = 2
export const ROOT_CACHE_PATH = path.join(
	os.homedir(),
	`.${APP_NAME.toLowerCase()}/V${CACHE_VERSION}`
)
export const GENERATORS_CACHE_PATH = path.join(ROOT_CACHE_PATH, 'generators')
export const PACKAGES_CACHE_PATH = path.join(GENERATORS_CACHE_PATH, 'packages')
export const REPOS_CACHE_PATH = path.join(GENERATORS_CACHE_PATH, 'repos')

// Local path conversions
const RE = /^[./]|(^[a-zA-Z]:)/
export const isLocalPath = (v: string): boolean => RE.test(v)
export const removeLocalPathPrefix = (v: string): string => v.replace(RE, '')