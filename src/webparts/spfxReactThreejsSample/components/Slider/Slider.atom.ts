// Store
import { atom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import { WebPartContext } from '@microsoft/sp-webpart-base';

// Fluent UI
import { ITheme } from 'office-ui-fabric-react/lib/Styling';

// Services
import { IGraphLibraryService } from '@services/GraphLibrary.service';

// Global
export const spContextAtom = atom<WebPartContext>(null);
export const themeAtom = atomWithDefault<ITheme>(() => null);

// Service
export const graphLibraryServiceInstanceAtom = atom<IGraphLibraryService>(null);

// Events
export const clickedAtom = atomWithDefault<number>(() => null);

// Images library
export const imagesLibraryAtom = atom<string[]>([]);
export const isLoadingimagesLibraryAtom = atom<boolean>(false);
export const fetchImagesLibraryAtom = atom<string[], number>(
    get => get(imagesLibraryAtom),
    async (_get, _set, num) => {
        try {
            _set(isLoadingimagesLibraryAtom, true);
            const siteId = _get(spContextAtom)?.pageContext.site.id;
            const libraryResponse = await _get(graphLibraryServiceInstanceAtom)?.getFilefromSpLibrary(siteId);
            if (libraryResponse) {
                const images = libraryResponse.data.filter(data => data.webUrl.search('.jpg') >= 0).map(image => image.webUrl);
                _set(imagesLibraryAtom, images);
                _set(isLoadingimagesLibraryAtom, false);
            }

        } catch (e) {
            if (DEBUG) console.error(e);
        }
    }
);