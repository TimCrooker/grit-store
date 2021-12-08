import { PACKAGES_CACHE_PATH } from '@/config'
import { spinner } from '@/utils/spinner'
import { NpmGenerator, RepoGenerator, hasGeneratorConfig } from 'gritparse'
import path from 'path'
import { logger } from 'swaglog'
import {
	outputFile,
	installPackages,
	requireUncached,
	pathExists,
} from 'youtill'
import { downloadRepoFromGenerator } from './downloadRepo'

/** Install an NPM generator to the grit store */
export const installNpmGenerator = async (
	generator: NpmGenerator,
	update = false
): Promise<NpmGenerator> => {
	const installPath = path.join(PACKAGES_CACHE_PATH, generator.hash)
	const packagePath = path.join(installPath, 'package.json')

	// write a package.json file in the store
	await outputFile(
		packagePath,
		JSON.stringify({
			private: true,
		}),
		'utf8'
	)

	// download the generator with npm install
	spinner.start(
		update ? 'Updating ' : 'Installing ' + 'generator at path ' + installPath
	)
	await installPackages({
		cwd: installPath,
		packages: [
			`${generator.name}@${update ? 'latest' : generator.version || 'latest'}`,
		],
		installArgs: ['--silent'],
	})
	spinner.stop()
	logger.success('Generator installed')

	// grab the new generator package.json file
	const packageJson = requireUncached(packagePath)

	// in the store, add the generator and insert the true version
	generator.version = packageJson.dependencies[generator.name].replace(
		/^\^/,
		''
	)

	return generator
}

/** Install a repo generator to the grit store */
export const installRepoGenerator = async (
	generator: RepoGenerator,
	clone?: boolean
): Promise<RepoGenerator> => {
	// Download repo
	spinner.start('Downloading Repo')

	await downloadRepoFromGenerator(generator, {
		clone,
		outDir: generator.path,
	})
	spinner.stop()
	logger.success('Downloaded repo')

	// Only try to install dependencies for real generator
	const hasConfigFile = hasGeneratorConfig(generator.path)
	const hasPackageJson = pathExists(path.join(generator.path, 'package.json'))
	if (hasConfigFile && hasPackageJson) {
		await installPackages({
			cwd: generator.path,
			installArgs: ['--production', '--silent'],
		})
	}

	return generator
}

/** Install a generator to the grit store */
export const installGenerator = async (
	generator: NpmGenerator | RepoGenerator,
	update = false
): Promise<NpmGenerator | RepoGenerator> => {
	if (generator.type === 'npm') {
		return await installNpmGenerator(generator as NpmGenerator, update)
	}
	return await installRepoGenerator(generator as RepoGenerator)
}
