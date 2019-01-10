import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as cp from 'child_process';
import * as readline from 'readline';

import logger from './logger.service';


/**
 * Classe com metodos utilitarios
 */
class Utils {

    private _CFG: any;
    private idle = true;
    
    constructor() {}


    public getRootPath() {
        return path.normalize(`${process.cwd()}`);
    }
    
    
    public getDataPath() {
        return path.normalize(`${process.cwd()}/data`);
    }

    
    public getResourcePath() {
        return path.normalize(`${__dirname}/../../data/resources`);
    }

    
    public CFG(cfg?: any) {
        if (cfg) {
            this._CFG = cfg;
        }
        return this._CFG;
    }


    public isIdle(idle: boolean) {
        if (idle) {
            this.idle = idle;
        }
        return this.idle;
    }

    
    public async forEach(array: any, callback: Function) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    
    public mkdirRecursiveSync(_path: string) {
        let _paths = _path.replace(/[\\"]/g, '/').split('/');
        let fullPath = '';
        for (let _path of _paths) {
            if (fullPath === '') {
                fullPath = _path;
            } else {
                fullPath = fullPath + '/' + _path;
            }

            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath);
            }
        }
        return true;
    }

    
    public async copy(src: string, dest: string) {
        var oldFile = fs.createReadStream(src);
        var newFile = fs.createWriteStream(dest);
        oldFile.pipe(newFile);
    }

    
    public async copyDirRecursiveSync(src: string, dest: string) {
        return new Promise(async (resolve, reject) => {
            try {
                this.mkdirRecursiveSync(dest);
                let files = fs.readdirSync(src);
                for (let file of files) {
                    var current = fs.lstatSync(path.join(src, file));
                    if (current.isDirectory()) {
                        await this.copyDirRecursiveSync(path.join(src, file), path.join(dest, file));
                    } else if (current.isSymbolicLink()) {
                        var symlink = fs.readlinkSync(path.join(src, file));
                        fs.symlinkSync(symlink, path.join(dest, file));
                    } else {
                        this.copy(path.join(src, file), path.join(dest, file));
                    }
                }
                return resolve(true);
            } catch (err) {
                return reject(err);
            }
        });
    }

    
    public async deleteFolderRecursive(strpath: string): Promise<any> {
        try {
            if (fs.existsSync(strpath)) {
                for (let entry of await fs.readdirSync(strpath, 'utf8')) {
                    const curPath = `${strpath}/${entry}`;
                    if ((await fs.lstatSync(curPath)).isDirectory())
                        await this.deleteFolderRecursive(curPath);
                    else
                        await fs.unlinkSync(curPath);
                }
                await fs.rmdirSync(strpath);
            }
        } catch (err) {
            return err;
        }
    }

    
    public async cmdExec(cmd: string) {
        try {
            return cp.execSync(cmd, { encoding: 'latin1' });
        } catch (err) {
            return err.message;
        }
    }

    
    public toB64(text: string) {
        return Buffer.from(text).toString('base64');
    }
    
    
    public fromB64(b64: string) {
        return Buffer.from(b64, 'base64').toString('ascii');
    }

    
    public encrypt(text: string){
        let cipher = crypto.createCipher('aes-128-cbc', this.fromB64('d3R0YXJjaGl2ZS5hbGxpYW5jZQ=='));
        let crypted = cipher.update(text,'utf8','hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    
    public decrypt(text: string){
        let decipher = crypto.createDecipher('aes-128-cbc', this.fromB64('d3R0YXJjaGl2ZS5hbGxpYW5jZQ=='));
        let dec = decipher.update(text,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }

    
    public sleep(ms: number){
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    public readFileStream(filePath: string) {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            terminal: false
        });

        rl.on('line', async function (filePath) {
            logger.info(filePath);
        });

        rl.on('close', async function () {
            // TODO
        });
    }

    public async checksum(filePath: string, size: number = 32) {
        return new Promise((resolve) => {
            return resolve(crypto.createHash('md5')
            .update(fs.readFileSync(filePath, { encoding: 'utf8' }), 'utf8')
            .digest('hex')
            .slice(0, size));
        });
    }

    public async checksumBigfile(filePath: string) {
        return new Promise((resolve) => {
            try {
                const hash = crypto.createHash('sha1');
                const stream = fs.createReadStream(filePath);
                stream.on('data', function(data) {
                    hash.update(data, 'utf8');
                });
                stream.on('end', function() {
                    return resolve(hash.digest('hex'));
                });
            } catch (err) {
                return resolve(null);
            }
        });
    }
    
}

export default new Utils();
