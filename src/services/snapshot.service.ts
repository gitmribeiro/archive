import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import * as readline from 'readline';
import moment = require('moment');

import logger from '../services/logger.service';
import utils from '../services/utils.service';


/**
 * Classe responsável por regras de negócio do snapshot
 */
class SnapshotService {

    constructor() {}


    /**
     * Executa snapshot
     * @param plan objeto representando um plano
     */
    public async execute(plan: any) {
        try {

            logger.debug('Iniciando snapshot.');

            plan.startdate = moment().format('YYYYMMDDHHmmss');
            plan.snapshotfile = path.normalize(`${utils.getDataPath()}/plans/${plan.id}/snapshots/${plan.id}`);

            await utils.mkdirRecursiveSync(path.dirname(plan.snapshotfile));

            for (let source of plan.sources) {
                
                let sourcePath = path.normalize(source.path + '/' + source.search);
    
                if (fs.existsSync(path.dirname(sourcePath))) {

                    // await utils.cmdExec(`dir "${sourcePath}" /A-D /B /S > ${snapshotFile} 2>&1`);
                    // fs.unlinkSync(`${utils.getDataPath()}/plans/snapshots/${snapshotFile}`);

                    // gera arquivo snap para escrita
                    const snapshotStream = this.createSnapshotFileStream(plan);

                    // executa snapshot por comando do SO
                    // TODO: implementar para diferentes plataformas (se necessario)
                    const snap = cp.spawn('dir', [`${sourcePath} /A-D /B /S 2>&1`], { shell: true });

                    const rl = readline.createInterface({
                        input: snap.stdout,
                        terminal: false,
                        historySize: 0,
                        crlfDelay: Infinity
                    });
        
                    rl.on('line', async function (srcFile: any) {
                        srcFile = path.normalize(srcFile);
                        
                        if (fs.existsSync(srcFile)) {
                            const statFile = fs.statSync(srcFile);
                            
                            let line = `${srcFile}|${statFile.dev + statFile.ino}|${statFile.atimeMs}|${statFile.mtimeMs}|${statFile.size}\n`;

                            // fields: path | id | atime | mtime | size
                            if (source.type.toLowerCase() === 'diff') {
                                if (await this.changedFile(line)) {
                                    snapshotStream.write(line, 'utf8');
                                }
                            } else {
                                snapshotStream.write(line, 'utf8');
                            }
                        }
                    });
        
                    rl.on('error', async function (err) {
                        logger.error('Erro ocorrido no durante a leitura do arquivo de snapshot! Error: ' + err.message);
                    });
        
                    rl.on('close', async function () {
                        logger.debug('Todos os arquivos do path planejado foram lidos e o snapshot foi finalizado.');
                        snapshotStream.end();
                    });
                    
                } else {
                    throw Error('O source do plano nao foi localizado!');
                }
            }
        } catch (err) {
            logger.error('Ocorreu um erro não esperado! Error: ' + err.message);
        }
    }


    /**
     * Abre arquivo por strem para escrita
     * @param snapshotFilePath caminho do arquivo onde o snapshot será salvo
     */
    private createSnapshotFileStream(plan: any): fs.WriteStream {
        
        let writeStream = fs.createWriteStream(plan.snapshotfile);
        
        writeStream.on('finish', () => {
            fs.renameSync(plan.snapshotfile, `${path.dirname(plan.snapshotfile)}/${plan.startdate}__${path.basename(plan.snapshotfile)}.snap`);
            logger.debug('O arquivo do snapshot foi gerado com sucesso, em instantes ele sera processado.');
        });

        return writeStream;
    }


    private async changedFile(line: string) {
        try {
            // TODO
        } catch (err) {
            logger.error(err);
        }
    }

}

export default new SnapshotService();
