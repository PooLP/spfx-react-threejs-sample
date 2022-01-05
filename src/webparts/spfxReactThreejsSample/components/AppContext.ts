// React
import { createContext, useContext } from 'react';

// SPFx
import { WebPartContext } from '@microsoft/sp-webpart-base';

// Fluent UI
import { ITheme } from 'office-ui-fabric-react/lib/Styling';

export interface IAppContextProps {
  context: WebPartContext;
  theme: ITheme;
}

export const AppContext = createContext<IAppContextProps>(undefined);

export const getContentPackManagerState = () => useContext(AppContext);
