import * as fs from 'fs';
import * as cron from 'node-cron';
import * as readdir from 'readdir-enhanced';
import * as readline from 'readline';

import logger from '../../services/logger.service';
import utils from '../../services/utils.service';


/**
 * Classe responsável pelo snapshot e geração dos metadados dos arquivos
 */
class Snapshot {

    constructor() {
        this.schedule();
    }


    /**
     * Agenda leitura dos arquivos em snapshots
     */
    public schedule() {
        cron.schedule('*/5 * * * * *', async () => {
            this.execute()
        });
    }


    /**
     * Busca os snapshots e processa gerando os metadados para cada arquivo presente
     */
    private async execute() {
        logger.info('Processando snapshot!');
    }

}

export default new Snapshot();
