import * as path from 'path';
import * as cp from 'child_process';

import logger from '../../services/logger.service';
import config from '../../services/config.service';


/**
 * Classe responsável pela inicialização do serviço
 */
class Main {

    private driveProcess: cp.ChildProcess;
    private snapshotProcess: cp.ChildProcess;
    private planProcess: cp.ChildProcess;

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
        // this.driveProcess = cp.fork(path.normalize(`${__dirname}/../tasks/drive.task`));
        // this.snapshotProcess = cp.fork(path.normalize(`${__dirname}/../tasks/snapshot.task`));
        this.planProcess = cp.fork(path.normalize(`${__dirname}/../tasks/plan.task`));

        this.eventChildProcess();
    }


    /**
     * Registra eventos recebidos dos processos filhos
     */
    private eventChildProcess() {
        // this.driveProcess.on('message', (msg: string) => { logger.info(msg) });
        // this.snapshotProcess.on('message', (msg: string) => { logger.info(msg) });
        this.planProcess.on('message', (msg: string) => { logger.info(msg); });
    }


    /**
     * Inicia o serviço, api e seus processos filhos
     */
    private async run() {

        // logger.info('Run!');

        // console.log(utils.CFG());
        
    }
}

export default new Main();
