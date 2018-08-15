const SVGNS = 'http://www.w3.org/2000/svg';

export default class QuestionConnector {
  constructor(containerElemID, svgContainerElemID) {
    this.containerElemID = containerElemID;
    this.containerElem = document.getElementById(this.containerElemID);
    this.containerElemPos = this.containerElem.getBoundingClientRect();
    this.svgContainerElemID = svgContainerElemID;
    this.svgContainerElem = document.getElementById(this.svgContainerElemID);
  }

  renderAllConnectors(questions, questionFlowUtil) {
    let range = document.createRange();
    range.selectNodeContents(this.svgContainerElem);
    range.deleteContents();
    this.scanQuestionConnections(questions, questionFlowUtil).forEach(([fromElemID, toElemID]) => {
      this.renderOneConnector(fromElemID, toElemID);
    });
  }

  scanQuestionConnections(questions, questionFlowUtil) {
    let all_anchors_map = questionFlowUtil.getAllAnchors().reduce((map, [anchor, qid]) => {
      map[anchor] = qid;
      return map;
    }, {});
    return questions.reduce((all_connectors, question, index) => {
      if (question.next) {
        all_connectors.push([`next-${index}`, `anchor-${all_anchors_map[question.next]}`]);
      } else if (question.options) {
        question.options.forEach((option, optionIndex) => {
          if (option.next) {
            all_connectors.push([`next-${index}-${optionIndex}`, `anchor-${all_anchors_map[option.next]}`]);
          }
        });
      }
      return all_connectors;
    }, []);
  }

  renderOneConnector(fromElemID, toElemID) {
    let fromElem = document.getElementById(fromElemID);
    let toElem = document.getElementById(toElemID);
    let fromElemPos = fromElem.getBoundingClientRect();
    let toElemPos = toElem.getBoundingClientRect();

    let svg = document.createElementNS(SVGNS, 'svg');
    //let svg_width = Math.floor(Math.random() * 192 + 8);
    let svg_width = 200;
    let svg_left = fromElemPos.x - this.containerElemPos.x - svg_width;
    let svg_top = fromElemPos.y;
    let svg_height = Math.abs(toElemPos.y - fromElemPos.y) + toElem.offsetHeight;
    svg.setAttribute('style', `position:absolute;left:${svg_left};top:${svg_top};`);
    svg.setAttribute('width', '200px');
    svg.setAttribute('height', `${svg_height}px`);
    
    let circle1 = document.createElementNS(SVGNS, 'circle');
    let circle_r = 8;
    let circle1_cx = svg_width - circle_r;
    let circle1_cy = fromElem.clientHeight/2;
    circle1.setAttribute('cx', circle1_cx);
    circle1.setAttribute('cy', circle1_cy);
    circle1.setAttribute('r', circle_r);
    circle1.setAttribute('fill', 'red');
    svg.appendChild(circle1);
    
    let circle2 = document.createElementNS(SVGNS, 'circle');
    let circle2_cx = svg_width - circle_r;
    let circle2_cy = Math.abs(toElemPos.y - fromElemPos.y) + toElem.clientHeight/2;
    circle2.setAttribute('cx', circle2_cx);
    circle2.setAttribute('cy', circle2_cy);
    circle2.setAttribute('r', circle_r);
    circle2.setAttribute('fill', 'red');
    svg.appendChild(circle2);
    
    let polyline = document.createElementNS(SVGNS, 'polyline');
    let indent = Math.floor((Math.random() * (svg_width/9) + 1) * 8);
    let point1 = `${circle1_cx},${fromElem.clientHeight/2}`;
    let point2 = `${circle1_cx - indent},${fromElem.clientHeight/2}`;
    let point3 = `${circle1_cx - indent},${Math.abs(toElemPos.y - fromElemPos.y) + toElem.clientHeight/2}`;
    let point4 = `${circle1_cx},${Math.abs(toElemPos.y - fromElemPos.y) + toElem.clientHeight/2}`;
    polyline.setAttribute('points', `${point1} ${point2} ${point3} ${point4}`);
    polyline.setAttribute('stroke', 'red');
    polyline.setAttribute('fill', 'none');
    svg.appendChild(polyline);

    this.svgContainerElem.appendChild(svg);
  }
}
