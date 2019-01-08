import logger from '../../services/logger.service';
import planService from '../../services/plan.service';
import snapshotService from '../../services/snapshot.service';


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

        // TODO: implementar cron para agendar os planos!

        const plans = await planService.getAll();

        if (plans && plans.length > 0) {
            await this.execute(plans[0]);
        }

        logger.debug('[OK] Todos os planos foram agendados com sucesso.');
    }


    /**
     * Executa snapshot gerando arquivo .snap que será lido poroutro processo separado
     * @param plan objeto representando um plano
     */
    private async execute(plan: any) {
        try {

            if (!plan) {
                throw Error('[X] Nenhum plano ativo foi localizado para ser executado.');
            }
            
            await snapshotService.execute(plan);

        } catch (err) {
            logger.error(err.message);
        }
    }

}

export default new Plan();
