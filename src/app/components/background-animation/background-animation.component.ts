import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import "snapsvg-cjs";
declare var Snap: any;
declare var mina: any;

const fs = require('fs-extra');


Snap.plugin(function (Snap, Element, Paper, global, Fragment) {
    // Plugin to stop all animations.
    Element.prototype.stopAnim = function () {
      Element.prototype.animatable = false;
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






    Snap.transforms = {};
    Snap.transforms.translate = function(x: number, y: number) {
      let matrix = new Snap.matrix(1, 0, 0, 1, x, y);
      return matrix;
    };

    Snap.transforms.shiftX = function(x: number) {
      return Snap.transforms.translate(x, 0);
    };

    Snap.transforms.shiftY = function(y: number) {
      return Snap.transforms.translate(0, y);
    };

    Snap.transforms.scale = function(x: number, y?: number, cx?: number, cy?: number) {
       let matrix = new Snap.matrix();
       matrix.scale(x, y, cx, cy);
       return matrix;
    }

    Snap.transforms.rotate = function(angle: number) {
       let matrix = new Snap.matrix();
       matrix.rotate(angle);
       return matrix;
    }


});

const Transform = Snap.transforms;

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

    // for (i = 0; i < 3; i ++) {
    //   color = style.global.$colorClouds.value[i].value
    //   let g = svgCanvas.group().group().group();
    //   g.attr({
    //     fill: `rgb(${color.r},${color.g},${color.b})`
    //   });

    //   // Draw cloud.
    //   g.ellipse(48, 112, 48, 48);
    //   g.ellipse(200, 104, 56, 56);
    //   g.rect(48, 96, 152, 64);
    //   g.ellipse(128, 64, 64, 64);

    //   // Translate to the required height.
    //   matrix= new Snap.Matrix();
    //   matrix.translate(0, viewBox.height / 10 * i);
    //   g.transform(matrix);

    //   // Scale.
    //   bbox = g.getBBox();
    //   matrix = new Snap.Matrix();
    //   var scale = viewBox.height / 12 * (i + 1) / bbox.height;
    //   matrix.scale(scale, scale, bbox.cx, bbox.cy );
    //   g.parent().transform(matrix);

    //   // Animate.
    //   bbox = g.parent().parent().getBBox();
    //   this.floatCloud(
    //     g.parent().parent(),
    //     viewBox.width  /  5 * (4 - i),
    //     -bbox.width * 2,
    //     viewBox.width + bbox.width,
    //     40000 + i * 20000);
    // }


    // let fish = new Fish(svgCanvas, style.global['$md-palette'].value['md-orange'].value.hex);
    // fish.scale(0.5).translate(0, viewBox.height / 8 * 4);
    // fish.waggle(1000);
    // fish.swim(viewBox.width / 3, viewBox.x - fish.getBBox().width, viewBox.width, 20000);

    // fish = new Fish(svgCanvas, style.global['$md-palette'].value['md-light-green'].value.hex);
    // fish.scale(0.5).translate(0, viewBox.height / 8 * 5);
    // fish.waggle(1000);
    // fish.swim(viewBox.width / 3 * 2, viewBox.x - fish.getBBox().width, viewBox.width, 25000);

    // fish = new Fish(svgCanvas, style.global['$md-palette'].value['md-purple'].value.hex);
    // fish.scale(0.5).translate(0, viewBox.height / 8 * 6);
    // fish.waggle(1000);
    // fish.swim(viewBox.width / 3 * 3, viewBox.x - fish.getBBox().width, viewBox.width, 30000);


    let svgBBox = viewBox;// this.svg.getBBox();
    svgBBox.cx = svgBBox.width / 2;
    svgBBox.cy = svgBBox.height / 2;

    stars(this.svg, 50, "pink", 3000, svgBBox);
    // for (i = 0 ; i < 50; i ++) {
    //   ((i) => {
    //     setTimeout(() => {
    //     let star = this.svg.path('M 32.336173,42.831492 C 29.562915,44.949952 4.5544902,27.254472 1.065677,27.338262 C -2.423136,27.422062 -26.553231,46.297692 -29.424991,44.314802 C -32.296751,42.331922 -23.195383,13.079292 -24.353175,9.7871319 C -25.510968,6.4949619 -50.919371,-10.621228 -49.920958,-13.965178 C -48.922545,-17.309128 -18.289166,-17.692778 -15.515908,-19.811238 C -12.74265,-21.929698 -4.315812,-51.383718 -0.82699894,-51.467508 C 2.6618143,-51.551298 12.492916,-22.535778 15.364676,-20.552898 C 18.236436,-18.570008 48.852912,-19.657408 50.010704,-16.365238 C 51.168496,-13.073068 26.611072,5.2431519 25.612659,8.5871019 C 24.614247,11.931052 35.109431,40.713032 32.336173,42.831492 Z');
    //     star.transform(Transform.translate(svgBBox.cx, svgBBox.cy));
    //     let length = Math.max(svgBBox.width, svgBBox.height);
    //     let dx = (Math.random() - .5) * length;
    //     let dy = (Math.random() - .5) * length;
    //     let duration = Math.random() * 1000 + 2000;
    //     star.attr('fill',"#E91E63");
    //     star['i'] = i;
    //     star.animate({
    //       transform: `t${svgBBox.cx + dx},${svgBBox.cy + dy}s0.001,0.001r360`,
    //     }, duration, function(t) { return Math.sin(t * Math.PI / 2); },
    //     () => {
    //       star.remove();
    //     }); }, Math.random()* 500)}
    //   )(i)

    // }


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
  public contentGroup;

  constructor(svg: any) {
    this.group = svg.g();
    this.translateGroup = this.group.g();
    this.rotateGroup = this.translateGroup.g();
    this.scaleGroup = this.rotateGroup.g();
    this.contentGroup = this.scaleGroup.g();
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
    this.fish = this.contentGroup.g();
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
    shape.transform( Transform.shiftX(start) );
    shape.animate(
      { transform: Transform.shiftX(min) },
      duration * (start - min) / (max - min),
      () => {
        shape.transform(Transform.shiftX(max));
        shape.animate(
          { transform: Transform.shiftX(start) },
          duration * (max - start) / (max - min),
          () => {
            this.swim(start, min, max, duration);
        });
    });

  }

  waggle(duration: number) {
    let tail = this.tail;
    let bbox = tail.getBBox();
    tail.animate({ transform: Transform.scale(0.75, 0.875, bbox.cx - bbox.width / 2, bbox.cy )}, duration / 4,
      () => {
        tail.animate({ transform: Transform.scale(1, 1, bbox.cx - bbox.width / 2, bbox.cy)}, duration / 4,
          () => {
            tail.animate({ transform: Transform.scale(0.75, 1.125, bbox.cx - bbox.width / 2, bbox.cy)}, duration / 4,
          () => {
            tail.animate({ transform: Transform.scale(1, 1, bbox.cx - bbox.width / 2, bbox.cy)}, duration / 4,
              () => {
              this.waggle(duration);
              });
          });
        });
      });
  }
}


class Star extends TransformGroup {

  static d = 'M 32.336173,42.831492 C 29.562915,44.949952 4.5544902,27.254472 1.065677,27.338262 C -2.423136,27.422062 -26.553231,46.297692 -29.424991,44.314802 C -32.296751,42.331922 -23.195383,13.079292 -24.353175,9.7871319 C -25.510968,6.4949619 -50.919371,-10.621228 -49.920958,-13.965178 C -48.922545,-17.309128 -18.289166,-17.692778 -15.515908,-19.811238 C -12.74265,-21.929698 -4.315812,-51.383718 -0.82699894,-51.467508 C 2.6618143,-51.551298 12.492916,-22.535778 15.364676,-20.552898 C 18.236436,-18.570008 48.852912,-19.657408 50.010704,-16.365238 C 51.168496,-13.073068 26.611072,5.2431519 25.612659,8.5871019 C 24.614247,11.931052 35.109431,40.713032 32.336173,42.831492 Z';
  path: any;
  constructor (svg) {
    super(svg);
    this.path = this.contentGroup.path(Star.d);
    let bbox = this.path.getBBox();
    this.contentGroup.transform(Transform.scale(0.5, 0.5, bbox.cx, bbox.cy));
  }
}



const stars = (svg: any, count: number, color: string, duration: number, bbox: any) => {
  for (let i: number = 0 ; i < 50; i ++) {
    ((i) => {
      setTimeout(() => {
        let star = svg.path('M 32.336173,42.831492 C 29.562915,44.949952 4.5544902,27.254472 1.065677,27.338262 C -2.423136,27.422062 -26.553231,46.297692 -29.424991,44.314802 C -32.296751,42.331922 -23.195383,13.079292 -24.353175,9.7871319 C -25.510968,6.4949619 -50.919371,-10.621228 -49.920958,-13.965178 C -48.922545,-17.309128 -18.289166,-17.692778 -15.515908,-19.811238 C -12.74265,-21.929698 -4.315812,-51.383718 -0.82699894,-51.467508 C 2.6618143,-51.551298 12.492916,-22.535778 15.364676,-20.552898 C 18.236436,-18.570008 48.852912,-19.657408 50.010704,-16.365238 C 51.168496,-13.073068 26.611072,5.2431519 25.612659,8.5871019 C 24.614247,11.931052 35.109431,40.713032 32.336173,42.831492 Z');
        star.transform(Transform.translate(bbox.cx, bbox.cy));
        let length = Math.max(bbox.width, bbox.height);
        let dx = (Math.random() - .5) * length;
        let dy = (Math.random() - .5) * length;
        star.attr('fill', color);
        star.animate({
          transform: `t${bbox.cx + dx},${bbox.cy + dy}s0.001,0.001r360`,
        }, (Math.random() + 2) / 3 * duration,  function(t) { return Math.sin(t * Math.PI / 2); },
        () => {
          star.remove();
        }); },
        Math.random()* 500)}
    )(i)
  }

}