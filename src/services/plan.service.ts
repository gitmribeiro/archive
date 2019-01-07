import * as fs from 'fs';
import * as path from 'path';

import utils from './utils.service';


/**
 * Casse utilitaria para gerenciar os planos de backup
 */
class PlanService {

    constructor() {}

    /**
     * Retorna todos os planos de backup habilitados (cria um caso não exista)
     */
    public getAll() {

        const planPath = `${utils.getDataPath()}/plans/plans.json`;

        if (!fs.existsSync(planPath)) {
            utils.mkdirRecursiveSync(path.dirname(planPath));
            fs.writeFileSync(planPath, JSON.stringify(this.getSample(), null, 4), 'utf8');
        }

        const list = JSON.parse(fs.readFileSync(planPath, 'utf8'));
        
        let plans = [];
        for (let plan of list) {
            if (plan.enable) {
                plans.push(plan);
            }
        }

        return plans;
    }

    /**
     * Caso nenhum plano seja localizado, cria e retorna um modelo de plano
     */
    private getSample() {
        return [{
            id: '89c24f87-2ebb-4932-b4c6-abc9bf251f27',
            name: 'Backup Diário',
            enable: false,
            schedule: {
                frequency: 'daily',
                hour: '23:00'
            },
            sources: [
                {
                    path: 'C:/folder/to/backup',
                    search: '*.*',
                    storagepath: 'dicom',
                    type: 'diff',
                    compression: {
                        dicom: 'lossless',
                        quality: 90
                    }
                }
            ]
        }];
    }


    /**
     * Abre plans.json no editor de json
     */
    public editPlans() {
        utils.cmdExec(`${utils.getDataPath()}/resources/editor/jsonedit.exe ${utils.getDataPath()}/plans/plans.json`);
    }

}

export default new PlanService();
