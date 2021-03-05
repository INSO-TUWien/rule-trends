import {RuleTrendsComponent} from "../src/main/js/chart_page/ui-components/ruleTrendsComponent";
import React from "react";
import ReactDOM from "react-dom";
import '../src/main/js/chart_page/styles/style.css';

ReactDOM.render(
    <RuleTrendsComponent days={365}/>,
    document.body
);