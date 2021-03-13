import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

// Used for property pane
import {
  IPropertyPaneConfiguration,
} from '@microsoft/sp-property-pane';

import * as strings from 'SpfxReactThreejsSampleWebPartStrings';

import { RootComponent } from './components/RootComponent';
import { ISpfxReactThreejsSampleWebPartProps } from './ISpfxReactThreejsSampleWebPartProps';

export default class SpfxReactThreejsSampleWebPart extends BaseClientSideWebPart<ISpfxReactThreejsSampleWebPartProps> {

  protected async onInit(): Promise<void> {
    await super.onInit();
  }

  public render(): void {
    const element: React.ReactElement<{}> = React.createElement(
      RootComponent,
      {
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
              ]
            }
          ]
        }
      ]
    };
  }
}
