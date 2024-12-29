import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit{
  isLoading = false; // Default is not loading
  constructor(private loaderService: LoaderService) {}
  ngOnInit(): void {
    this.loaderService.loaderState$.subscribe((state: boolean) => {
      this.isLoading = state;
      console.log("loader----", this.isLoading);
    });
  }
}
