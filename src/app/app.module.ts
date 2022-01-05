import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {VisualPipeComponent} from './components/visual-pipe/visual-pipe.component';
import {VisualTreeComponent} from './components/visual-tree/visual-tree.component';

@NgModule({
  declarations: [
    AppComponent,
    VisualPipeComponent,
    VisualTreeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
