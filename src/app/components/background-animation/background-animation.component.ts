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
    console.log(style)
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

    let g: any, matrix: any, bbox: any;

    for (i = 0; i < 3; i ++) {
      color = style.global.$colorClouds.value[i].value
      let g = svgCanvas.group().group().group();
      g.attr({
        fill: `rgb(${color.r},${color.g},${color.b})`
      });

      // Draw cloud.
      g.ellipse(48, 112, 48, 48);
      g.ellipse(200, 104, 56, 56);
      g.rect(48, 96, 152, 64);
      g.ellipse(128, 64, 64, 64);

      // Translate to the required height.
      matrix= new Snap.Matrix();
      matrix.translate(0, viewBox.height / 8 * i);
      g.transform(matrix);

      // Scale.
      bbox = g.getBBox();
      matrix = new Snap.Matrix();
      matrix.scale(0.75 + i / 3, 0.75 + i / 3, bbox.cx, bbox.cy );
      g.parent().transform(matrix);

      // Animate.
      bbox = g.parent().parent().getBBox();
      this.floatCloud(
        g.parent().parent(),
        viewBox.width  /  5 * (4 - i),
        -bbox.width,
        viewBox.width,
        40000 + i * 20000);
    }
  }





  rotate(shape, duration) {
    let bbox = shape.getBBox();
    shape.transform("r0," + bbox.cx + ',' + bbox.cy);
    shape.animate({ transform: `r360,${bbox.cx},${bbox.cy}` }, duration,
      () => {this.rotate(shape, duration)});
  }

  f


  floatCloud(shape, start, min, max, duration) {
    // Well, this is ugly.
    let matrix = new Snap.Matrix();
    matrix.translate(start, 0)
    shape.transform(matrix);
    matrix = new Snap.Matrix();
    matrix.translate(max, 0);
    shape.animate(
      { transform: matrix },
      duration * (max - start) / (max - min),
      () => {
        matrix = new Snap.Matrix();
        matrix.translate(min, 0);
        shape.transform(matrix);
         matrix = new Snap.Matrix();
        matrix.translate(start, 0);
        shape.animate(
          { transform: matrix },
          duration * (start - min) / (max - min),
          () => {
            this.floatCloud(shape, start, min, max, duration);
        });
    });
  }
}





