import * as cron from 'node-cron';

import driveService from '../../services/drive.service';


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
            driveService.scan();
        });
    }
}

export default new DriveTask();
