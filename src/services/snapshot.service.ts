import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import * as readline from 'readline';
import * as moment from 'moment';
import * as readdir from 'readdir-enhanced';
import * as lineByLineReader from 'line-by-line';

import logger from './logger.service';
import utils from './utils.service';
import dicomService from './dicom.service';


/**
 * Classe responsável por regras de negócio do snapshot
 */
class SnapshotService {

    private CFG: any;

    constructor() { }


    /**
     * Obtém metadado da linha processada
     * @param line representa metadado
     */
    public getSnapshotData(line: string) {
        let lineParts = line.split('|');

        return {
            id: lineParts[1],
            path: lineParts[0],
            creation: lineParts[2],
            modified: lineParts[3],
            size: lineParts[4],
            sourceidx: lineParts[5]
        };
    }


    /**
     * Executa snapshot
     * @param plan objeto representando um plano
     */
    public async execute(plan: any) {
        try {

            logger.debug(`[OK] Iniciando snapshot para o plano: ${plan.id}`);

            plan.startdate = moment().format('YYYYMMDDHHmmss');

            plan.snapshotfile = path.normalize(`${utils.getDataPath()}/plans/${plan.id}/snapshots/${plan.id}`);

            await utils.mkdirRecursiveSync(path.dirname(plan.snapshotfile));

            const snapshotStream = fs.createWriteStream(plan.snapshotfile, { encoding: "utf8" });

            let sourceIdx = 0;

            for (let source of plan.sources) {

                let sourcePath = path.normalize(source.path + '/' + source.search);

                if (fs.existsSync(path.dirname(sourcePath))) {

                    const snap = cp.spawn('dir', [`${sourcePath} /A-D /B /S 2>&1`], { shell: true });

                    const rl = readline.createInterface({
                        input: snap.stdout,
                        terminal: false,
                        historySize: 0
                    });

                    rl.on('line', async (srcFile: any) => {
                        if (fs.existsSync(srcFile)) {
                            srcFile = path.normalize(srcFile);
                            const statFile: any = fs.statSync(srcFile);

                            // path | id | atime | mtime | size | sourceIdx
                            let line = `${srcFile}|${statFile.dev + statFile.ino}|${statFile.atimeMs}|${statFile.mtimeMs}|${statFile.size}|${sourceIdx}`;

                            if (source.type.toLowerCase() === 'diff') {
                                if (await this.changedFile(plan, line, source)) {
                                    snapshotStream.write(`${line}\n`, 'utf8');
                                }
                            } else {
                                snapshotStream.write(`${line}\n`, 'utf8');
                            }
                        }
                    });

                    rl.on('error', (err) => {
                        logger.error('[X] Erro durante a leitura da linha no arquivo de snapshot! Message: ' + err.message);
                    });

                    rl.on('close', async () => {
                        fs.renameSync(plan.snapshotfile, `${path.dirname(plan.snapshotfile)}/${plan.startdate}__${path.basename(plan.snapshotfile)}.snap`);
                        logger.debug('[OK] O snapshot foi gerado com sucesso e em instantes ele sera processado.');
                    });

                } else {
                    throw Error('O source do plano nao foi localizado!');
                }

                // sourceIdx++;
            }
        } catch (err) {
            logger.error('[X] Ocorreu um erro ao executar o snapshot! Message: ' + err.message);
        }
    }


    /**
     * Valida se o arquivo foi modificado consultado os metadados
     * @param plan plano de backup
     * @param line dados da linha do snapshot contendo (id, path, creation, modified e size) do arquivo
     * @param source opcional contém o path backup planejado
     */
    private async changedFile(plan: any, line: string, source?: any) {
        return new Promise((resolve) => {
            try {

                const snapshotData = this.getSnapshotData(line);

                const metadataPath = path.normalize(`${utils.getDataPath()}/plans/${plan.id}/stats/${moment(parseInt(snapshotData.creation.toString())).format('YYYYMMDD')}/${snapshotData.id}`);

                if (fs.existsSync(metadataPath)) {
                    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

                    if (snapshotData.size == metadata.size && snapshotData.modified == metadata.modified) {
                        return resolve(false);
                    }
                }

                return resolve(true);
            } catch (err) {
                logger.error('Ocorreu um erro na verificação de alteração do arquivo! Message: ' + err);
                return resolve(true);
            }
        });
    }


    /**
     * Processa o snapshot do plano informado
     * @param plan objeto representando o planejamento do backup
     */
    public async process(plan: any) {
        return new Promise(async (resolve) => {
            try {

                let snapshotfile = path.normalize(`${utils.getDataPath()}/plans/${plan.id}/snapshots`);

                await utils.mkdirRecursiveSync(snapshotfile);

                if (fs.existsSync(snapshotfile)) {

                    let files = readdir.sync(snapshotfile, { deep: false, sep: '/', filter: '**/*.snap' });

                    if (files.length > 0) {

                        this.CFG = utils.CFG();

                        let file = path.normalize(`${snapshotfile}/${files[0]}`);

                        let completedPath = path.normalize(`${path.dirname(snapshotfile)}/completed`);

                        await utils.mkdirRecursiveSync(completedPath);

                        const wl = fs.createWriteStream(`${completedPath}/${files[0]}`, { encoding: "utf8" });

                        const rl = new lineByLineReader(file, { start: 0 });

                        rl.on('error', (err) => {
                            logger.error(err);
                        });

                        rl.on('line', async (line) => {
                            rl.pause();

                            logger.info(`Processando: ${line}`);
                            line = await this.readAndProcess(plan, line);
                            wl.write(`${line}\n`, 'utf8');

                            rl.resume();
                        });

                        rl.on('end', async () => {
                            logger.debug('[OK] O snapshot foi processado com sucesso.');
                            if (fs.existsSync(file)) {
                                fs.unlinkSync(file);
                                wl.end();
                            }
                            return resolve(true);
                        });
                    } else {
                        return resolve(true);
                    }
                } else {
                    logger.warn('O caminho do snapshot não foi localizado: ' + snapshotfile);
                    return resolve(true);
                }
            } catch (err) {
                logger.error(err);
                return resolve(true);
            }
        });
    }


    /**
     * Lê e processa cada arquivo
     * @param plan objeto representando o planejamento do backup
     * @param line string representando o path do arquivo
     */
    public async readAndProcess(plan: any, line: string) {
        return new Promise(async (resolve) => {
            try {

                const snapshotData = this.getSnapshotData(line);
                let statsPath = path.normalize(`${utils.getDataPath()}/plans/${plan.id}/stats/${moment(parseInt(snapshotData.creation.toString())).format('YYYYMMDD')}`);
                await utils.mkdirRecursiveSync(statsPath);

                let detail: any;

                try {
                    detail = await this.sendToDrive(plan, snapshotData);
                } catch (e) {
                    detail = { error: e.message, endTime: moment().valueOf(), outSize: 0 };
                }

                // path | id | atime | mtime | size | sourceIdx | endTime | outSize
                line = `${line}|${detail.error || 'SUCCESS'}|${detail.endTime}|${detail.outSize}`;

                let metadataFile = path.normalize(`${statsPath}/${snapshotData.id}`);
                fs.writeFileSync(metadataFile, JSON.stringify(snapshotData, null, 4), 'utf8');
                return resolve(line);
            } catch (err) {
                line = `${line}|${err.message.toString()}`;
                return resolve(line);
            }
        });
    }


    /**
     * Envia arquivo para o drive responsável por enviar ao provedor
     * @param plan 
     * @param metadata 
     */
    private async sendToDrive(plan: any, metadata: any) {
        return new Promise(async (resolve, reject) => {
            try {

                // se não existe espaço livre interrompe o processo até a liberação do drive
                if (await this.hasFreeSpace()) {
                    
                    // obtem source do plano pelo metadado
                    const sourcePlan = plan.sources[metadata.sourceidx];
    
                    // constroi path do arquivo no drive (conforme storagepath do plano)
                    let drivePath = path.normalize(metadata.path.replace(/[\\"]/g, '/').replace(`${sourcePlan.path}`, `${utils.getDrivePath()}/${sourcePlan.storagepath}/`));
    
                    await utils.mkdirRecursiveSync(path.dirname(drivePath));
    
                    let fileDetail: any;
    
                    // aplica compressao se exigido (se arquivo dicom)
                    if (sourcePlan.compression.dicom.toUpperCase() === 'LOSSLESS' || sourcePlan.compression.dicom.toUpperCase() === 'LOSSY') {
                        if (dicomService.isDicomFile(metadata.path)) {
                            try {
                                fileDetail = await dicomService.compressFile(metadata.path, drivePath, sourcePlan.compression.dicom, sourcePlan.compression.quality);
                            } catch (e) {
                                fileDetail.error = e.message;
                            }
                        } else {
                            fileDetail = await this.copyFileSync(metadata.path, drivePath);
                        }
                    } else {
                        fileDetail = await this.copyFileSync(metadata.path, drivePath);
                    }
    
                    return resolve(fileDetail);
                }
            } catch (err) {
                return reject(err);
            }
        });
    }


    /**
     * Copia simples do arquivo para o destino
     * @param src 
     * @param dst 
     */
    private async copyFileSync(src: string, dst: string) {
        try {
            let fileDetail: any = {
                success: false,
                startTime: moment().valueOf(),
                endTime: moment().valueOf(),
                srcFile: src,
                tempFile: dst,
                outSize: 0
            };

            fs.copyFileSync(src, dst);

            const stats = fs.statSync(dst);
            fileDetail.srcDev = stats.dev;
            fileDetail.srcOid = stats.ino;
            fileDetail.outSize = stats.size;
            fileDetail.endTime = new Date().getTime();
            fileDetail.success = true;

            return fileDetail;
        } catch (err) {
            logger.error(err);
        }
    }


    /**
     * Retorna o espaço disponível no path planejado
     * info.available, info.free, info.total
     */
    private hasFreeSpace() {
        return new Promise((resolve) => {
            // disk.check(utils.getDrivePath(), (err, info) => {
            //     if (err) {
            //         logger.error('[X] Erro ao calcular espaço no drive - Message: ' + err.message);
            //         return resolve(false);
            //     }
                
            //     let isFreeSpace = Math.round((info.free * this.CFG.drive.maxFreeSpace)/100) > 0;
                
            //     if (isFreeSpace) {
            //         return resolve(isFreeSpace);
            //     }
                
            //     const checkFreeSpace = setTimeout(async() => {
            //         logger.debug('[X] Processo interrompido! Aguardando liberação de espaço no drive.');
            //         await this.hasFreeSpace();
            //         clearTimeout(checkFreeSpace);
            //     }, 5000);
            // });

            return resolve(true);
        });
    }

}

export default new SnapshotService();
