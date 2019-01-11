import * as fs from 'fs';
import * as path from 'path';

import logger from './logger.service';
import utils from './utils.service';


/**
 * Classe responsável por regras de negócio do drive
 */
class DriveService {

    private scanPath: string;

    constructor() {
        this.load();
    }


    private async load() {
        this.scanPath = utils.getDrivePath();
        await utils.mkdirRecursiveSync(this.scanPath);
    }

    public async scan() {
        // logger.info('Drive!');
    }

}

export default new DriveService();
