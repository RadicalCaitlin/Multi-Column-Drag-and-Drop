import React, {Component} from "react";
import settings from './Settings.js';

class Grid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            headers: window.headers,
            blocks: window.blocks,
            filledPositions: []
        };
    }

    render() {
        let columnWidth = 100/this.state.headers.length;
        let numRows = this.getRowsNeeded() + 1; // +1 for header

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

    getRowsNeeded() {
        let parents = this.state.blocks.map(b => {
            return b.parent;
        });

        // Get number of most recurring
        // https://www.w3resource.com/javascript-exercises/javascript-array-exercise-8.php
        let mf = 1;
        let m = 0;
        let item;
        for (let i=0; i<parents.length; i++)
        {
            for (let j=i; j<parents.length; j++)
            {
                if (parents[i] === parents[j])
                    m++;
                if (mf<m)
                {
                    mf=m;
                    item = parents[i];
                }
            }
            m=0;
        }

        return mf;
    }

    renderBlocks() {
        let filledPostions = [];

        return this.state.blocks.map(b => {
            let parentPosition = this.state.headers.map(h => { return h.id; }).indexOf(b.parent) + 1;
            let row = 2;
            let isAvailable = false;

            while (!isAvailable) {
                let checkPosition = filledPostions.filter(cp => {
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
                col: parentPosition,
                row: row
            };

            filledPostions.push(filledPosition);

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