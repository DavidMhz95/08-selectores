import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, Observable, switchMap, tap } from 'rxjs';

@Component({
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit {

  public myForm: FormGroup
  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry [] = [];

  constructor(private fb: FormBuilder, private countriesService: CountriesService) {
    this.myForm = this.fb.group({
      region: ['', Validators.required],
      country: ['', Validators.required],
      border: ['', Validators.required]
    })

  }

  ngOnInit(): void {
    this.onRegionChange();
    this.onCountryChange();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChange(): void {
    this.myForm.get('region')?.valueChanges
    .pipe(
      tap(() => this.myForm.get('country')?.reset('')),
      tap(() =>this.borders = []),
      //El switchMap coge el resultado anterior y con el se suscribe al nuevo observable
      switchMap(region => this.countriesService.getCountriesByRegion(region))
    )
    .subscribe(countries => {
      this.countriesByRegion = countries;
    })

  }

  onCountryChange(): void {
    this.myForm.get('country')?.valueChanges
    .pipe(
      tap(() => this.myForm.get('border')?.reset('')),
      filter(alpha => alpha !== ''),
      switchMap(alpha => this.countriesService.getCountryByAlphaCode(alpha)),
      switchMap(country => this.countriesService.getCountryBorderByCodes(country.borders))
    )
    .subscribe(countries => {
      this.borders = countries;
    })
  }


}
