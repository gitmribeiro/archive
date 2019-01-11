import * as fs from 'fs';
import * as path from 'path';

import logger from './logger.service';
import utils from './utils.service';


/**
 * Responsável por configurar todo o ambiente de execução do serviço
 */
class ConfigService {

    private CFG: any;
    private configFile: string;

    constructor() {
        this.configFile = `${utils.getRootPath()}/data/config.json`;
    }


    /**
     * Carrega configurações do serviço
     */
    public async load() {
        try {
            if (fs.existsSync(this.configFile)) {
                this.CFG = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
            } else {
                await this.create();
            }
    
            utils.CFG(this.CFG);

            return this.CFG;
        } catch (err) {
            logger.error('Não foi possível criar a configuração padrão! Error: ' + err.message);
        }
    }


    /**
     * Cria configuração padrão
     */
    public async create() {
        try {
            this.CFG = {
                module: {
                    name: 'wttarchive',
                    description: 'WTT - Backup Server',
                    version: '1.0.0'
                },
                service: {
                    port: 3000,
                    networkid: 'demo',
                    log: 'warn',
                },
                drive: {
                    maxFreeSpace: 60,
                    scheduleTime: '18:00-06:00'
                },
                provider: {
                    s3: {
                        credential: utils.encrypt(utils.fromB64('QUtJQUpZUk5JV01CNEo3T1BZMkE6VVRoNlRFaXQxTVpwNWw5THBvVU1RTkNDUTBlWXZoLzUrdGROQThEQw==')),
                        region: 'sa-east-1'
                    }
                }
            };
    
            await utils.mkdirRecursiveSync(path.dirname(this.configFile));
    
            fs.writeFileSync(this.configFile, JSON.stringify(this.CFG, null, 4), 'utf8');

            await this.getResources();
        } catch (err) {
            logger.error('Não foi possível criar a configuração padrão! Error: ' + err.message);
        }
    }


    /**
     * Extrai os recursos necessarios para preparar o ambiente
     */
    private async getResources() {
        try {
            if (!fs.existsSync(`${utils.getDataPath()}/resources`)) {

                const files = fs.readdirSync(utils.getResourcePath());
    
                for (let file of files) {
                    await utils.copyDirRecursiveSync(path.join(utils.getResourcePath(), file), `${utils.getDataPath()}/resources/${file}`);
                }
            }
            
            // aguarda desbloqueio do SO
            await utils.sleep(1000);
        } catch (err) {
            logger.error('Não foi possível preparar o ambiente! Error: ' + err.message);
        }
    }


    /**
     * Abre config.json no editor de json
     */
    public editConfig() {
        utils.cmdExec(`${utils.getDataPath()}/resources/editor/jsonedit.exe ${utils.getDataPath()}/config.json`);
    }

}

export default new ConfigService();
