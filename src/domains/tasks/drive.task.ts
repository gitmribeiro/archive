import * as cron from 'node-cron';

import logger from '../../services/logger.service';


/**
 * Classe responsável pela transferência de arquivos para o provedor
 */
class DriveTask {

    constructor() {
        this.schedule();
    }


    /**
     * Agenda para cada 5s a transferência de arquivos para o provedor (storage)
     */
    public schedule() {
        cron.schedule('* * * * * *', async () => {
            logger.info('Drive!');
        });
    }
}

export default new DriveTask();
