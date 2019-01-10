import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import * as readline from 'readline';
import moment = require('moment');

import logger from '../services/logger.service';
import utils from '../services/utils.service';
import { rejects } from 'assert';


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
                            
                            let line = `${srcFile}|${statFile.dev + statFile.ino}|${statFile.atimeMs}|${statFile.mtimeMs}|${statFile.size}`;
                            
                            logger.debug(line);

                            // fields: path | id | atime | mtime | size
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
                        // snapshotStream.end();
                        fs.renameSync(plan.snapshotfile, `${path.dirname(plan.snapshotfile)}/${plan.startdate}__${path.basename(plan.snapshotfile)}.snap`);
                        logger.debug('[OK] O arquivo do snapshot foi gerado com sucesso, em instantes ele sera processado.');
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

}

export default new SnapshotService();
