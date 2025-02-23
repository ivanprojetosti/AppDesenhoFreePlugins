import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { fabric } from 'fabric';
import * as pdfjsLib from 'pdfjs-dist';
import * as fromFabric from 'fabric-with-gestures';
import { addIcons } from 'ionicons';
import { logoIonic,checkboxOutline, createOutline, resizeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon],
})
export class HomePage {
  canvas: any;
  constructor() {
    this.canvas = fromFabric.fabric.Canvas;
    addIcons({checkboxOutline, resizeOutline,createOutline });
  }
  
  output: string[] = [];

  pausePanning = false;
  zoomStartScale = 0;
  currentX: any;
  currentY: any;
  xChange: any;
  yChange: any;
  lastX: any;
  lastY: any;

  currentMode: string = 'draw'; // Modo inicial (desenho)

  ngOnInit() {
    this.canvas = new fromFabric.fabric.Canvas('c', {
      backgroundColor: '#fff',
      selection: false, // Desativa a seleção por padrão
    });
    this.canvas.setHeight(500);
    this.canvas.setWidth(500);
    this.activateDrawingMode(); // Ativa o modo de desenho inicialmente
  }

  // Função para ativar o modo de desenho (caneta)
  activateDrawingMode() {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.color = 'black'; // Cor da caneta
    this.canvas.freeDrawingBrush.width = 5; // Espessura da caneta
    this.currentMode = 'draw';
    this.canvas.selection = false; // Desativa a seleção de objetos
  }

  // Função para ativar o modo de seleção
  activateSelectionMode() {
    this.canvas.isDrawingMode = false; // Desativa o desenho
    this.canvas.selection = true; // Ativa a seleção de objetos
    this.currentMode = 'select';
  }

  // Função para ativar o modo de zoom
  activateZoomMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = false;
    this.currentMode = 'zoom';

    // Desenhando uma área de zoom (com controle de mouse wheel)
    this.canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  // Método para desativar o zoom (limpar eventos)
  deactivateZoomMode() {
    this.canvas.off('mouse:wheel'); // Remove o evento de zoom
  }
  activateTextMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.currentMode = 'text';
    
    const text = new fromFabric.fabric.Text('Digite seu texto', {
      left: 100,
      top: 100,
      fontSize: 30,
      fill: '#000000', // Cor do texto
    });
  
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
  }

  activateImageMode(imageUrl: string) {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.currentMode = 'image';
    
    fromFabric.fabric.Image.fromURL(imageUrl, (img) => {
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
    
    const circle = new fromFabric.fabric.Circle({
      radius: 50,
      left: 100,
      top: 100,
      fill: 'blue',
      selectable: true,
    });
  
    this.canvas.add(circle);
    this.canvas.setActiveObject(circle);
  }

  activateRectangleMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.currentMode = 'rectangle';
    
    const rectangle = new fromFabric.fabric.Rect({
      left: 150,
      top: 150,
      width: 100,
      height: 50,
      fill: 'green',
      selectable: true,
    });
  
    this.canvas.add(rectangle);
    this.canvas.setActiveObject(rectangle);
  }

  
  activateLineMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    this.currentMode = 'line';
  
    const line = new fromFabric.fabric.Line([100, 100, 200, 200], {
      left: 50,
      top: 50,
      stroke: 'red',
      strokeWidth: 3,
      selectable: true,
    });
  
    this.canvas.add(line);
    this.canvas.setActiveObject(line);
  }
  activateEraseMode() {
    this.canvas.isDrawingMode = false;
    this.canvas.selection = false; // Desativa a seleção
    this.currentMode = 'erase';
    
    // Definindo um pincel de apagar
    const eraseBrush = new fromFabric.fabric.PencilBrush(this.canvas);
    eraseBrush.color = '#ffffff'; // Cor branca para apagar
    eraseBrush.width = 20; // Tamanho do apagador
    this.canvas.freeDrawingBrush = eraseBrush;
    this.canvas.isDrawingMode = true; // Ativa o modo de desenho
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
      case 'image':
        this.activateImageMode('https://i.pinimg.com/originals/ed/55/22/ed55223749f1d995b2bb0cbb24692c1d.jpg'); // Exemplo de URL de imagem
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
      default:
        console.log('Modo não reconhecido');
    }
  }
  
  
}
