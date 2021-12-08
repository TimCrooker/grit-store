import { sync } from 'cross-spawn'
import moveFile from 'move-file'
import { logger } from 'swaglog'
import path from 'path'
import fs from 'fs'
import os from 'os'
import axios from 'axios'
import extractZip from '@egoist/extract-zip'
import { RepoGenerator } from 'gritparse'

/** Download file from a URL */
export async function downloadFileFromUrl(
	url: string,
	outPath: string,
	extract: boolean
): Promise<void> {
	const tempFile = path.join(os.tmpdir(), `Grit-${Date.now()}`)
	const writer = fs.createWriteStream(tempFile)

	logger.debug(`Downloading file: ${url}`)

	const reponse = await axios({ url, responseType: 'stream', method: 'GET' })

	reponse.data.pipe(writer)

	await new Promise((resolve, reject) => {
		writer.on('finish', resolve)
		writer.on('error', reject)
	})

	if (extract) {
		logger.debug(`Extracting downloaded file`)
		await extractZip(tempFile, {
			dir: outPath,
			strip: 1,
		})
	} else {
		await moveFile(tempFile, outPath)
	}
}

/** Build the repo url from the generator contents */
function buildRepoUrlFromGenerator(
	generator: RepoGenerator,
	clone?: boolean
): string {
	let url = ''

	let origin =
		generator.prefix === 'github'
			? 'github.com'
			: generator.prefix === 'gitlab'
			? 'gitlab.com'
			: generator.prefix === 'bitbucket'
			? 'bitbucket.com'
			: ''

	if (clone) {
		origin = 'git@' + origin
	} else {
		origin = 'https://' + origin
	}

	if (/^git@/i.test(origin)) {
		origin = origin + ':'
	} else {
		origin = origin + '/'
	}

	// Build url
	if (clone) {
		url = `${origin}${generator.user}/${generator.repo}.git`
	} else {
		if (generator.prefix === 'github') {
			url =
				origin +
				generator.user +
				'/' +
				generator.repo +
				'/archive/' +
				generator.version +
				'.zip'
		} else if (generator.prefix === 'gitlab') {
			url =
				origin +
				generator.user +
				'/' +
				generator.repo +
				'/repository/archive.zip?ref=' +
				generator.version
		} else if (generator.prefix === 'bitbucket') {
			url =
				origin +
				generator.user +
				'/' +
				generator.repo +
				'/get/' +
				generator.version +
				'.zip'
		}
	}

	return url
}

/** Download a repository from a url */
export async function downloadRepoFromGenerator(
	generator: RepoGenerator,
	{ clone, outDir }: { clone?: boolean; outDir: string }
): Promise<void> {
	const url = buildRepoUrlFromGenerator(generator, clone)
	if (clone) {
		const cmd = sync('git', ['clone', url, outDir, '--depth=1'])
		if (cmd.status !== 0) {
			throw new Error(`Failed to download repo: ${cmd.output}`)
		}
	} else {
		await downloadFileFromUrl(url, outDir, true)
	}
}
