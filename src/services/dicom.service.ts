import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment';
import { execSync } from 'child_process';
import * as dicomParser from 'dicom-parser';

import logger from './logger.service';
import utils from './utils.service';

class DicomService {

    constructor() {}

    public isDicomFile(file: string) {
        let contentFile = fs.readFileSync(file, 'utf8').toString();
        if (path.extname(file) === '.dcm' || (contentFile.length > 132 && contentFile.substring(128, 132) === 'DICM')) {
            return true;
        }
        return false;
    }

    private async getLib(cmd: string) {
        let lib: string;

        let cmdPartials = cmd.split(' ');
        cmd = cmdPartials.length > 0 ? cmdPartials[0] : '';

        fs.readdirSync(path.join(utils.getDataPath(), '/resources/vendors/dcmtk/bin')).forEach((fileName) => {
            if(cmd === fileName.split('.')[0]) {
                lib = 'dcmtk';
            }
        });

        if (!lib) {
            fs.readdirSync(path.join(utils.getDataPath(), '/resources/vendors/gdcm/bin')).forEach((fileName) => {
                if(cmd === fileName.split('.')[0]) {
                    lib = 'gdcm';
                }
            });
        }

        return lib;
    }

    public execute(cmd: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const LIB = await this.getLib(cmd);
                
                let output = execSync(path.normalize(`${utils.getDataPath()}/resources/vendors/${LIB}/bin/${cmd} `), { encoding: 'latin1' });

                return resolve(output);
            } catch (err) {
                return reject(err.toString());
            }
        });
    }

    /**
     * Depreciado: problema na lib dcmtk ao executar dcm2json (ele gera json quebrado com caracteres invalidos)
     * @param filename 
     */
    public parse(filename: string) {
        return new Promise(async (resolve, reject) => {
            try {

                // cria pasta temporaria para os arquivos json das tags dicom
                await utils.mkdirRecursiveSync(`${utils.getDataPath()}/resources/tags`);

                // define arquivo temporario de extracao das tags
                let jsonTempFile: any = path.normalize(`${utils.getDataPath()}/resources/tags/${moment().valueOf()}.json`);

                // executa dcmdump para obter as tags
                let output = await this.execute(`dcm2json +m -fc ${filename} ${jsonTempFile}`);

                if (output) throw output;

                if (fs.existsSync(`${jsonTempFile}`)) {
                    
                    let jsonFile = fs.readFileSync(`${jsonTempFile}`).toString();

                    // FIX: dcm2json gera arrays de valores com sinais, tornando json invalido (esses sinais sao removidos)
                    jsonFile = jsonFile.replace(/\[, /g, '[');
                    jsonFile = jsonFile.replace(/\[,/g, '[');
                    jsonFile = jsonFile.replace(/,,/g, ', ');
                    jsonFile = jsonFile.replace(/, , /g, ', ');
                    jsonFile = jsonFile.replace(/, -,/g, ', ');
                    jsonFile = jsonFile.replace(/,-,/g, ', ');
                    jsonFile = jsonFile.replace(/,  /g, ', ');
                    jsonFile = jsonFile.replace(/,0/g, ', ');
                    jsonFile = jsonFile.replace(/, 0/g, ', ');
                    jsonFile = jsonFile.replace(/, 00/g, ', ');
                    jsonFile = jsonFile.replace(/, 000/g, ', ');
                    jsonFile = jsonFile.replace(/-, /g, '');
                    jsonFile = jsonFile.replace(/, ]/g, ']');
                    jsonFile = jsonFile.replace(/\+ /g, '');
                    jsonFile = jsonFile.replace(/\+/g, '');
                    jsonFile = jsonFile.replace(/+/g, '');
                    
                    let tags: any;
                    try {
                        tags = JSON.parse( jsonFile );
                    } catch (error) {
                        logger.error(error);
                    }

                    // obtem tags e remove arquivo json gerado por dcm2json
                    await fs.unlinkSync(jsonTempFile);

                    return resolve(tags);
                }

                throw 'Ocorreu um erro inesperado no processo de parse.';
            } catch (err) {
                logger.error(err);
                return reject(err);
            }
        });
    }


    public async getTagsFromFile(filename: string) {
        return new Promise((resolve, reject) => {
            const dicomFileAsBuffer = fs.readFileSync(filename);
            const dataSet = dicomParser.parseDicom(dicomFileAsBuffer);
            return resolve(dataSet);
        });
    }

    public async compressFile(srcFile: string, destFile: string, type?: string, quality?: number) {
        return new Promise(async (resolve, reject) => {
            try {

                if (!srcFile || !destFile) {
                    throw Error('O parâmetro destFile não foi informado!');
                }

                if (srcFile === destFile) {
                    throw Error('Atencao: O nome do arquivo de destino deve ser diferente do nome do arquivo de origem!');
                }


                srcFile = path.normalize(srcFile);

                // obtem dados do arquivo de origem
                let stats = fs.statSync(srcFile);

                let fileDetail = { 
                    success      : false,
                    startTime    : moment().valueOf(),
                    endTime      : moment().valueOf(),
                    srcDev       : stats.dev,
                    srcOid       : stats.ino,
                    srcFile      : srcFile,
                    srcSize      : (stats.size / 1000),
                    tempFile     : destFile,
                    outSize      : 0,
                    compression  : {
                        dicom: (type || 'LOSSY').toUpperCase(),
                        quality: quality || 90,
                        compressed : false,
                    }
                };

                // obtem tags dicom
                const dataSet: any = await this.getTagsFromFile(srcFile);

                // registra saida do console
                let output: any;

                if (fileDetail.compression.dicom === 'LOSSLESS' || fileDetail.compression.dicom === 'LOSSY') {

                    if (fileDetail.compression.dicom === 'LOSSLESS') {
                        fileDetail.compression.compressed = true;

                        // se o arquivo ja e um lossless ignora compressao
                        if((dataSet.string('x00082111') && dataSet.string('x00082111')) && !dataSet.string('x00082111').toLowerCase().startsWith('lossless') && !dataSet.string('x00082111').toLowerCase().startsWith('lossy')) {
                            
                            // dcmtk - compressao lossless
                            console.log(`dcmcjpeg -v ${srcFile} ${fileDetail.tempFile}`);
                            output = await this.execute(`dcmcjpeg -v ${srcFile} ${fileDetail.tempFile}`);
                        } else {
                            
                            // sendo lossless apenas obtem os detalhes do arquivo e copia (srcFile)
                            await fs.copyFileSync(fileDetail.srcFile, fileDetail.tempFile);
                        }
                    }

                    if (fileDetail.compression.dicom === 'LOSSY') {

                        fileDetail.compression.compressed = true;

                        // obtem tag de bits alocados
                        let bitsAllocatedElement = dataSet.elements.x00280100;
                        
                        // extrai bits alocados do arquivo dicom
                        let bitsAllocated: any = new Uint8Array(dataSet.byteArray.buffer, bitsAllocatedElement.dataOffset, bitsAllocatedElement.length) || [8, 0];
                        if (bitsAllocated.length > 0) {
                            bitsAllocated = bitsAllocated[0];
                        }
                        
                        // acima de 8 = lossy 16bits | senao lossy 8bits
                        if (bitsAllocated > 8) {
                            
                            // dcmtk - compressao lossy
                            output = await this.execute(`dcmcjpeg -v +ee +q ${fileDetail.compression.quality} ${srcFile} ${fileDetail.tempFile}`);
                        } else {
        
                            // dcmtk - compressao lossy
                            output = await this.execute(`dcmcjpeg -v +eb +q ${fileDetail.compression.quality} ${srcFile} ${fileDetail.tempFile}`);
                        }
                    }

                    // converte saida do console em array para validar o sucesso da operacao
                    if (output) {
                        output = output.toString().split(/(?:\r\n|\r|\n)/g);
                    }
                    
                    if (fileDetail.compression.compressed || (output & (output[0].startsWith('You have selected a lossy compression transfer syntax') || output[4].endsWith('conversion successful') || output[5].endsWith('conversion successful')))) {
                        stats = fs.statSync(fileDetail.tempFile);
                        
                        fileDetail.srcDev  = stats.dev,
                        fileDetail.srcOid  = stats.ino,
                        fileDetail.outSize = stats.size;
                        fileDetail.endTime = new Date().getTime();
                        fileDetail.success = true;

                        return resolve(fileDetail);
                    }
                }

                throw Error('Command or options not supported!');
            } catch (err) {
                return reject(err);
            }
        });
    }

}

export default new DicomService();
