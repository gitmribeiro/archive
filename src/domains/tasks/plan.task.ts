import * as fs from 'fs';
import * as path from 'path';
import * as cron from 'node-cron';

import logger from '../../services/logger.service';
import utils from '../../services/utils.service';
import planService from '../../services/plan.service';


/**
 * Classe responsável pelo snapshot e geração dos metadados dos arquivos
 */
class Plan {

    constructor() {
        this.schedule();
    }


    /**
     * Agenda execução de todos os planos
     */
    public async schedule() {

        const plans = await planService.getAll();
        // console.log(plans);

        if (plans && plans.length > 0) {
            await this.execute(plans[0]);
        }

        logger.info('Todos os planos foram agendados!');
    }


    /**
     * Executa snapshot gerando arquivo .snap que será lido poroutro processo separado
     * @param plan objeto representando um plano
     */
    private async execute(plan: any) {
        try {

            let snapshotFile = path.normalize(`${utils.getDataPath()}/plans/snapshots/${plan.id}`);

            await utils.mkdirRecursiveSync(path.dirname(snapshotFile));

            for (let source of plan.sources) {
                
                let sourcePath = path.normalize(source.path + '/' + source.search);
    
                if (fs.existsSync(path.dirname(sourcePath))) {
    
                    await utils.cmdExec(`dir "${sourcePath}" /A-D /B /S > ${snapshotFile} 2>&1`);
                    
                    fs.renameSync(snapshotFile, `${snapshotFile}.snap`);
                    
                } else {
                    throw Error('O source do plano nao foi localizado!');
                }
            }
        } catch (err) {
            logger.error('Ocorreu um erro não esperado! Error: ' + err.message);
        }
    }

}

export default new Plan();
