// SPFx
import { Guid, ServiceKey, ServiceScope } from '@microsoft/sp-core-library';
import { PageContext } from '@microsoft/sp-page-context';
import { MSGraphClientFactory, MSGraphClientV3 } from '@microsoft/sp-http';
import { DriveItem } from '@microsoft/microsoft-graph-types';

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
    private _msGraphClient: MSGraphClientV3;
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
        this._msGraphClient = await this._msGraphClientFactory.getClient('3');
        this._msGraphVersion = 'beta';
    }

    /**
     * get file from Shared document
     * @param file 
     * @returns 
     */
    public async getFilefromSpLibrary(siteId: Guid): Promise<IResponsePayload<DriveItem[]>> {
        try {
            if (siteId) {
                const query = this._msGraphClient.api(`/sites/${siteId}/drive/root/children`).version(this._msGraphVersion);

                const callback = (error: Error, _response: { value: DriveItem[] }, rawResponse?: Response) => {
                    if (error) {
                        return ({ success: false, statusText: error.message, data: null });
                    } else {
                        return ({ success: true, statusText: rawResponse.statusText, data: _response.value });
                    }
                };
                await query.get(callback);
            } else {
                return ({ success: false, statusText: 'siteId is empty', data: null });
            }
        } catch (e) {
            if (DEBUG) console.error(e);
            return ({ success: false, statusText: e.message, data: null });
        }

    }

    /**
     * Upload file to Shared document
     * @param file 
     * @returns 
     */
    public async uploadFileToSpLibrary(siteId: Guid, file: File): Promise<IResponsePayload<DriveItem>> {
        try {
            if (file.size < (4 * 1024 * 1024)) {
                if (siteId && file) {
                    const query = this._msGraphClient.api(`/sites/${siteId}/drive/root:/cnpShortcuts/${file.name}:/content`).version(this._msGraphVersion);

                    const callback = (error: Error, _response: DriveItem, rawResponse?: Response) => {
                        if (error) {
                            return ({ success: false, statusText: error.message, data: null });
                        } else {
                            return ({ success: true, statusText: rawResponse.statusText, data: _response });
                        }
                    };
                    await query.put(file, callback);
                }
            } else {
                // File.size>4MB, refer to https://mmsharepoint.wordpress.com/2020/01/12/an-outlook-add-in-with-sharepoint-framework-spfx-storing-mail-with-microsoftgraph/
                return ({ success: false, statusText: 'Size exceed 4mb', data: null });
            }
        } catch (e) {
            return ({ success: false, statusText: e.message, data: null });
        }
    }
}
