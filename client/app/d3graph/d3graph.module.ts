import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {D3graphService} from './service/d3graph.service';
import {D3graphComponent} from './components/d3graph.component';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [
    // Shared Modules
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    D3graphComponent
  ],
  declarations: [
    D3graphComponent
  ],
  providers: [
    D3graphService
  ]
})
export class D3graphModule { }
