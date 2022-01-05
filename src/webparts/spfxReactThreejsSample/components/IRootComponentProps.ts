import { WebPartContext } from '@microsoft/sp-webpart-base';
import { ITheme } from 'office-ui-fabric-react/lib/Styling';

export interface IRootComponentProps {
  // global
  context: WebPartContext;
  theme: ITheme;  
}
