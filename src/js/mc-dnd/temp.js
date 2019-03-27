import React, {Component} from "react";

// Just a placeholder

class Temp extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
            </div>
        );
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
}

export default Temp;