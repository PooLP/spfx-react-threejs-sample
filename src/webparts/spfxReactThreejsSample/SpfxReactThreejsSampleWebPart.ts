// React
import * as React from 'react';
import * as ReactDom from 'react-dom';

// SPFx
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { ThemeProvider, ThemeChangedEventArgs, IReadonlyTheme } from '@microsoft/sp-component-base';
import {
  IPropertyPaneConfiguration,
} from '@microsoft/sp-property-pane';
import { isEqual } from '@microsoft/sp-lodash-subset';

// Localization
import * as strings from 'SpfxReactThreejsSampleWebPartStrings';

// Fluent UI
import { createTheme, ITheme } from 'office-ui-fabric-react/lib/Styling';

// Component
import { Slider } from './components/Slider/Slider';

// Interface
import { ISpfxReactThreejsSampleWebPartProps } from './ISpfxReactThreejsSampleWebPartProps';
import { ISliderProps } from './components/Slider/ISliderProps';

// store
import { Provider } from 'jotai';
import { graphLibraryServiceInstanceAtom, spContextAtom, themeAtom } from './components/Slider/Slider.atom';

// Services
import GraphLibraryService, { IGraphLibraryService } from '@services/GraphLibrary.service';

export default class SpfxReactThreejsSampleWebPart extends BaseClientSideWebPart<ISpfxReactThreejsSampleWebPartProps> {

  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme;
  private _theme: ITheme;

  private _graphLibraryServiceInstance: IGraphLibraryService;

  protected async onInit(): Promise<void> {
    await super.onInit();

    // theme
    this._initThemeVariant();

    // Services
    this._graphLibraryServiceInstance = this.context.serviceScope.consume(GraphLibraryService.serviceKey);
    await this._graphLibraryServiceInstance.init();

    return Promise.resolve();
  }

  public render(): void {

    this._theme = this._themeVariant as ITheme;

    const element: React.ReactElement<ISliderProps> = React.createElement(Slider, {
      theme: this._theme
    });

    const jotaiProvider = React.createElement(
      Provider,
      {
        initialValues: [
          [spContextAtom, this.context],
          [graphLibraryServiceInstanceAtom, this._graphLibraryServiceInstance]
        ]
      }, element);

    ReactDom.render(jotaiProvider, this.domElement);
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
