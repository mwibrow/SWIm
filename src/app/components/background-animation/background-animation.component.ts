import { Component, OnInit } from '@angular/core';

import "snapsvg-cjs";
declare var Snap: any;

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

    var group = svgCanvas.group()
    // Lets create big circle in the middle:
    var bigCircle = svgCanvas.circle(150, 150, 100);
    // By default its black, lets change its attributes
    bigCircle.attr({
      fill: "#bada55",
      stroke: "#000",
      strokeWidth: 5
    });
    // Now lets create another small circle:
    var smallCircle = group.circle(100, 150, 70);

    var matrix = Snap.matrix(1, 0, 0, 1, 1900, 0);
    group.append(bigCircle);
    this.float(group);
  }

  float(g) {
      var matrix = Snap.matrix(1, 0, 0, 1, -200, 0);
      g.transform(matrix);
      var matrix = Snap.matrix(1, 0, 0, 1, 1900, 0);
      var that = this;
      g.animate({transform: matrix}, 20000, function() { that.float(g) });
  }
}





