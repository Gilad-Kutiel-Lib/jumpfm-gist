import { JumpFm } from 'jumpfm-api'

import * as fs from 'fs-extra';
import * as path from 'path';
import * as genReq from 'request';

interface Gist {
    description: string
    filesFullPath: string[]
}

class GistDialog {
    label = 'New Gist Description'
    readonly jumpFm: JumpFm

    constructor(jumpFm: JumpFm) {
        this.jumpFm = jumpFm
    }

    onDialogOpen = (input) => {
        input.value = 'Gist Description'
        input.select()
    }

    onAccept = (description) => {
        this.jumpFm.statusBar.info('gist', 'Creating Gist...')
        newPublicGist({
            description: description,
            filesFullPath: this.jumpFm.getActivePanel().getSelectedItemsPaths()
        }, (err, url) => {
            this.jumpFm.statusBar.info('gist', 'Gist created at ' + url, 5000)
            this.jumpFm.opn(url)
        })
    }
}

const req = genReq.defaults({
    headers: { 'User-Agent': 'JumpFm' }
})

function newPublicGist(gist: Gist, cb: (err, htmlUrl: string) => void) {
    const data = {
        description: gist.description,
        public: true,
        files: {}
    }

    gist.filesFullPath.forEach(file => {
        data.files[path.basename(file)] = {
            content: fs.readFileSync(file, { encoding: 'utf8' })
        }
    })

    this.req.post({
        url: 'https://api.github.com/gists',
        json: true,
        body: data
    }, (err, res, body) => {
        cb(err, body.html_url)
    })
}

export const load = (jumpFm: JumpFm) => {
    const gistDialog = new GistDialog(jumpFm)
    jumpFm.bindKeys('publicGist', ['ctrl+g'], () => {
        jumpFm.dialog.open(gistDialog)
    }).filterMode()
}
