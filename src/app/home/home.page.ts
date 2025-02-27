import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonRow, IonCol
  , IonButtons, IonMenuButton, IonMenuToggle, IonText, IonFabButton, IonFabList, IonFab
} from '@ionic/angular/standalone';
import { fabric } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
//import * as fromFabric from 'fabric-with-gestures';
import { addIcons } from 'ionicons';
import { logoIonic, checkboxOutline, createOutline, resizeOutline, trashOutline, textOutline, ellipseOutline, squareOutline, removeOutline, cloudDownloadOutline, cloudUploadOutline, bookmarkOutline } from 'ionicons/icons';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle,
    IonContent, IonButton, IonIcon,
    IonRow, IonCol, IonButtons, IonMenuButton, IonMenuToggle, IonText, IonFabButton, IonFabList, IonFab],
})
export class HomePage {
  canvas: any;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  output: string[] = [];

  pausePanning = false;
  zoomStartScale = 0;
  currentX: any;
  currentY: any;
  xChange: any;
  yChange: any;
  lastX: any;
  lastY: any;
  currentMode: string = 'draw'; // Initial mode (drawing)
  colorSelected: string = "black";

  constructor(private _menuCtrl: MenuController) {
    this.canvas = fabric.Canvas;
    addIcons({
      checkboxOutline, resizeOutline, createOutline, trashOutline,
      textOutline, ellipseOutline, squareOutline, removeOutline, cloudDownloadOutline, cloudUploadOutline, bookmarkOutline
    });
  }

  changeBrushColor(color: string) {
    this.colorSelected = color;
    if (this.currentMode === 'draw') {
      this.activateDrawingMode();
    }
  }

  ngOnInit() {
    this.canvas = new fabric.Canvas('c', {
      backgroundColor: '#fff',
      selection: false, // Disables selection by default
    });

    const vh = window.innerHeight * 0.55; // Example: 55vh
    const vw = window.innerWidth * 0.9; // Example: 90vw

    this.canvas.setHeight(vh);
    this.canvas.setWidth(vw);
    this.activateDrawingMode();

    // Changing the color and width of the selection border
    this.canvas.selectionBorderColor = 'blue';  // Selection border color
    this.canvas.selectionLineWidth = 4;       // Selection border width
    this._menuCtrl.enable(true, 'main-menu');
    this._menuCtrl.open('main-menu');

  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  addNote() {
    // 1. Creating the Rectangle (Note Background)
    const noteBackground = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: this.colorSelected,  // Yellow color to simulate a paper note
      rx: 10,  // Rounded corners
      ry: 10,  // Rounded corners
    });

    // 2. Creating the Text (Note Content)
    const noteText = new fabric.Textbox('My Note', {
      left: 120,
      top: 120,
      fontSize: 20,
      width: 160,  // Width for automatic line breaks
      fill: this.colorSelected,  // Text color
    });

    // 3. Adding Objects to the Canvas
    this.canvas.add(noteBackground);
    this.canvas.add(noteText);
  }

  // Function to activate drawing mode (pen)
  activateDrawingMode() {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.color = this.colorSelected; // Pen color
    this.canvas.freeDrawingBrush.width = 5; // Pen thickness
    this.currentMode = 'draw';
    this.canvas.selection = false; // Disables object selection
  }

  // Function to activate selection mode
  activateSelectionMode() {
    this.canvas.isDrawingMode = false; // Disables drawing
    this.canvas.selection = true; // Enables object selection
    this.currentMode = 'select';
  }

  // Function to activate zoom mode
  activateZoomMode() {
    this.deactivateZoomMode(); // Remove eventos antigos para evitar bugs
    this.canvas.isDrawingMode = false;
    this.canvas.selection = false;
    this.currentMode = 'zoom';

    console.log('Zoom mode enabled'); // Teste no console para garantir ativação

    // Verifica se o evento está sendo adicionado corretamente
    this.canvas.on('mouse:wheel', (opt: any) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();

      let zoom = this.canvas.getZoom();
      const zoomFactor = 0.1; // Ajuste do zoom

      if (opt.e.deltaY < 0) {
        zoom += zoomFactor; // Zoom in
      } else {
        zoom -= zoomFactor; // Zoom out
      }

      zoom = Math.max(0.5, Math.min(zoom, 3)); // Mantém entre 0.5x e 3x

      console.log('Zoom level:', zoom); // Debug

      this.canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
      this.canvas.renderAll();
    });
  }


  // Método para remover o evento ao sair do modo zoom
  deactivateZoomMode() {
    this.canvas.off('mouse:wheel');
  }

  activateTextMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.currentMode = 'text';

    const text = new fabric.Textbox('Type here', {
      left: 100,
      top: 100,
      fontSize: 30,
      fill: this.colorSelected, // Text color
      editable: true, // Allows editing
      width: 200, // Text field width
    });

    this.canvas.add(text);
    this.canvas.setActiveObject(text);
    text.enterEditing(); // Enables text editing automatically
    text.hiddenTextarea?.focus(); // Ensures the cursor appears immediately
  }


  activateImageMode(imageUrl: string) {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.currentMode = 'image';

    fabric.Image.fromURL(imageUrl, (img) => {
      img.set({
        left: 100,
        top: 100,
        angle: 0,
      });

      this.canvas.add(img);
      this.canvas.setActiveObject(img);
    });
  }

  activateCircleMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.currentMode = 'circle';

    const circle = new fabric.Circle({
      radius: 50,
      left: 100,
      top: 100,
      fill: this.colorSelected,
      selectable: true,
    });

    this.canvas.add(circle);
    this.canvas.setActiveObject(circle);
  }

  activateRectangleMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.currentMode = 'rectangle';

    const rectangle = new fabric.Rect({
      left: 150,
      top: 150,
      width: 100,
      height: 50,
      fill: this.colorSelected,
      selectable: true,
    });

    this.canvas.add(rectangle);
    this.canvas.setActiveObject(rectangle);
  }

  activateLineMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.currentMode = 'line';

    const line = new fabric.Line([100, 100, 200, 200], {
      left: 50,
      top: 50,
      stroke: this.colorSelected,
      strokeWidth: 3,
      selectable: true,
    });

    this.canvas.add(line);
    this.canvas.setActiveObject(line);
  }

  activateEraseMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = false; // Disables selection
    this.currentMode = 'erase';

    // Setting up an eraser brush
    const eraseBrush = new fabric.PencilBrush(this.canvas);
    eraseBrush.color = '#ffffff'; // White color to erase
    eraseBrush.width = 20; // Eraser size
    this.canvas.freeDrawingBrush = eraseBrush;
    this.canvas.isDrawingMode = true; // Activates drawing mode
  }


  downloadCanvas() {
    const dataURL = this.canvas.toDataURL({
      format: 'png', // Can be 'jpeg' or 'webp' if preferred
      quality: 1.0   // Maximum quality
    });

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'my_art.png'; // File name when downloading
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  switchMode(mode: string) {
    switch (mode) {
      case 'draw':
        this.activateDrawingMode();
        break;
      case 'select':
        this.activateSelectionMode();
        break;
      case 'zoom':
        this.activateZoomMode();
        break;
      case 'text':
        this.activateTextMode();
        break;
      case 'circle':
        this.activateCircleMode();
        break;
      case 'rectangle':
        this.activateRectangleMode();
        break;
      case 'line':
        this.activateLineMode();
        break;
      case 'erase':
        this.activateEraseMode();
        break;
      case 'download':
        this.downloadCanvas();
        break;
      default:
        console.log('Unrecognized mode');
    }
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        img.scaleToWidth(300); // Adjusts the image size (optional)
        img.scaleToHeight(300);
        img.set({ left: 50, top: 50 }); // Sets the initial position

        this.canvas.add(img);
        this.canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  }

}