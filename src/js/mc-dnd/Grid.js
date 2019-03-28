import React, {Component} from "react";

class Grid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            blocks: this.props.blocks,
            headers: this.props.headers,
            blockElements: null,
            gridElements: null,
            headerElements: null,
            filledPositions: [],
            numRows: 0,
            isDragging: false,
            dragElement: null,
            dragGridBlock: null
        };
    }

    componentDidMount() {
        if (this.state.blockElements === null || this.state.columnElements === null || this.state.headerElements === null) {
            this.updateElements();
        }
    }

    render() {
        let columnWidth = 100 / this.state.headers.length;
        let numRows = this.state.numRows === 0 ? this.getRowsNeeded(this.state.blocks, 'parent') : this.state.numRows;

        let gridStyle = {
            gridTemplateColumns: 'repeat(' + this.state.headers.length + ', ' + columnWidth + '%)',
            gridTemplateRows: 'repeat(' + numRows + ', 44px)'
        };

        return (
            <div className={this.state.isDragging ? 'mc-dnd-grid dragging' : 'mc-dnd-grid'} style={gridStyle}>
                {this.state.headerElements ? this.state.headerElements : null}
                {this.state.blockElements ? this.state.blockElements : null}
                {this.state.gridElements ? this.state.gridElements : null}
            </div>
        );
    }

    createBlockElements() {
        let blocks = this.sortBlocks();

        return this.getBlocks(blocks);
    }

    createGridElements() {
        let gridBlocks = [];

        for (let col = 1; col < this.state.headers.length + 1; col++) {
            for (let row = 2; row < +this.state.numRows; row++) {
                let style = {
                    gridColumnStart: col,
                    gridColumnEnd: col,
                    gridRowStart: row,
                    gridRowEnd: row
                };

                gridBlocks.push(
                    <div className={'mc-dnd-grid-block'}
                         data-col={col}
                         data-row={row}
                         id={'x' + col + 'y' + row}
                         key={'grid-' + col + row}
                         onDragLeave={(e) => this.handleDragLeaveGrid(e)}
                         onDragOver={(e) => this.handleDragOverGrid(e)}
                         style={style}/>
                );
            }
        }

        return gridBlocks;
    }

    createHeaderElements() {
        let headers = [];

        this.state.headers.map((h, index) => {
            let style = {
                gridColumnStart: index + 1,
                gridColumnEnd: index + 1,
                gridRowStart: 1,
                gridRowEnd: 1
            };

            headers.push(
                <div className={'mc-dnd-header'} key={'header-' + h.id} style={style}>
                    {h.display}
                </div>
            );
        });

        return headers;
    }

    getBlocks(blockArray, isOrdered) {
        let blocks = [];
        let filledPositionsArray = this.state.filledPositions;

        blockArray.map(b => {
            let col = this.state.headers.map(h => {
                return h.id;
            }).indexOf(b.parent) + 1;
            let colSpan = [];

            for (let i = 0; i < b.span; i++) {
                colSpan.push(col + i);
            }

            let row = b.order !== undefined ? (b.order + 1) : 2;
            let isAvailable = false;

            while (!isAvailable) {
                let checkPosition = filledPositionsArray.filter(cp => {
                    return colSpan.includes(cp.col) && cp.row === row;
                });

                if (checkPosition.length > 0) {
                    row++;
                } else {
                    isAvailable = true;
                }
            }

            let blockStyle = {
                gridColumnStart: col,
                gridColumnEnd: 'span ' + b.span,
                gridRowStart: row,
                gridRowEnd: row
            };

            colSpan.map(c => {
                let filledPosition = {
                    blockId: b.id,
                    col: c,
                    row: row
                };

                filledPositionsArray.push(filledPosition);
            });

            blocks.push(
                <div className={'mc-dnd-block'}
                     draggable={true}
                     data-col={col}
                     data-id={b.id}
                     data-row={row}
                     data-span={b.span}
                     id={'block-' + b.id}
                     key={'block-' + b.id}
                     onDrag={(e) => this.handleDragStart(e)}
                     onDragOver={(e) => this.throttle(this.handleDragOverBlock(e), 1)}
                     onDragEnd={(e) => this.handleDragEnd(e)}
                     style={blockStyle}>
                    {b.display}
                </div>
            );
        });

        this.setState({
            filledPositions: filledPositionsArray
        });

        return blocks;
    }

    getRowsNeeded(array, attribute) {
        let result = array.map(b => {
            return b[attribute];
        });

        // Get number of most recurring
        // https://www.w3resource.com/javascript-exercises/javascript-array-exercise-8.php
        let mf = 1;
        let m = 0;
        let item;
        for (let i = 0; i < result.length; i++) {
            for (let j = i; j < result.length; j++) {
                if (result[i] === result[j])
                    m++;
                if (mf < m) {
                    mf = m;
                    item = result[i];
                }
            }
            m = 0;
        }

        return mf + 2; // +1 for header and +1 for dragging room
    }

    handleDragEnd(e) {
        let element = e.currentTarget;
        let col = parseInt(this.state.dragGridBlock.getAttribute('data-col'));
        let row = parseInt(this.state.dragGridBlock.getAttribute('data-row'));
        let movedBlockId = parseInt(element.getAttribute('data-id'));

        element.style.gridRowStart = row;
        element.style.gridRowEnd = row;
        element.setAttribute('data-row', row);

        // update blocks of elements that have been moved
        let movedElements = document.querySelectorAll('[data-lastMove]');
        let tempBlocks = this.state.blocks;

        for (let i = 0; i < movedElements.length; i++) {
            let blockRow = parseInt(movedElements[i].getAttribute('data-row'));
            let blockId = parseInt(movedElements[i].getAttribute('data-id'));

            tempBlocks = tempBlocks.map(b => {
                if (b.id === blockId) {
                    b.order = blockRow - 1;
                }

                return b;
            });
        }

        // update block that was dragged
        tempBlocks = tempBlocks.map(b => {
            if (b.id === movedBlockId) {
                b.order = row - 1;
                b.parent = col;

                console.log('block: ' + b.id);
                console.log('col: ' + col);
                console.log('row: ' + row);
            }

            return b;
        });

        // Confirm update
        this.setState({
            blocks: tempBlocks,
            dragGridBlock: null,
            isDragging: false
        }, () => {
            this.updateElements()
        });
    }

    handleDragLeaveBlock(e) {
        let element = e.currentTarget;

        if (element !== this.state.dragElement) {
            let row = parseInt(element.getAttribute('data-row'));
            let lastMove = element.getAttribute('data-lastMove');

            if (lastMove) {
                switch (lastMove) {
                    case 'down':
                        row = row + 1;
                        break;
                    case 'up':
                        row = row - 1;
                        break;
                    default:
                        break;
                }
            }

            element.style.gridRowStart = row;
            element.style.gridRowEnd = row;

            element.removeAttribute('data-lastMove');
            element.setAttribute('data-row', row);
        }
    }

    handleDragLeaveGrid(e) {
        e.currentTarget.classList.remove('hover');
    }

    handleDragOverBlock(e) {
        let element = e.currentTarget;

        if (element !== this.state.dragElement) {
            let elementRect = element.getBoundingClientRect();
            let elementMid = elementRect.y + (elementRect.height / 2);

            this.handleVerticalDragOver(e, element, elementMid);

            element.style.zIndex = 10;
        }
    }

    handleDragOverGrid(e) {
        let element = e.currentTarget;

        this.setState({
            dragGridBlock: element
        });

        element.classList.add('hover');
    }

    handleDragStart(e) {
        this.setState({
            dragElement: e.currentTarget,
            isDragging: true
        });
    }

    handleVerticalDragOver(e, element, elementMid) {
        let row = parseInt(element.getAttribute('data-row'));

        if (e.clientY > elementMid || row === 2) {
            row = row + 1;
            element.setAttribute('data-lastMove', 'down');
        }

        if (e.clientY < elementMid && row !== 2) {
            row = row - 1;
            element.setAttribute('data-lastMove', 'up');
        }

        element.style.gridRowStart = row;
        element.style.gridRowEnd = row;
        element.setAttribute('data-row', row);
    }

    sortBlocks() {
        let blocks = this.state.blocks;
        let orderedBlocks = [];
        let unorderedBlocks = [];
        let returnBlocks = [];

        blocks.map(b => {
            if (b.order === undefined)
                unorderedBlocks.push(b);
            else
                orderedBlocks.push(b);
        });

        blocks = orderedBlocks.concat(unorderedBlocks);

        this.state.headers.map(h => {
            blocks.map(b => {
                if (h.id === b.parent) {
                    return returnBlocks.push(b);
                }
            });
        });

        return returnBlocks;
    }

    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit)
            }
        }
    }

    updateElements() {
        let numRows = this.getRowsNeeded(this.state.blocks, 'parent');

        this.setState({
            numRows: numRows,
            filledPositions: []
        }, () => {
            let be = this.createBlockElements();

            numRows = this.getRowsNeeded(this.state.filledPositions, 'col');

            let he = this.createHeaderElements();
            let ge = this.createGridElements();

            this.setState({
                blockElements: be,
                gridElements: ge,
                headerElements: he,
                numRows: numRows
            });
        });
    }
}

export default Grid;