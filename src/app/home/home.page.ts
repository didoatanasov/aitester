import { ImagerecognitionService } from './../services/imagerecognition.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PictureSourceType } from '@ionic-native/camera/ngx';
import { ActionSheetController, ToastController, Platform, LoadingController, NavController } from '@ionic/angular';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path/ngx';
import { timeout } from 'rxjs/operators';
import { retryWhen } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
import { Router, NavigationExtras } from '@angular/router';

const STORAGE_KEY = 'ai_images';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  images = [];
  models: { id: string, name: string, url: string }[] = [
    {
      id: '1',
      name: 'Doc Regions Model',
      url: 'http://192.168.62.246:6001/inference'
    },
    {
      id: '2',
      name: 'Doc Checked Elements Model',
      url: 'http://192.168.62.246:6002/inference'
    },
    {
      id: '3',
      name: 'Doc Regions Aug Model',
      url: 'http://192.168.62.246:6003/inference'
    },
    {
      id: '4',
      name: '101 Object Categories Model',
      url: 'http://192.168.62.246:6004/inference'
    },
  ];

  selectModel: { id: string, name: string, url: string } = null;
  constructor(private camera: Camera, private file: File, private http: HttpClient,
    private webview: WebView, private router: Router,
    private actionSheetController: ActionSheetController, private toastController: ToastController, private platform: Platform,
    private storage: Storage, private plt: Platform, private loadingController: LoadingController,
    private ref: ChangeDetectorRef, private filePath: FilePath, private imageService: ImagerecognitionService) { }

  ngOnInit() {
    this.plt.ready().then(() => {
      this.loadStoredImages();
    });
    if (this.checkConnection()) {
      // this.presentToast('ONLINE');
    } else {
      this.presentToast('Please connect to IBS VPN first!', 4000);

    }
  }
  loadStoredImages() {
    this.storage.get(STORAGE_KEY).then(images => {
      if (images) {
        const arr = JSON.parse(images);
        this.images = [];
        for (const img of arr) {
          const filePath = this.file.dataDirectory + img;
          const resPath = this.pathForImage(filePath);
          // tslint:disable-next-line:object-literal-shorthand
          this.images.push({ name: img, path: resPath, filePath: filePath });
        }
      }
    });
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      const converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  async presentToast(text, time = 3000) {
    const toast = await this.toastController.create({
      message: text,
      position: 'bottom',
      duration: time
    });
    toast.present();
  }




  async selectImage() {
    if (this.selectModel != null) {
      const actionSheet = await this.actionSheetController.create({
        header: 'Select Image source',
        buttons: [{
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
        ]
      });
      await actionSheet.present();
    } else {
      this.presentToast('Please, choose AI model first', 5000);

    }
  }

  takePicture(sourceType: PictureSourceType) {
    const options: CameraOptions = {
      quality: 100,
      // tslint:disable-next-line:object-literal-shorthand
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(imagePath => {
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            const correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            const currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        const correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    });

  }
  createFileName() {
    const d = new Date(),
      n = d.getTime(),
      newFileName = n + '.jpg';
    return newFileName;
  }

  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
    }, error => {
      this.presentToast('Error while storing file.');
    });
  }

  updateStoredImages(name) {
    this.storage.get(STORAGE_KEY).then(images => {
      const arr = JSON.parse(images);
      if (!arr) {
        const newImages = [name];
        this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      } else {
        arr.push(name);
        this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      }

      const filePath = this.file.dataDirectory + name;
      const resPath = this.pathForImage(filePath);

      const newEntry = {
        name,
        path: resPath,
        filePath
      };

      this.images = [newEntry, ...this.images];
      this.ref.detectChanges(); // trigger change detection cycle
    });
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);

    this.storage.get(STORAGE_KEY).then(images => {
      const arr = JSON.parse(images);
      const filtered = arr.filter(name => name !== imgEntry.name);
      this.storage.set(STORAGE_KEY, JSON.stringify(filtered));

      const correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);

      this.file.removeFile(correctPath, imgEntry.name).then(res => {
        this.presentToast('File removed.');
      });
    });
  }

  async checkConnection() {

    const networkPresent = await this.http.get('http://192.168.62.246:8081').pipe(
      timeout(2000)).subscribe(() => true,
        error => false);
    return networkPresent;
  }


  startUpload(imgEntry) {
    if (this.checkConnection()) {
      if (this.selectModel != null) {

        this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
          .then(entry => {
            (entry as FileEntry).file(file => this.readFile(file));
          })
          .catch(err => {
            this.presentToast('Error while reading file.');
          });
      } else {
        this.presentToast('Please, select model first!', 5000);
      }
    } else {
      this.presentToast('Please connect to IBS VPN first!!!');
    }
  }

  readFile(file: any) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });
      formData.append('files', imgBlob, file.name);
      formData.append('containHeatMap', 'true');
      formData.append('containRle', 'true');
      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {

    const loading = await this.loadingController.create({
      spinner: 'bubbles',
      message: 'Analyzing image...'
    });
    await loading.present();


    this.http.post(this.selectModel.url, formData)
      .pipe(
        finalize(() => {
          loading.dismiss();
        }),
        timeout(10000)
      )
      .subscribe(res => {
        console.log(res);
        if (res) {
          this.gotoResult(res);
          // const resString = JSON.stringify(res);
          // this.presentToast(resString, 10000);
        } else {
          this.presentToast('File upload failed.');
        }
      },
        error => {
          loading.dismiss();
          this.presentToast('Operation failed. Please check VPN connection');

        });
  }

  gotoResult(result: any) {
    const navigationExtras: NavigationExtras = {
      state: {
        data: result,
        modelId: this.selectModel.id
      }
    };
    this.router.navigate(['/result'], navigationExtras);
  }

}



