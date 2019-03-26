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
            numRows: 0
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
    }

    render() {
        let columnWidth = 100/this.state.headers.length;
        let numRows = this.state.numRows === 0 ? this.getRowsNeeded(this.state.blocks, 'parent') : this.state.numRows;

        let gridStyle = {
            gridTemplateColumns: 'repeat(' + this.state.headers.length + ', ' + columnWidth + '%)',
            gridTemplateRows: 'repeat(' + numRows + ', 44px)'
        };

        return (
            <div className={'mc-dnd-grid'} style={gridStyle}>
                {this.renderHeaders()}
                {this.renderBlocks()}
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
        for (let i=0; i<result.length; i++)
        {
            for (let j=i; j<result.length; j++)
            {
                if (result[i] === result[j])
                    m++;
                if (mf<m)
                {
                    mf=m;
                    item = result[i];
                }
            }
            m=0;
        }

        console.log(item+" ( " +mf +" times ), attribute: " + attribute) ;
        return mf + 1; // +1 for header
    }

    renderBlocks() {
        return this.state.blocks.map(b => {
            let parentPosition = this.state.headers.map(h => { return h.id; }).indexOf(b.parent) + 1;
            let row = 2;
            let isAvailable = false;

            while (!isAvailable) {
                let checkPosition = window.filledPositions.filter(cp => {
                    if (cp.col === parentPosition && cp.row === row)
                        return cp;
                });

                if (checkPosition.length > 0) {
                    row++;
                }
                else {
                    isAvailable = true;
                }
            }

            let blockStyle = {
                gridColumnStart: parentPosition,
                gridColumnEnd: 'span ' + (parentPosition + b.span - 1),
                gridRowStart: row,
                gridRowEnd: row
            };

            let filledPosition = {
                block: 'block: ' + b.id,
                col: parentPosition,
                row: row
            };

            window.filledPositions.push(filledPosition);

            if (b.span > 1) {
                for (let i = 1; i < b.span; i++) {
                    let filledPosition = {
                        block: 'block: ' + b.id,
                        col: parentPosition + i,
                        row: row
                    };

                    window.filledPositions.push(filledPosition);
                }
            }

            console.log(window.filledPositions);

            return (
                <div className={'mc-dnd-block'} key={'block-' + b.id} style={blockStyle}>
                    {b.display}
                </div>
            );

        });
    }

    renderHeaders() {
        return this.state.headers.map((h) => {
            return (
                <div className={'mc-dnd-header'} key={'header-' + h.id}>
                    {h.display}
                </div>
            );
        })
    }
}

export default Grid;