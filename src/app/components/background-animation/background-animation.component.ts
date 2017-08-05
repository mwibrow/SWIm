import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import "snapsvg-cjs";
declare var Snap: any;

Snap.plugin(function (Snap, Element, Paper, global, Fragment) {
    // Plugin to stop all animations.

    Element.prototype.stopAnim = function (){
      let anims = this.anims;
      for (let property in anims) {
        if (anims.hasOwnProperty(property)) {
          let anim = anims[property];
          delete anims[property];
          anim.stop();
        }
      }
    }

    Element.prototype.stopAll = function() {
      this.stopAnim();
      let children = this.children();
      for (let i: number = 0; i < children.length; i ++) {
        children[i].stopAll();
      }
    }

});

const style = require('sass-extract-loader!./background-animation.component.scss');


@Component({
  selector: 'app-background-animation',
  templateUrl: './background-animation.component.html',
  styleUrls: ['./background-animation.component.scss']
})
export class BackgroundAnimationComponent implements OnInit {

  svg : any;
  constructor(private router: Router) {

    router.events.subscribe((val: any) => {
      if (val instanceof NavigationStart && val.url !== '/task') {
        this.stopAnimations();
      }
    });
  }


  ngOnInit() {
    this.createSvg();
  }


  stopAnimations() {
    this.svg.stopAll();
  }

  createSvg() {

    let svgCanvas;
    svgCanvas = Snap("#svg");
    this.svg = svgCanvas;

    svgCanvas.node.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
    let viewBox: any = svgCanvas.attr('viewBox');

    let shape: any, color: any;
    // shape = svgCanvas.rect(viewBox.x, viewBox.y, viewBox.width, viewBox.height);
    // color = style.global.$colorSky.value
    // shape.attr({
    //   fill: `rgb(${color.r},${color.g},${color.b})`
    // });

    let i: number;

    // shape = svgCanvas.rect(viewBox.x, viewBox.height / 3, viewBox.width, viewBox.height * 2 / 3);
    // color = style.global.$colorSea.value
    // shape.attr({
    //   fill: `rgb(${color.r},${color.g},${color.b})`
    // });

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
      matrix.translate(0, viewBox.height / 10 * i);
      g.transform(matrix);

      // Scale.
      bbox = g.getBBox();
      matrix = new Snap.Matrix();
      var scale = viewBox.height / 12 * (i + 1) / bbox.height;
      matrix.scale(scale, scale, bbox.cx, bbox.cy );
      g.parent().transform(matrix);

      // Animate.
      bbox = g.parent().parent().getBBox();
      this.floatCloud(
        g.parent().parent(),
        viewBox.width  /  5 * (4 - i),
        -bbox.width * 2,
        viewBox.width + bbox.width,
        40000 + i * 20000);
    }


    let fish = new Fish(svgCanvas, style.global['$md-palette'].value['md-orange'].value.hex);
    fish.scale(0.5).translate(0, viewBox.height / 8 * 4);
    fish.waggle(1000);
    fish.swim(viewBox.width / 3, viewBox.x - fish.getBBox().width, viewBox.width, 20000);

    fish = new Fish(svgCanvas, style.global['$md-palette'].value['md-light-green'].value.hex);
    fish.scale(0.5).translate(0, viewBox.height / 8 * 5);
    fish.waggle(1000);
    fish.swim(viewBox.width / 3 * 2, viewBox.x - fish.getBBox().width, viewBox.width, 25000);

    fish = new Fish(svgCanvas, style.global['$md-palette'].value['md-purple'].value.hex);
    fish.scale(0.5).translate(0, viewBox.height / 8 * 6);
    fish.waggle(1000);
    fish.swim(viewBox.width / 3 * 3, viewBox.x - fish.getBBox().width, viewBox.width, 30000);




  }




  rotate(shape, duration) {
    let bbox = shape.getBBox();
    shape.transform("r0," + bbox.cx + ',' + bbox.cy);
    shape.animate({ transform: `r360,${bbox.cx},${bbox.cy}` }, duration,
      () => {this.rotate(shape, duration)});
  }




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



class TransformGroup {

  public group;
  public translateGroup;
  public rotateGroup;
  public scaleGroup;

  constructor(svg: any) {
    this.group = svg.g();
    this.translateGroup = this.group.g();
    this.rotateGroup = this.translateGroup.g();
    this.scaleGroup = this.rotateGroup.g();
  }

  getBBox() {
    return this.group.getBBox();
  }

  scale(x: number, y?: number, cx?: number, cy?: number) {
    let matrix = new Snap.matrix();
    matrix.scale(x, y, cx, cy);
    this.scaleGroup.transform(matrix);
    return this;
  }

  translate(dx: number, dy: number) {
    let matrix = new Snap.matrix();
    matrix.translate(dx, dy);
    this.translateGroup.transform(matrix);
    return this;
  }

}

class Fish extends TransformGroup {

  public fish: any;
  public body: any;
  public tail: any;

  constructor(svg: any, color: string) {
    super(svg);
    this.fish = this.scaleGroup.g();
    this.body = this.fish.g();
    this.tail = this.fish.g();

    this.fish.attr('fill', color)
    this.tail.path('M 250,210 170,160 V 110 L 250,69 220,140 Z');
    this.body.path('M 24,130 8,120 200,8 170,230 8,140 Z');
    this.body.path('M 72,89 110,32 V 89 Z');
    this.body.path('M 64,170 120,250 V 170 Z');
    this.body.circle(72, 112, 16).attr('fill',
      style.global['$md-palette'].value['md-white'].value.hex);
    this.body.circle(72, 112, 12).attr('fill',
      style.global['$md-palette'].value['md-grey'].value.hex);

  }

  swim(start, min, max, duration) {
    // Well, this is ugly.
    let shape = this.group;
    let matrix = new Snap.Matrix();
    matrix.translate(start, 0)
    shape.transform(matrix);
    matrix = new Snap.Matrix();
    matrix.translate(min, 0);
    shape.animate(
      { transform: matrix },
      duration * (start - min) / (max - min),
      () => {
        matrix = new Snap.Matrix();
        matrix.translate(max, 0);
        shape.transform(matrix);
         matrix = new Snap.Matrix();
        matrix.translate(start, 0);
        shape.animate(
          { transform: matrix },
          duration * (max - start) / (max - min),
          () => {
            this.swim(start, min, max, duration);
        });
    });
  }

  waggle(duration: number) {
    let tail = this.tail;
    let bbox = tail.getBBox();
    let matrix = new Snap.Matrix();
    matrix.scale(0.75, 0.875, bbox.cx - bbox.width / 2, bbox.cy);
    tail.animate({ transform: matrix}, duration / 4,
      () => {
        let matrix = new Snap.Matrix();
        matrix.scale(1, 1, bbox.cx - bbox.width / 2, bbox.cy);
        tail.animate({ transform: matrix}, duration / 4,
          () => {
            let matrix = new Snap.Matrix();
            matrix.scale(0.75, 1.125, bbox.cx - bbox.width / 2, bbox.cy);
            tail.animate({ transform: matrix}, duration / 4,
          () => {
            let matrix = new Snap.Matrix();
            matrix.scale(1, 1, bbox.cx - bbox.width / 2, bbox.cy);
            tail.animate({ transform: matrix}, duration / 4,
              () => {
              this.waggle(duration);
              });
          });
        });
      });
  }
}

