import * as path from 'path';
import * as fs from 'fs';

import { logger } from '../../middlewares/logger';
import { IStorage } from "./storage.interface";
import { configurationService } from "../../services/configuration.service";
import { config, S3 } from "aws-sdk";
import { utilService } from "../../services/util.service";

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
                this.cfg = await configurationService.load();
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
                await this.s3.createBucket({ Bucket: global.CFG.storageBucket, ACL: 'public-read', CreateBucketConfiguration: { LocationConstraint: 'sa-east-1' } }).promise();
                
                // obtem bucket responsavel pelo backup
                const response: any = await this.s3.getBucketAcl({ Bucket: global.CFG.storageBucket }).promise();
                
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

            // busca todos os arquivos presentes no drive
            if (this.sending === false) {
            
                const files = await utilService.getDriveFilesRecursive();
                
                // existem arquivos no drive (transfere)
                if (files.length > 0) {
                    this.sending = true;
                    
                    await utilService.forEach(files, async(filePath: string) => {

                        let fileDir = path.dirname(filePath).replace(/\\/g, '/');
                        let filePathStorage = fileDir.replace(`${global.CFG.storageTemp}/drive`.replace(/\\/g, '/'), '');
                        let fileDetail = fs.lstatSync(filePath);

                        if (fileDetail.isFile()) {

                            let params = {
                                Bucket: `${global.CFG.storageBucket}/drive${filePathStorage}`.replace(/\\/g, ''),
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
                            let folderIsEmpty = await utilService.folderIsEmpty(filePath);
                            if (folderIsEmpty) {
                                fs.rmdirSync(filePath);
                            }
                        }
                    });

                    this.sending = false;
                }
            }
        } catch (err) {
            this.sending = false;
            logger.error(err.message);
        }
    }

    public async listAllFiles(folder?: string) {
        return new Promise(async (resolve, reject) => {
            let prefix = `drive/${global.CFG.networkid}/`;

            if(folder) {
                prefix = `${prefix}${folder}/`.replace(/\/\//g, '/');
            }
            
            let find = {
                bucket    : global.CFG.storageBucket,
                prefix    : prefix,
                delimiter : '/',
                maxKeys   : 2147483647,
                results   : []
            };
    
            const s3ListCallback = (err, data) => {
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
