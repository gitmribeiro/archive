import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as cp from 'child_process';

import logger from './logger.service';
import utils from './utils.service';
import { IStorage } from '../repositories/storage.interface';
import { S3Repository } from '../repositories/s3.repository';


/**
 * Classe responsável por regras de negócio do drive
 */
class DriveService {

    private iStorage: IStorage;
    private scanPath: string;

    constructor() {
        this.iStorage = new S3Repository();
        this.load();
    }
    
    
    private async load() {
        this.iStorage.checkCredentials();

        this.scanPath = utils.getDrivePath();
        await utils.mkdirRecursiveSync(this.scanPath);
    }

    public async hasFilesInDrive() {
        return new Promise((resolve) => {
            try {

                const snap = cp.spawn('dir', [`${path.normalize(utils.getDrivePath())} /A /B /S 2>&1`], { shell: true });
                
                let files = 0;
                const rl = readline.createInterface({
                    input: snap.stdout,
                    terminal: false,
                    historySize: 0
                });
                
                rl.on('line', async (line) => {
                    if (!line.startsWith('Arquivo ') && !line.startsWith('File ')) {
                        files++;
                    }
                    if (files > 0) {
                        rl.close();
                        return resolve(true);
                    }
                });
            } catch (err) {
                logger.error('Erro ao executar o comando! Message: ' + err.message);
                return resolve(false);
            }
        });
    }

    public async removeFromDrive(src: string) {
        return new Promise(async (resolve) => {
            try {
                
                if (fs.existsSync(src)) {
                    let stat = fs.statSync(src);
                    
                    if (stat.isFile()) {
                        fs.unlinkSync(src);
                    } else {
                        let folderIsEmpty = await utils.folderIsEmpty(src);
                        if (folderIsEmpty && await utils.inProgress() === false) {
                            fs.rmdirSync(src);
                        }
                    }
                }

                return resolve(true);
            } catch (err) {
                logger.error(err);
            }
        });
    }

    public async scan() {
        this.iStorage.sync();
    }

}

export default new DriveService();
