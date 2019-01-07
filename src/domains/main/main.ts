import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import * as readline from 'readline';

import logger from '../../services/logger.service';
import config from '../../services/config.service';
import utils from '../../services/utils.service';


/**
 * Classe responsável pela inicialização do serviço
 */
class Main {

    private driveProcess: cp.ChildProcess;
    private snapshotProcess: cp.ChildProcess;
    private planProcess: cp.ChildProcess;

    constructor() {
        this.createSubProcess();
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
    private createSubProcess() {
        this.driveProcess = cp.fork(path.normalize(`${__dirname}/../tasks/drive.task`));
        this.snapshotProcess = cp.fork(path.normalize(`${__dirname}/../tasks/snapshot.task`));
        this.planProcess = cp.fork(path.normalize(`${__dirname}/../tasks/plan.task`));

        this.eventSubProcess();
    }


    /**
     * Registra eventos recebidos dos processos filhos
     */
    private eventSubProcess() {
        this.driveProcess.on('message', (msg) => { logger.info(msg) });
        this.snapshotProcess.on('message', (msg) => { logger.info(msg) });
        this.planProcess.on('message', (msg) => { logger.info(msg) });
    }


    /**
     * Inicia o serviço, api e seus processos filhos
     */
    private async run() {

        logger.info('Run!');

        // console.log(utils.CFG());
        
    }
}

export default new Main();
