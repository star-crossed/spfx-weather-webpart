import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './Weather.module.scss';
import * as strings from 'weatherStrings';
import { IWeatherWebPartProps } from './IWeatherWebPartProps';

import * as $ from 'jquery';
require('simpleWeather');

export default class WeatherWebPart extends BaseClientSideWebPart<IWeatherWebPartProps> {
  private container: JQuery;

  public render(): void {
    if (this.renderedOnce === false) {
      this.domElement.innerHTML = `<div class="${styles.weather}"></div>`;
    }

    this.renderContents();
  }

  private renderContents(): void {
    this.container = $(`.${styles.weather}`, this.domElement);

    const location: string = escape(this.properties.location);

    if (!location || location.length === 0) {
      this.container.html('<p>Please specify a location</p>');
      return;
    }

    const webPart: WeatherWebPart = this;

    ($ as any).simpleWeather({
      location: location,
      woeid: '',
      unit: 'f',
      success: (weather: any): void => {
        const html: string =
          `<h2><i class="icon${weather.code}"></i> ${weather.temp}&deg;${weather.units.temp}</h2>
           <ul><li>${weather.city} ${weather.region}</li></ul>`;
        webPart.container.html(html)
          .removeAttr('style');
      },
      error: (error: any): void => {
        webPart.container.html(`<p>${error.message}</p>`).removeAttr('style');
      }
    });
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
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
              groupName: strings.DataGroupName,
              groupFields: [
                PropertyPaneTextField('location', {
                  label: strings.LocationFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }
}
