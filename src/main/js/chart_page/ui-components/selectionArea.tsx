/**
 *  As ReCharts does not allow custom React components
 * to be rendered within diagrams, see
 * (https://github.com/recharts/recharts/issues/412),
 * and the zooming in the official examples
 * (https://recharts.org/en-US/examples/HighlightAndZoomLineChart)
 * is too slow in the given use case, this class performs
 * DOM manipulations on top of the rendered diagram
 * @return {SelectionArea}
 */
export class SelectionArea {
  /**
   * Helper method for starting a selection
   * @param {number} x - mouse x position
   */
  startSelection(x: number) {
    this.setHeight(this.getDiagramAreaHeight());
    this.setY(this.getDiagramAreaPositionY());
    this.setX(x);
    this.show();
  }

  /**
   * Method for updating selection during mouse-move
   * @param {any} event
   * @param {any} mouseMoveEvent
   * @param {boolean} isSelecting
   * @param {number} startX - domain x value
   */
  updateSelection(
    event: any,
    mouseMoveEvent: any,
    isSelecting: boolean,
    startX: number
  ) {
    // only update during selection process
    if (isSelecting) {
      // prevents that e.g. axis text is selected
      mouseMoveEvent.preventDefault();

      const width = Math.abs(event.chartX - startX);
      if (event.chartX - startX < 0) {
        this.setX(event.chartX);
      }
      this.setWidth(width);
    }
  }

  /**
   * Helper method for finishing selection
   */
  finishSelection() {
    this.hide();
    this.setWidth(0);
  }

  private selectionAreaContainer = () => document.getElementById('mySvg');

  private selectionArea = () => document.getElementById('myRect');

  /**
   * Helper method for accessing horizontal diagram grid lines
   * @return {HTMLCollectionOf<Element>}
   */
  private getDiagramHorizontalGridLines() {
    return document
      .getElementsByClassName('recharts-cartesian-grid-horizontal')[0]
      .getElementsByTagName('line');
  }

  /**
   * Get diagram y position out of the highest horizontal line
   * @return {string}
   */
  private getDiagramAreaPositionY(): string {
    const lines = this.getDiagramHorizontalGridLines();
    return lines[lines.length - 1].getAttribute('y');
  }

  /**
   * Get diagram height out of lowest horizontal line
   * @return {string}
   */
  private getDiagramAreaHeight(): string {
    return this.getDiagramHorizontalGridLines()[0].getAttribute('height');
  }

  /**
   * Set y position of selection area
   * @param {number} y
   */
  private setY(y: any) {
    this.selectionAreaContainer().setAttribute('y', y.toString());
  }

  /**
   * Set x position of selection area
   * @param {number} x
   */
  private setX(x: number) {
    this.selectionArea().setAttribute('x', x.toString());
  }

  /**
   * Set width of selection area
   * @param {number} width
   */
  private setWidth(width: number) {
    document.getElementById('myRect').setAttribute('width', width.toString());
  }

  /**
   * Set height of selection area
   * @param {number} height
   */
  private setHeight(height: any) {
    this.selectionAreaContainer().setAttribute('height', height.toString());
  }

  /**
   * Hide selection area
   */
  private hide() {
    this.selectionAreaContainer().setAttribute('style', 'opacity: 0');
  }

  /**
   * Show selection area
   */
  private show() {
    this.selectionAreaContainer().setAttribute('style', 'opacity: 1');
  }
}
