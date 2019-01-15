import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as cp from 'child_process';
import * as readline from 'readline';
import * as glob from 'glob-all';

import logger from './logger.service';


/**
 * Classe com metodos utilitarios
 */
class Utils {

    constructor() { }


    public getRootPath() {
        return path.normalize(`${process.cwd()}`);
    }


    public getDataPath() {
        return path.normalize(`${process.cwd()}/data`);
    }


    public getResourcePath() {
        return path.normalize(`${__dirname}/../../data/resources`);
    }


    public getDrivePath() {
        return this.CFG().drive.path || `${this.getRootPath()}/drive`;
    }


    public CFG() {
        return JSON.parse(fs.readFileSync(`${this.getRootPath()}/data/config.json`, 'utf8'));
    }


    public async lock(info?: any) {
        try {
            if (!fs.existsSync(`${this.getDataPath()}/tmp/lock.tmp`)) {
                fs.writeFileSync(`${this.getDataPath()}/tmp/lock.tmp`, JSON.stringify({ progress: false }, null, 4));
            }
            
            if (info) {
                fs.writeFileSync(`${this.getDataPath()}/tmp/lock.tmp`, JSON.stringify(info, null, 4));
                return info;
            }
    
            return JSON.parse(fs.readFileSync(`${this.getDataPath()}/tmp/lock.tmp`, 'utf8'));
        } catch (err) {
            logger.error(err);
        }
    }


    public async inProgress(progress?: boolean) {
        try {

            let info = await this.lock();

            if (progress != undefined) {
                info.progress = progress;
                await this.lock(info);
            }

            return info.progress;
        } catch (err) {
            logger.error(err);
            return false;
        }
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


    public encrypt(text: string) {
        let cipher = crypto.createCipher('aes-128-cbc', this.fromB64('d3R0YXJjaGl2ZS5hbGxpYW5jZQ=='));
        let crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }


    public decrypt(text: string) {
        let decipher = crypto.createDecipher('aes-128-cbc', this.fromB64('d3R0YXJjaGl2ZS5hbGxpYW5jZQ=='));
        let dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }


    public sleep(ms: number) {
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
            logger.info('closed!');
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
                stream.on('data', function (data) {
                    hash.update(data, 'utf8');
                });
                stream.on('end', function () {
                    return resolve(hash.digest('hex'));
                });
            } catch (err) {
                return resolve(null);
            }
        });
    }

    public async folderIsEmpty(path: string) {
        const dir = fs.readdirSync(path);
        if (dir.length > 0) {
            return false;
        }
        return true;
    }

    public async getDriveFilesRecursive() {
        this.mkdirRecursiveSync(this.getDrivePath());
        return glob.sync(`${this.getDrivePath()}/**/*`);
    }

    public async getDisk(drive: string, callback: Function) {

        let result = {
            total: 0,
            used: 0,
            free: 0,
            status: null
        };

        if (!drive) {
            result.status = 'NOTFOUND';
            let err = new Error('Por favor, informe o drive ou path desejado');
            return callback ? callback(err, result) : logger.error(err);
        }

        if (os.type.toString() == 'Windows_NT') {
            if (drive.length <= 3) {
                drive = drive.charAt(0);
            }

            cp.execFile(path.normalize(`${this.getResourcePath()}/vendors/drivespace/drivespace.exe`), [`drive-${drive}`], (error: Error, stdout: any, stderr: any) => {
                if (error) {
                    result.status = 'STDERR';
                } else {
                    let disk_info = stdout.trim().split(',');
                    result.total = disk_info[0];
                    result.free = disk_info[1];
                    result.used = result.total - result.free;
                    result.status = disk_info[2];

                    if (result.status === 'NOTFOUND') {
                        error = new Error('Drive not found');
                    }
                }

                callback ? callback(error, result) : logger.error(stderr);
            });
        } else {
            cp.exec(`df -k '${drive.replace(/'/g, "'\\''")}'`, (error: Error, stdout: any, stderr: any) => {
                if (error) {
                    if (stderr.indexOf("No such file or directory") != -1) {
                        result.status = 'NOTFOUND';
                    } else {
                        result.status = 'STDERR';
                    }

                    callback ? callback(error, result) : logger.error(stderr);
                } else {
                    let lines = stdout.trim().split("\n");
                    let str_disk_info = lines[lines.length - 1].replace(/[\s\n\r]+/g, ' ');
                    let disk_info = str_disk_info.split(' ');
                    
                    result.total = disk_info[1] * 1024;
                    result.used = disk_info[2] * 1024;
                    result.free = disk_info[3] * 1024;
                    result.status = 'READY';

                    callback && callback(null, result);
                }
            });
        }

    }

}

export default new Utils();
