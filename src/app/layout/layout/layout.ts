import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "../header/header";
import { SidebarComponent } from "../sidebar/sidebar";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
  imports: [RouterOutlet, HeaderComponent, SidebarComponent]
})
export class LayoutComponent {}