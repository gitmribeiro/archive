/**
 * Abstracao para armazenamento em nuvem para diferentes provedores.
 */
export interface IStorage {

    checkCredentials(): void;
    listAllFiles(folder?: string): any;
    sync(): void;

}
