import * as path from 'path';
import * as fs from 'fs';
import * as cp from 'child_process';
import * as readline from 'readline';
import * as readdir from "readdir-enhanced";
import * as lineByLineReader from 'line-by-line';
import { config, S3 } from "aws-sdk";
import moment = require('moment');

import logger from '../services/logger.service';
import utils from '../services/utils.service';
import { IStorage } from "./storage.interface";
import driveService from '../services/drive.service';


/**
 * Implementacao do servico AWS-S3
 */
export class S3Repository implements IStorage {

    private s3: S3;
    private cfg: any;
    private sending: boolean;
    
    constructor(cfg?: any) {
        this.cfg = cfg;
        this.sending = false;
    }
    
    private async loadCredentials(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.cfg) {
                this.cfg = await utils.CFG();
            }

            config.update({
                accessKeyId:     this.cfg.storageProviderAK,
                secretAccessKey: this.cfg.storageProviderSK,
                region:          this.cfg.storageProviderRegion,
            });

            this.s3 = new S3({apiVersion: '2006-03-01'});

            return resolve(true);
        }).catch((err) => {
            return err;
        });
    }
    
    public async checkCredentials(): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                await this.loadCredentials();

                // cria bucket caso nao exista
                await this.s3.createBucket({ Bucket: `wttarchive.${this.cfg.service.networkid}`, ACL: 'public-read', CreateBucketConfiguration: { LocationConstraint: 'sa-east-1' } }).promise();
                
                // obtem bucket responsavel pelo backup
                const response: any = await this.s3.getBucketAcl({ Bucket: `wttarchive.${this.cfg.service.networkid}` }).promise();
                
                if (response && response.Owner.ID != "" && response.Grants.length > 0 && response.Grants[0].Permission === 'FULL_CONTROL') {
                    return resolve(true);
                }
                
                throw new Error('Credencial inválida!');
            } catch (err) {
                return reject(err);
            }
        }).catch((err) => {
            return err;
        });
    }

    public async createBucket(options: any) {
        return new Promise((resolve, reject) => {
            this.cfg.s3.createBucket(options, (err: any, data: any) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(data);
                }
            });
        });
    }

    public async sync() {
        try {

            // busca todos os arquivos presentes no drive - await driveService.hasFilesInDrive()
            if (this.sending === false && await driveService.hasFilesInDrive()) {

                this.sending = true;
                
                let tmpDrive = `${utils.getDataPath()}/tmp/drive.tmp`;
                
                await utils.mkdirRecursiveSync(path.dirname(tmpDrive));

                await utils.cmdExec(`dir "${path.normalize(utils.getDrivePath())}" /A /B /S > "${tmpDrive}" 2>&1`);
                
                
                const rl = new lineByLineReader(tmpDrive, { start: 0, skipEmptyLines: true });
                
                rl.on('line', async (line) => {
                    rl.pause();

                    let stat = fs.statSync(line);
                    if (stat.isFile()) {
                        logger.info(line);

                        let fileDir = path.dirname(line).replace(/\\/g, '/');
                        let filePathStorage = fileDir.replace(`${utils.getDrivePath()}`.replace(/\\/g, '/'), '');
                        let fileDetail = fs.lstatSync(line);

                        let params = {
                            Bucket: `wttarchive.${this.cfg.service.networkid}/drive${filePathStorage}`.replace(/\\/g, ''),
                            Key: path.basename(filePath),
                            Body: fs.createReadStream(filePath)
                        }

                        // tranfere arquivo para storage
                        const response = await this.s3.upload(params).promise();

                        // remove do drive cada arquivo transferido com sucesso
                        if (response && response.ETag != "" && response.Location != "") {
                            await fs.unlinkSync(filePath);
                            console.log(`Sending: ${path.basename(filePath)}`);
                        }
                    }

                    await driveService.rmFilesInDrive(line);

                    rl.resume();
                }).on('error', (err) => {
                    logger.error(err);
                }).on('end', async () => {
                    this.sending = false;

                    if (fs.existsSync(tmpDrive)) {
                        fs.unlinkSync(tmpDrive);
                    }
                });




                // const files = await utils.getDriveFilesRecursive();
                
                /*
                // existem arquivos no drive (transfere)
                if (files.length > 0) {
                    this.sending = true;
                    
                    await utils.forEach(files, async(filePath: string) => {

                        let fileDir = path.dirname(filePath).replace(/\\/g, '/');
                        let filePathStorage = fileDir.replace(`${utils.getDrivePath()}`.replace(/\\/g, '/'), '');
                        let fileDetail = fs.lstatSync(filePath);

                        if (fileDetail.isFile()) {

                            let params = {
                                Bucket: `wttarchive.${this.cfg.service.networkid}/drive${filePathStorage}`.replace(/\\/g, ''),
                                Key: path.basename(filePath),
                                Body: fs.createReadStream(filePath)
                            }

                            // tranfere arquivo para storage
                            const response = await this.s3.upload(params).promise();

                            // remove do drive cada arquivo transferido com sucesso
                            if (response && response.ETag != "" && response.Location != "") {
                                await fs.unlinkSync(filePath);
                                console.log(`Sending: ${path.basename(filePath)}`);
                            }
                        } else {
                            let folderIsEmpty = await utils.folderIsEmpty(filePath);
                            if (folderIsEmpty) {
                                fs.rmdirSync(filePath);
                            }
                        }
                    });

                    this.sending = false;
                }
                */
            }
        } catch (err) {
            this.sending = false;
            logger.error(err.message);
        }
    }

    public async listAllFiles(folder?: string) {
        return new Promise(async (resolve, reject) => {
            let prefix = `drive/${this.cfg.service.networkid}/`;

            if(folder) {
                prefix = `${prefix}${folder}/`.replace(/\/\//g, '/');
            }
            
            let find = {
                bucket    : `wttarchive.${this.cfg.service.networkid}`,
                prefix    : prefix,
                delimiter : '/',
                maxKeys   : 2147483647,
                results   : []
            };
    
            const s3ListCallback = (err: Error, data: any) => {
                if (err) throw err;
    
                find.results = find.results.concat(data.Contents);
    
                if (data.IsTruncated) {
                    this.s3.listObjectsV2({
                        Bucket: find.bucket,
                        MaxKeys: find.maxKeys,
                        Delimiter: find.delimiter,
                        Prefix: find.prefix,
                        ContinuationToken: data.NextContinuationToken
                    }, s3ListCallback);
                } else {
                    find.results = find.results.map((val) => {
                        return { path: val.Key, size: val.Size };
                    });
                    return resolve(find.results);
                }
            }
    
            this.s3.listObjectsV2({
                Bucket: find.bucket,
                MaxKeys: find.maxKeys,
                Delimiter: find.delimiter,
                Prefix: find.prefix,
                StartAfter: find.prefix
            }, s3ListCallback);

        }).catch((err) => {
            return err;
        });
    }

}
