// SPFx
import { Guid, ServiceKey, ServiceScope } from '@microsoft/sp-core-library';
import { PageContext } from '@microsoft/sp-page-context';
import { MSGraphClientFactory, MSGraphClient } from '@microsoft/sp-http';
import { DriveItem } from '@microsoft/microsoft-graph-types';
import { GraphError } from '@microsoft/microsoft-graph-client';

// Models
import { IResponsePayload } from '@models/IResponse';

// Interface
export interface IGraphLibraryService {
    init(): Promise<void>;
    getFilefromSpLibrary(siteId: Guid): Promise<IResponsePayload<DriveItem[]>>;
    uploadFileToSpLibrary(siteId: Guid, file: File): Promise<IResponsePayload<DriveItem>>;
}

// Class
const EXP_SOURCE = 'spfx-react-threejs-sample::GraphLibraryService';

export default class GraphLibraryService implements IGraphLibraryService {

    public static readonly serviceKey: ServiceKey<IGraphLibraryService> = ServiceKey.create<IGraphLibraryService>(EXP_SOURCE, GraphLibraryService);

    private _pageContext: PageContext;
    private _msGraphClientFactory: MSGraphClientFactory;
    private _msGraphClient: MSGraphClient;
    private _msGraphVersion: string;

    constructor(serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this._pageContext = serviceScope.consume(PageContext.serviceKey);
            this._msGraphClientFactory = serviceScope.consume(MSGraphClientFactory.serviceKey);
        });
    }

    /**
     * Init
     */
    public async init(): Promise<void> {
        this._msGraphClient = await this._msGraphClientFactory.getClient();
        this._msGraphVersion = 'beta';
    }

    /**
     * get file from Shared document
     * @param file 
     * @returns 
     */
    public async getFilefromSpLibrary(siteId: Guid): Promise<IResponsePayload<DriveItem[]>> {
        const response = new Promise<IResponsePayload<DriveItem[]>>(async (resolve, reject) => {
            try {
                if (siteId) {
                    const query = this._msGraphClient.api(`/sites/${siteId}/drive/root/children`).version(this._msGraphVersion);

                    const callback = (error: GraphError, _response: { value: DriveItem[] }, rawResponse?: Response) => {
                        if (error) {
                            reject({ success: false, statusText: error.message, data: null });
                        } else {
                            resolve({ success: true, statusText: rawResponse.statusText, data: _response.value });
                        }
                    };
                    await query.get(callback);
                } else {
                    reject({ success: false, statusText: 'siteId is empty', data: null });
                }
            } catch (e) {
                if (DEBUG) console.error(e);
                reject({ success: false, statusText: e.message, data: null });
            }
        });
        return response;
    }

    /**
     * Upload file to Shared document
     * @param file 
     * @returns 
     */
    public async uploadFileToSpLibrary(siteId: Guid, file: File): Promise<IResponsePayload<DriveItem>> {
        const response = new Promise<IResponsePayload<DriveItem>>(async (resolve, reject) => {
            try {
                if (file.size < (4 * 1024 * 1024)) {
                    if (siteId && file) {
                        const query = this._msGraphClient.api(`/sites/${siteId}/drive/root:/cnpShortcuts/${file.name}:/content`).version(this._msGraphVersion);

                        const callback = (error: GraphError, _response: DriveItem, rawResponse?: Response) => {
                            if (error) {
                                reject({ success: false, statusText: error.message, data: null });
                            } else {
                                resolve({ success: true, statusText: rawResponse.statusText, data: _response });
                            }
                        };
                        await query.put(file, callback);
                    }
                } else {
                    // File.size>4MB, refer to https://mmsharepoint.wordpress.com/2020/01/12/an-outlook-add-in-with-sharepoint-framework-spfx-storing-mail-with-microsoftgraph/
                    reject({ success: false, statusText: 'Size exceed 4mb', data: null });
                }
            } catch (e) {
                reject({ success: false, statusText: e.message, data: null });
            }
        });
        return response;
    }
}
