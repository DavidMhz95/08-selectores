import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { Observable, of, tap, map, combineLatest } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CountriesService {


  private baseUrl: string = "https://restcountries.com/v3.1"

  private _regions: Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania];
  constructor(private httpClient: HttpClient) { }

  get regions(): Region[] {
    return [...this._regions];
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);
    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`

    //Hay que cambiar a smallCountry de verdad, ya que el name no es un string.
    return this.httpClient.get<Country[]>(url).pipe(
      map(countries => countries.map(country => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? []
      })))
    )
  }

  getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=name,borders`
    return this.httpClient.get<Country>(url).pipe(
      map(country => ({
        name: country.name.common,
        cca3: alphaCode,
        borders: country.borders ?? []
      }))
    );
  }


  getCountryBorderByCodes(alphaCodes: string[]): Observable<SmallCountry[]> {
    if (!alphaCodes || alphaCodes.length === 0) return of([]);

    const requests: Observable<SmallCountry>[] = []
    alphaCodes.forEach(alphaCode => {
      requests.push(this.getCountryByAlphaCode(alphaCode))
    })

    return combineLatest(requests);
  }



}
