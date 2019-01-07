import * as fs from 'fs';
import * as path from 'path';
import * as cron from 'node-cron';
import * as readdir from 'readdir-enhanced';
import * as readline from 'readline';

import logger from '../../services/logger.service';
import utils from '../../services/utils.service';


/**
 * Classe responsável pelo snapshot e geração dos metadados dos arquivos
 */
class Snapshot {

    private inProgress = false;

    constructor() {
        this.schedule();
    }


    /**
     * Agenda leitura dos arquivos em snapshots
     */
    public schedule() {
        cron.schedule('*/5 * * * * *', async () => {
            this.run();
        });
    }


    /**
     * Executa leitura dos arquivos em snapshots
     */
    private async run() {
        try {
            if (!this.inProgress) {
                this.inProgress = true;
                
                let snapshots = readdir.sync(`${utils.getDataPath()}/plans/snapshots`, {deep: false, sep: '/', filter: '*.snap'});
                
                for (let snapshot of snapshots) {
                    await this.read(snapshot);
                }
                
                this.inProgress = false;
            }
        } catch (err) {
            this.inProgress = false;
            logger.error('Não foi possível executar snapshot! Error: ' + err.message);
        }
    }


    /**
     * Lê e processa cada arquivos presente no snapshot
     * @param snapshotFile nome do arquivo
     */
    private async read(snapshotFile: string) {
        return new Promise((resolve) => {
            try {
            
                // await utils.cmdExec(`dir "${sourcePath}" /A-D /B /S > ${snapshotFile} 2>&1`);
                // const snap = cp.spawn('dir', [`${sourcePath} /A-D /B /S`], { shell: true });
                const rl = readline.createInterface({
                    // input: snap.stdout,
                    input: fs.createReadStream(`${utils.getDataPath()}/plans/snapshots/${snapshotFile}`),
                    terminal: true,
                    historySize: 0,
                    crlfDelay: Infinity
                });
    
                rl.on('line', async function (line: any) {
                    console.log(line);
                    
                    // fs.writeFileSync(`${path.dirname(snapshotFile)}/teste/${i+1}.txt`, line, 'utf8');
                    // console.log(path.dirname(snapshotFile));
                    
                    // TODO: buscar plano pelo nome do arquivo e data e hora de inicio
                    // TODO: verificar se o arquivo (line) foi modificado
                });
    
                rl.on('error', async function (err) {
                    logger.error('Erro ocorrido no meio da leitura do arquivo de snapshot! Error: ' + err.message);
                });
    
                rl.on('close', async function () {
                    logger.info('Fim da leitura do snapshot!');
                    fs.unlinkSync(`${utils.getDataPath()}/plans/snapshots/${snapshotFile}`);
                    return resolve(true);
                });
            } catch (err) {
                logger.error(err);
            }
        });
    }

}

export default new Snapshot();
