import logger from '../../services/logger.service';
import planService from '../../services/plan.service';
import snapshotService from '../../services/snapshot.service';


/**
 * Classe responsável pelo snapshot e geração dos metadados dos arquivos
 */
class Plan {

    private plan: any;

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

        logger.debug('Todos os planos foram agendados!');
    }


    /**
     * Executa snapshot gerando arquivo .snap que será lido poroutro processo separado
     * @param plan objeto representando um plano
     */
    private async execute(plan: any) {
        try {

            if (!plan) {
                throw Error('Nenhum plano ativo foi passado para ser executado!');
            }
            
            this.plan = plan;

            await snapshotService.execute(this.plan);
            
        } catch (err) {
            logger.error(err.message);
        }
    }

}

export default new Plan();
