import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import 'snapsvg-cjs';
declare var Snap: any;

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
    shape = svgCanvas.rect(viewBox.x, viewBox.y, viewBox.width, viewBox.height);
    color = style.global.$colorSky.value
    shape.attr({
      fill: `rgb(${color.r},${color.g},${color.b})`
    });

    let i: number;

    shape = svgCanvas.rect(viewBox.x, viewBox.height / 3, viewBox.width, viewBox.height * 2 / 3);
    color = style.global.$colorSea.value
    shape.attr({
      fill: `rgb(${color.r},${color.g},${color.b})`
    });

    // let size = viewBox.height / 6;
    // let waveCount: number = 10;
    // for (i = 0;  i < waveCount ; i ++) {
    //   shape = svgCanvas.ellipse(i * viewBox.width / (waveCount - 1) + 1, viewBox.height / 3, size, size * 1.0625);
    //   color = style.global.$colorSky.value;
    //   shape.attr({
    //      fill: `rgb(${color.r},${color.g},${color.b})`
    //   });
    //   let bbox = shape.getBBox();
    //   Animations.rotate(shape, Math.floor(Math.random() * 5) * 1000 + 6000);
    // }

    // Draw some clouds.
    // for (i = 0; i < 3; i ++) {

    //   let cloud = shapeFactory.cloud(this.svg)
    //   let bbox = cloud.getBBox();

    //   let scale = viewBox.height / 12 * (i + 1) / bbox.height;
    //   let x = viewBox.width  /  5 * (4 - i);
    //   let y = viewBox.height / 10 * i;

    //   cloud.transform(`s${scale},${scale}`);
    //   color = style.global.$colorClouds.value[i].value;

    //   cloud.attr({fill: `rgb(${color.r},${color.g},${color.b})`});

    //   let duration = 40000 + i * 20000;
    //   Animations.float(shapeFactory.g(cloud), x, y, -bbox.width, viewBox.width + bbox.width, duration);
    // }


    // let fish = shapeFactory.fish(this.svg, 'fish1-');
    // fish.attr({fill:
    //   style.global['$md-palette'].value['md-orange'].value.hex});
    // fish.select('#fish1-eye').attr({fill:
    //   style.global['$md-palette'].value['md-white'].value.hex});
    // fish.select('#fish1-pupil').attr({fill:
    //   style.global['$md-palette'].value['md-grey'].value.hex});
    // fish.transform('s0.5,0.5');

    // Animations.float(shapeFactory.g(fish),
    //   viewBox.width / 3, viewBox.height / 10 * 5,  viewBox.width, viewBox.x - 2 * fish.getBBox().width, 20000);
    //  Animations.waggle(fish.select('#fish1-tail'), 1000);

    // fish = shapeFactory.fish(this.svg, 'fish2-');
    // fish.attr({fill:
    //   style.global['$md-palette'].value['md-light-green'].value.hex});
    // fish.select('#fish2-eye').attr({fill:
    //   style.global['$md-palette'].value['md-white'].value.hex});
    // fish.select('#fish2-pupil').attr({fill:
    //   style.global['$md-palette'].value['md-grey'].value.hex});
    // fish.transform('s0.5,0.5');

    // Animations.waggle(fish.select('#fish2-tail'), 1000);
    // Animations.float(shapeFactory.g(fish),
    //   2 * viewBox.width / 3, viewBox.height / 10 * 6,  viewBox.width, viewBox.x - 2 * fish.getBBox().width, 25000);

    // fish = shapeFactory.fish(this.svg, 'fish3-');
    // fish.attr({fill:
    //   style.global['$md-palette'].value['md-purple'].value.hex});
    // fish.select('#fish3-eye').attr({fill:
    //   style.global['$md-palette'].value['md-white'].value.hex});
    // fish.select('#fish3-pupil').attr({fill:
    //   style.global['$md-palette'].value['md-grey'].value.hex});
    // fish.transform('s0.5,0.5');

    // Animations.waggle(fish.select('#fish3-tail'), 1000);
    // Animations.float(shapeFactory.g(fish),
    //   3 * viewBox.width / 3, viewBox.height / 10 * 7,  viewBox.width, viewBox.x - 2 * fish.getBBox().width, 30000);


    let svgBBox = viewBox;
    svgBBox.cx = svgBBox.width / 2;
    svgBBox.cy = svgBBox.height / 2;

    setTimeout(() => { stars(this.svg, 50, "pink", 3000, svgBBox) }, 1000);


 

  }

}


namespace Animations {

  export const float = (el, x, y, min, max, duration) => {
    let range = Math.abs(max - min);
    el.transform(`t${x},${y}`);
    el.animate({transform: `t${max},${y}`}, Math.abs(max - x) / range * duration, () => {
      el.transform(`t${min},${y}`);
      el.animate({transform: `t${x},${y}`}, Math.abs(x - min) / range * duration, () => {
        Animations.float(el, x, y, min, max, duration);
      });
    });
  }

  export const rotate = (el: any, duration: number) => {
    let bbox = el.getBBox();
    el.transform(`r0,${bbox.cx},${bbox.cy}`);
    el.animate({ transform: `r360,${bbox.cx},${bbox.cy}` }, duration,
      () => {
        Animations.rotate(el, duration);
      });
  }

  export const explode = (el: any, x: number, y: number, dx: number, dy: number,
      duration: number, remove: boolean=true) => {

    
    let time = (Math.random() + 2) / 3 * duration;
    el.transform('s0.001,0.001r0');
    el.animate({
        transform: 's1,1',
      },
      time,
      function(t) { return Math.sin(t * Math.PI); }
    );
    let g = shapeFactory.g(el);
    g.transform(`t${x},${y}r${dx < 0 ? 360 : -360}`);
    g.animate({
        transform: `t${x + dx},${y + dy}`,
      },
      time + 50,
      function(t) { return t; },
      () => {
        if (remove) {
          g.remove();
        }
      });
  }

  export const waggle = (el: any, duration: number) => {
    let bbox = el.getBBox();
    let cx = bbox.cx - bbox.width / 2;
    let cy = bbox.cy;
    el.animate({ transform: `s0.75, 0.875,${cx}, ${cy}` }, duration / 4,
      () => {
        el.animate({ transform: `s1,1,${cx},${cy}` }, duration / 4,
          () => {
            el.animate({ transform: `s0.75, 1.125,${cx}, ${cy}` }, duration / 4,
          () => {
            el.animate({ transform: `s1,1,${cx}, ${cy}` }, duration / 4,
              () => {
                Animations.waggle(el, duration);
              });
          });
        });
      });
  }
}


namespace shapeFactory {

  export const g = (element: any) => {
    let group = element.paper.g();
    group.add(element);
    return group;
  }

  export const rectangle = (svg: any, x: number, y: number, width: number, height:number, rx?: number, ry?: number) => {
    return svg.rect(x, y, width, height, rx, ry);

  }

  export const star = (svg) => {
    return svg.path('M 32.336173,42.831492 C 29.562915,44.949952 4.5544902,27.254472 1.065677,27.338262 C -2.423136,27.422062 -26.553231,46.297692 -29.424991,44.314802 C -32.296751,42.331922 -23.195383,13.079292 -24.353175,9.7871319 C -25.510968,6.4949619 -50.919371,-10.621228 -49.920958,-13.965178 C -48.922545,-17.309128 -18.289166,-17.692778 -15.515908,-19.811238 C -12.74265,-21.929698 -4.315812,-51.383718 -0.82699894,-51.467508 C 2.6618143,-51.551298 12.492916,-22.535778 15.364676,-20.552898 C 18.236436,-18.570008 48.852912,-19.657408 50.010704,-16.365238 C 51.168496,-13.073068 26.611072,5.2431519 25.612659,8.5871019 C 24.614247,11.931052 35.109431,40.713032 32.336173,42.831492 Z');
  }

  export const cloud = (svg: any) => {
    let g = svg.g();
    g.ellipse(48, 112, 48, 48);
    g.ellipse(200, 104, 56, 56);
    g.rect(48, 96, 152, 64);
    g.ellipse(128, 64, 64, 64);
    return g;
  }

  export const fish = (svg: any, prefix?:string) => {
    let fish = svg.g();
    let tail = fish.g().attr({'id': `${prefix}tail`});
    let body = fish.g().attr({'id': `${prefix}body`});
    tail.path('M 250,210 170,160 V 110 L 250,69 220,140 Z');
    body.path('M 24,130 8,120 200,8 170,230 8,140 Z');
    body.path('M 72,89 110,32 V 89 Z');
    body.path('M 64,170 120,250 V 170 Z');
    body.circle(72, 112, 16).attr('id', `${prefix}eye`);
    body.circle(72, 112, 12).attr('id', `${prefix}pupil`);
    return fish;
  }

}


const stars = (svg: any, count: number, color: string, duration: number, bbox: any) => {
  for (let i: number = 0 ; i < count; i ++) {
      setTimeout(() => {
        let star = shapeFactory.star(svg);
        let length = Math.max(bbox.width, bbox.height);
        let dx = (Math.random() - .5) * length;
        let dy = (Math.random() - .5) * length;
        star.attr('fill', color);
        Animations.explode(star, bbox.cx, bbox.cy, dx, dy, duration, true);
      },
        Math.random() * 500);
  }

}



