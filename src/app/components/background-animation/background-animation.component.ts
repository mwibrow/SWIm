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

    for (i = 0; i < 3; i ++) {
      color = style.global.$colorClouds.value[2 - i].value
      let g0 = svgCanvas.group().attr({
        fill: `rgb(${color.r},${color.g},${color.b})`
      });
      let g1 = g0.group()
      let g = g1.group()
      let unit = viewBox.height / 8;

      g.ellipse(48, 112, 48, 48);
      g.ellipse(200, 104, 56, 56);
      g.rect(48, 96, 152, 64);
      g.ellipse(128, 64, 64, 64);
      let m = new Snap.Matrix();
      m.translate(0, viewBox.height / 4 - unit * i);
      g.transform(m);
      let bbox = g.getBBox();
      m = new Snap.Matrix();
      m.scale(1.5 - i / 4, 1.5 - i / 4, bbox.cx, bbox.cy );
      g1.transform(m);
      //g.transform('s' + (1 + i / 2));
      this.float(g0, 60000 - i * 20000);
    }
  }

  rotate(shape, duration) {
    let bbox = shape.getBBox();
    shape.transform("r0," + bbox.cx + ',' + bbox.cy);
    shape.animate({ transform: `r360,${bbox.cx},${bbox.cy}` }, duration,
      () => {this.rotate(shape, duration)});
  }

  float(g, speed) {
      var matrix = Snap.matrix(1, 0, 0, 1, -200, 0);
      g.transform(matrix);
      var matrix = Snap.matrix(1, 0, 0, 1, 1900, 0);
      var that = this;
      g.animate({transform: matrix}, speed, function() { that.float(g, speed) });
  }
}





