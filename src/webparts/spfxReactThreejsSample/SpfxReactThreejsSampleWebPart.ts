// React
import * as React from 'react';
import * as ReactDom from 'react-dom';

// SPFx
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { ThemeProvider, ThemeChangedEventArgs, IReadonlyTheme } from '@microsoft/sp-component-base';
import {
  IPropertyPaneConfiguration,
} from '@microsoft/sp-property-pane';

// Localization
import * as strings from 'SpfxReactThreejsSampleWebPartStrings';

// Fluent UI
import { createTheme, ITheme } from 'office-ui-fabric-react/lib/Styling';

// Component
import { RootComponent } from './components/RootComponent';

// Interface
import { ISpfxReactThreejsSampleWebPartProps } from './ISpfxReactThreejsSampleWebPartProps';
import { isEqual } from '@microsoft/sp-lodash-subset';
import { IRootComponentProps } from './components/IRootComponentProps';

export default class SpfxReactThreejsSampleWebPart extends BaseClientSideWebPart<ISpfxReactThreejsSampleWebPartProps> {

  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme;
  private _theme: ITheme;

  protected async onInit(): Promise<void> {
    await super.onInit();

    // theme
    this._initThemeVariant();
  }

  public render(): void {
    const element: React.ReactElement<IRootComponentProps> = React.createElement(
      RootComponent,
      {
        context: this.context,
        theme: this._theme
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

  /**
  * Initializes theme variant properties
  */
  private _initThemeVariant(): void {

    // Consume the new ThemeProvider service
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);

    // If it exists, get the theme variant
    this._themeVariant = this._themeProvider.tryGetTheme();

    if (!this._themeVariant) {
      const ThemeColorsFromWindow: any = (window as any).__themeState__.theme;
      const siteTheme: ITheme = createTheme({
        palette: ThemeColorsFromWindow,
        semanticColors: ThemeColorsFromWindow
      });
      this._themeVariant = siteTheme as IReadonlyTheme;
    }

    // Register a handler to be notified if the theme variant changes
    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);
  }

  /**
   * Update the current theme variant reference and re-render.
   * @param args The new theme
   */
  private _handleThemeChangedEvent = (args: ThemeChangedEventArgs): void => {
    if (!isEqual(this._themeVariant, args.theme)) {
      this._themeVariant = args.theme;
      this.render();
    }
  }

}
