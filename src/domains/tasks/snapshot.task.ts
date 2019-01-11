import * as cron from 'node-cron';

import planService from '../../services/plan.service';
import snapshotService from '../../services/snapshot.service';


/**
 * Classe responsável pelo snapshot e geração dos metadados dos arquivos
 */
class Snapshot {

    private progress: boolean;

    constructor() {
        this.progress = false;
        this.schedule();
    }


    /**
     * Agenda leitura dos arquivos em snapshots
     */
    public schedule() {
        cron.schedule('* * * * * *', () => {
            this.execute();
        });
    }


    /**
     * Busca os snapshots e processa gerando os metadados para cada arquivo presente
     */
    private async execute() {
        if (this.progress == false) {

            const plans = await planService.getAll();
    
            for (let plan of plans) {
                this.progress = true;
                
                await snapshotService.process(plan);
            }
            
            this.progress = false;
        }
    }

}

export default new Snapshot();
