import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import * as readline from 'readline';
import * as moment from 'moment';
import * as readdir from 'readdir-enhanced';
import * as lineByLineReader from 'line-by-line';

import logger from '../services/logger.service';
import utils from '../services/utils.service';


/**
 * Classe responsável por regras de negócio do snapshot
 */
class SnapshotService {

    constructor() { }


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

            snapshotStream.write(`${JSON.stringify(plan)}\n`, 'utf8');

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

                            // path | id | atime | mtime | size
                            let line = `${srcFile}|${statFile.dev + statFile.ino}|${statFile.atimeMs}|${statFile.mtimeMs}|${statFile.size}`;
                            // logger.debug(line);

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
                        logger.debug('[OK] O arquivo do snapshot foi gerado com sucesso e em instantes ele sera processado.');
                    });

                } else {
                    throw Error('O source do plano nao foi localizado!');
                }
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

                let lineParts = line.split('|');

                const snapshotData = {
                    id: lineParts[1],
                    path: lineParts[0],
                    creation: lineParts[2],
                    modified: lineParts[3],
                    size: lineParts[4],
                    hash: lineParts[5]
                }

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
                        let file = path.normalize(`${snapshotfile}/${files[0]}`);
    
                        const rl = new lineByLineReader(file);
                        let i = 1;
    
                        rl.on('error', (err) => {
                            logger.error(err);
                        });
    
                        rl.on('line', async(line) => {
                            rl.pause();
                            
                            // logger.info(line);
                            // fs.writeFileSync(`${snapshotfile}/teste/${i}.txt`, line, 'utf8');

                            i++;
                            rl.resume();
                        });
    
                        rl.on('end', async () => {
                            console.log(utils.CFG());
                            logger.debug('[OK] O arquivo do snapshot foi processado com sucesso.');
                            if (fs.existsSync(file)) {
                                fs.unlinkSync(file);
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

}

export default new SnapshotService();
