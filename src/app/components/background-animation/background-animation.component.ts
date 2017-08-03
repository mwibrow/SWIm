import { Component, OnInit } from '@angular/core';

import "snapsvg-cjs";
declare var Snap: any;

const style = require('sass-extract-loader!./background-animation.component.scss');
@Component({
  selector: 'app-background-animation',
  templateUrl: './background-animation.component.html',
  styleUrls: ['./background-animation.component.scss']
})
export class BackgroundAnimationComponent implements OnInit {

  constructor() { }

  ngOnInit() {

    this.createSvg();


  }

  createSvg() {

    let svgCanvas;
    svgCanvas = Snap("#svg");
    let viewBox: any = svgCanvas.attr('viewBox');


    let shape = svgCanvas.rect(viewBox.x, viewBox.y, viewBox.width, viewBox.height);
    let color = style.global.$colorSky.value
    shape.attr({
      fill: `rgb(${color.r},${color.g},${color.b})`
    });

    let i: number;

    shape = svgCanvas.rect(viewBox.x, viewBox.height / 3, viewBox.width, viewBox.height * 2 / 3);
    color = style.global.$colorSea.value
    shape.attr({
      fill: `rgb(${color.r},${color.g},${color.b})`
    });

    let size = viewBox.height / 6;
    let waveCount: number = 10;
    for (i = 0;  i < waveCount ; i ++) {
      shape = svgCanvas.ellipse(i * viewBox.width / (waveCount - 1) + 1, viewBox.height / 3, size, size * 1.0625);
      color = style.global.$colorSky.value;
      shape.attr({
         fill: `rgb(${color.r},${color.g},${color.b})`
      });
      let bbox = shape.getBBox();
      this.rotate(shape, Math.floor(Math.random() * 5) * 1000 + 6000);
    }



  }

  rotate(shape, duration) {
    let bbox = shape.getBBox();
    shape.transform("r0," + bbox.cx + ',' + bbox.cy);
    shape.animate({ transform: `r360,${bbox.cx},${bbox.cy}` }, duration,
      () => {this.rotate(shape, duration)});
  }

  float(g) {
      var matrix = Snap.matrix(1, 0, 0, 1, -200, 0);
      g.transform(matrix);
      var matrix = Snap.matrix(1, 0, 0, 1, 1900, 0);
      var that = this;
      g.animate({transform: matrix}, 20000, function() { that.float(g) });
  }
}





