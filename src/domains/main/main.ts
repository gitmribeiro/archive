import * as path from 'path';
import * as cp from 'child_process';

import logger from '../../services/logger.service';
import config from '../../services/config.service';
import utils from '../../services/utils.service';


/**
 * Classe responsável pela inicialização do serviço
 */
class Main {

    constructor() {
        this.createChildProcess();
    }


    /**
     * Inicializador do serviço
     */
    public async initialize() {
        await config.load();
        this.run();
    }


    /**
     * Executa processos separados para o drive, snapshot e plans, deixando o processo principal
     * para o servidor express (APIs)
     */
    private createChildProcess() {
        // cp.fork(path.normalize(`${__dirname}/../tasks/drive.task`));
        cp.fork(path.normalize(`${__dirname}/../tasks/snapshot.task`));
        cp.fork(path.normalize(`${__dirname}/../tasks/plan.task`));
    }


    /**
     * Inicia o serviço, api e seus processos filhos
     */
    private async run() {
        // console.log(utils.CFG());
        logger.debug('[OK] Configurações e sub-processos iniciados com sucesso!');
    }
}

export default new Main();
