import React, {Component} from "react";
import settings from './Settings.js';

window.filledPositions = [];

class Grid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            headers: window.headers,
            blocks: window.blocks,
            filledPositions: [],
            numRows: 0,
            isDragging: false
        };
    }

    componentDidMount() {
        if (this.state.numRows === 0) {
            let numRows = this.getRowsNeeded(this.state.blocks, 'parent');

            this.setState({
                numRows: numRows
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (window.filledPositions.length > 0) {
            let numRows = this.getRowsNeeded(window.filledPositions, 'col');

            if (numRows !== this.state.numRows) {
                this.setState({
                    numRows: numRows,
                    filledPositions: window.filledPositions
                });
            }

            window.filledPositions = [];
        }

        this.orderBlocks();
    }

    render() {
        let columnWidth = 100 / this.state.headers.length;
        let numRows = this.state.numRows === 0 ? this.getRowsNeeded(this.state.blocks, 'parent') : this.state.numRows;

        let gridStyle = {
            gridTemplateColumns: 'repeat(' + this.state.headers.length + ', ' + columnWidth + '%)',
            gridTemplateRows: 'repeat(' + numRows + ', 44px)'
        };

        return (
            <div className={'mc-dnd-grid'} style={gridStyle}>
                {this.renderHeaders()}
                {this.renderBlocks()}
                {this.renderColumns()}
            </div>
        );
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

        return mf + 1; // +1 for header
    }

    handleDrag(e) {
        e = e || window.event;
        e.preventDefault();

        let mouseX = e.clientX;
        let mouseY = e.clientY;

        e.currentTarget.style.top = (e.currentTarget.offsetTop - mouseY) + "px";
        e.currentTarget.style.left = (e.currentTarget.offsetLeft - mouseX) + "px";
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');

        this.setState({
            isDragging: false
        });
    }

    handleDragLeaveColumn(e) {
        e.target.classList.remove('drag-hover');
    }

    handleDragOverBlock(e) {
        this.setState({
            numRows: (this.state.numRows + 1)
        });

        let blockId = e.currentTarget.getAttribute('data-id');

        let block = this.state.filledPositions.filter(b => {
            return b.blockId === parseInt(blockId);
        });

        console.log(block);
    }

    handleDragOverColumn(e) {
        e.target.classList.add('drag-hover');
    }

    handleDragStart(e) {
        e.target.classList.add('dragging');

        this.setState({
            isDragging: true
        });
    }

    handleMouseLeaveColumn(e) {
        if (this.state.isDragging) {
            e.target.classList.remove('drag-hover');
        }
    }

    handleMouseOverColumn(e) {
        if (this.state.isDragging) {
            e.target.classList.add('drag-hover');
        }
    }

    orderBlocks() {
        this.state.blocks.map(b => {
            if (typeof b.order && b.order > 0) {

                let col = this.state.headers.map(h => {
                    return h.id;
                }).indexOf(b.parent) + 1;

                let row = b.order + 1; // +1 for header

                let element = document.getElementById('block-' + b.id);

                // Move Element To Position
                if (element) {
                    element.style.gridArea = row + ' / ' + col + ' / ' + row + ' / ' + 'span ' + (col + b.span - 1);
                }

                // Update State
                let tempFilledPositions = this.state.filledPositions.filter(p => {
                    return p.blockId !== b.id;
                });

                let newPosition = {
                    blockId: b.id,
                    col: col,
                    row: row
                };

                tempFilledPositions.push(newPosition);

                this.setState({
                    filledPositions: tempFilledPositions
                });

                // What Does Element Touch
                let colSpan = [];

                for (let i = col; i < col + b.span; i++) {
                    colSpan.push(i);
                }

                let positionCheck = this.state.filledPositions.filter(p => {
                    return colSpan.includes(p.col) && p.row === row;
                });

                while (positionCheck.length > 0) {
                    // get blocks from block ids
                    let blockIds = positionCheck.map(c => {
                        return c.blockId;
                    });

                    let blocks = this.state.blocks.filter(b => {
                        return blockIds.includes(b.id);
                    });

                    // get elements of blocks
                    let elements = blocks.map(b => {
                        // get element
                        let element = document.getElementById('block-' + b.id);

                        // get parent position for first column
                        let parentPosition = this.state.headers.map(h => {
                            return h.id;
                        }).indexOf(b.parent) + 1;

                        // get next row
                        row++;

                        // set span of element
                        let blockStyle = {
                            gridColumnStart: parentPosition,
                            gridColumnEnd: 'span ' + (parentPosition + b.span - 1),
                            gridRowStart: row,
                            gridRowEnd: row
                        };

                        // update element style
                        element.style.gridColumnStart = parentPosition;
                        element.style.gridColumnEnd = 'span ' + (parentPosition + b.span - 1);
                        element.style.gridRowStart = row;
                        element.style.gridRowEnd = row;

                        // update state
                        let tempFilledPositions = this.state.filledPositions.filter(p => {
                            return p.blockId !== b.id;
                        });

                        let filledPosition = {
                            blockId: b.id,
                            col: parentPosition ,
                            row: row
                        };

                        tempFilledPositions.push(filledPosition);


                        if (b.span > 1) {
                            for (let i = 1; i < b.span; i++) {
                                let filledPosition = {
                                    blockId: b.id,
                                    col: parentPosition + i,
                                    row: row
                                };

                                // update state for span positions
                                tempFilledPositions.push(filledPosition);
                            }
                        }

                        this.setState({
                            filledPositions: tempFilledPositions
                        });
                    });


                    // update touching elements
                    colSpan = [];

                    for (let i = col; i < col + b.span; i++) {
                        colSpan.push(i);
                    }

                    positionCheck = this.state.filledPositions.filter(p => {
                        return colSpan.includes(p.col) && p.row === row;
                    });
                }
            }
        });
    }

    renderBlocks() {
        return this.state.blocks.map(b => {
            let parentPosition = this.state.headers.map(h => {
                return h.id;
            }).indexOf(b.parent) + 1;
            let row = 2;

            let isAvailable = false;

            while (!isAvailable) {
                let checkPosition = window.filledPositions.filter(cp => {
                    if (cp.col === parentPosition && cp.row === row)
                        return cp;
                });

                if (checkPosition.length > 0) {
                    row++;
                } else {
                    isAvailable = true;
                }
            }

            let blockStyle = {
                gridColumnStart: parentPosition,
                gridColumnEnd: 'span ' + (parentPosition + b.span - 1),
                gridRowStart: row,
                gridRowEnd: row,
                opacity: this.state.isDragging ? '0.5' : 1
            };

            let filledPosition = {
                blockId: b.id,
                col: parentPosition,
                row: row
            };

            window.filledPositions.push(filledPosition);

            if (b.span > 1) {
                for (let i = 1; i < b.span; i++) {
                    let filledPosition = {
                        blockId: b.id,
                        col: parentPosition + i,
                        row: row
                    };

                    window.filledPositions.push(filledPosition);
                }
            }

            return (
                <div className={'mc-dnd-block'}
                     data-id={b.id}
                     draggable={true}
                     id={'block-' + b.id}
                     key={'block-' + b.id}
                     onDrag={(e) => this.handleDrag(e)}
                     onDragEnd={(e) => this.handleDragEnd(e)}
                     onDragOver={(e) => this.handleDragOverBlock(e)}
                     onDragStart={(e) => this.handleDragStart(e)}
                     style={blockStyle}>
                    {b.display}
                </div>
            );

        });
    }

    renderColumns() {
        let columns = [];

        for (let i = 1; i < this.state.headers.length + 1; i++) {
            let style = {
                gridColumnStart: i,
                gridColumnEnd: i,
                gridRowStart: 1,
                gridRowEnd: (this.state.numRows + 1)
            };

            columns.push(
                <div className={'mc-dnd-column'}
                     onDragLeave={(e) => this.handleDragLeaveColumn(e)}
                     onDragOver={(e) => this.handleDragOverColumn(e)}
                     onMouseLeave={(e) => this.handleMouseLeaveColumn(e)}
                     onMouseEnter={(e) => this.handleMouseOverColumn(e)}
                     style={style}/>
            );
        }

        return columns;
    }

    renderHeaders() {
        return this.state.headers.map((h, index) => {
            let style = {
                gridColumnStart: index + 1,
                gridColumnEnd: index + 1,
                gridRowStart: 1,
                gridRowEnd: 1
            };

            return (
                <div className={'mc-dnd-header'} key={'header-' + h.id} style={style}>
                    {h.display}
                </div>
            );
        })
    }
}

export default Grid;