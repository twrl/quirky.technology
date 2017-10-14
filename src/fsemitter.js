import * as fs from 'exfs'
import * as path from 'path'

const testdir = path.resolve(process.cwd(), './test-output')

export default function (resource) {
    fs.writeFile(path.resolve(testdir, resource.Key), resource.Body, (err) => { if (err) console.warn(err) }, true)
}