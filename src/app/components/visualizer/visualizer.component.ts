import { Component, OnInit, ViewChild } from '@angular/core';



class Shape {
  constructor (
    public dy: number,
    public style: string
  ) {}
}

const NSHAPES: number = 8;

@Component({
  selector: 'visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss']
})
export class VisualizerComponent implements OnInit {

  @ViewChild('shape-canvas') canvas: HTMLCanvasElement;
  public color;
  private shapes: Array<Shape>;
  constructor() {

  }

  ngOnInit() {
    console.log(this.canvas)
  }

}
