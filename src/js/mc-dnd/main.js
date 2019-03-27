require('../../scss/main.scss');
import React, {Component} from "react";
import ReactDOM from "react-dom";
import Grid from './Grid.js';
import settings from './Settings.js';

ReactDOM.render(
    <Grid headers={window.headers} blocks={window.blocks}/>,
    document.getElementById('mc-dnd-mount')
);