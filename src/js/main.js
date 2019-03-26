require('../scss/main.scss');
import React, {Component} from "react";
import ReactDOM from "react-dom";
import Grid from './mc-dnd/Grid.js';

ReactDOM.render(
    <Grid/>,
    document.getElementById('mc-dnd-mount')
);