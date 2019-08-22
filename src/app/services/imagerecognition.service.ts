import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImagerecognitionService {
  url = 'https://192.168.62.246/powerai-vision/api/dlapis/';
  deployedModelId = '8af19aa4-2e78-4d81-b858-082369749f42';


  constructor(private http: HttpClient) { }

  checkImage(image: string) {
    const formData: FormData = new FormData();
    formData.append('files', image);
    this.http.post(this.url + this.deployedModelId, formData, {
      headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data' })
    }).subscribe(data => {
      console.log(data);
    }, error => {
      console.log(error);

    });
  }
}
