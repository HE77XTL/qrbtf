/*eslint-disable*/

import React from "react";
import ReactDOMServer from 'react-dom/server'
import {getQrcodeData} from "../utils/qrcodeHandler";
import {saveImg, saveSvg} from "../utils/downloader";
import {isWeiXin} from "../utils/util";
import './Qrcode.css';
import logo from '../qrbtf-logo.svg';

import Footer from "./footer/Footer";
import QrItem from "./QrItem";
import QrRendererBase from "./QrRendererBase";
import QrRendererRound from "./QrRendererRound";
import QrRendererRandRound from "./QrRendererRandRound";
import QrRendererBlank from "./QrRendererBlank";
import QrRendererRandRect from "./QrRendererRandRect";
import QrRendererDSJ from "./QrRendererDSJ";


const styleList = [
    {value: "A1", renderer: QrRendererBase},
    {value: "A2", renderer: QrRendererRound},
    {value: "A3", renderer: QrRendererRandRound},
    {value: "SP — 1", renderer: QrRendererDSJ},
    {value: "SP — 2", renderer: QrRendererRandRect},
    {value: "C2", renderer: QrRendererBlank},
    {value: "D1", renderer: QrRendererBlank},
    {value: "D2", renderer: QrRendererBlank},
];


class Qrcode extends React.Component {
    paramInfoBuffer;
    paramValueBuffer;
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            selectedIndex: 0,
            options: {text: ''},
            qrcode: null,
            paramInfo: [],
            paramValue: [],
            correctLevel: 0
        };
        this.paramInfoBuffer = new Array(16).fill(new Array(16));
        this.paramValueBuffer = new Array(16).fill(new Array(16));
    }

    componentDidMount() {
        const text = 'https://qrbtf.com/';
        this.setState({
            paramInfo: this.paramInfoBuffer,
            paramValue: this.paramValueBuffer,
            text: text,
            options: {text: text},
            qrcode: getQrcodeData({text: text, correctLevel: this.state.correctLevel})
        });
    }

    setParamInfo = (index) => {
        const _this = this;
        return function (params) {
            _this.paramInfoBuffer[index] = params;
            _this.paramValueBuffer[index] = params.map(p => {
                return p.default
            });
        }
    }

    setParamValue = (valueIndex, value) => {
        const newValue = this.state.paramValue.slice();
        newValue[this.state.selectedIndex][valueIndex] = value;
        this.setState({paramValue: newValue});
    }

    handleCreate = (e) => {
        let text = this.state.text
        if (text.length <= 0) text = 'https://qrbtf.com/';
        this.setState({text: text, options: {text: text}, qrcode: getQrcodeData({text: text, correctLevel: this.state.correctLevel})});
        if (e) e.target.blur();
    }

    downloadSvg = (e) => {
        const style = styleList[this.state.selectedIndex]
        const el = React.createElement(style.renderer, {qrcode: this.state.qrcode, params: this.state.paramValue[this.state.selectedIndex]})
        saveSvg(style.value, ReactDOMServer.renderToString(el))
    }

    downloadImg = (e) => {
        const style = styleList[this.state.selectedIndex]
        const el = React.createElement(style.renderer, {qrcode: this.state.qrcode, params: this.state.paramValue[this.state.selectedIndex]})
        saveImg(style.value, ReactDOMServer.renderToString(el), 1500, 1500)
    }

    renderParamEditor = (info, index) => {
        if (info.choices) {
            return (
                <select
                    className="Qr-select"
                    key={"select_" + this.state.selectedIndex + "_" + index}
                    value={this.state.paramValue[this.state.selectedIndex][index]}
                    onChange={(e) => this.setParamValue(index, e.target.value)}>
                    {
                        info.choices.map((choice, index) => {
                            return (
                                <option key={"option_" + this.state.selectedIndex + "_" + index}
                                        value={index}>
                                    {choice}
                                </option>
                            );
                        })
                    }
                </select>
            );
        }
        else {
            return (
                <input
                    type="number"
                    key={"input_" + this.state.selectedIndex + "_" + index}
                    className="Qr-input small-input"
                    placeholder="10"
                    defaultValue={this.state.paramValue[this.state.selectedIndex][index]}
                    onBlur={(e) => this.setParamValue(index, e.target.value)}
                    onKeyPress={(e) => {if(e.key === 'Enter') {this.setParamValue(index, e.target.value); e.target.blur()}}}/>
            );
        }
    }

    renderAdjustment = () => {
        const target = this.state.paramInfo[this.state.selectedIndex];
        if (target instanceof Array) {
            return target.map((info, index) => {
                return (
                    <tr key={"tr_" + index}>
                        <td key={"title_" + index}>{info.key}</td>
                        <td key={"editor_" + index}>{this.renderParamEditor(info, index)}</td>
                    </tr>
                )
            })
        }
    }

    render() {
        return (
            <div></div>
                // <div className="Qr-titled">
                //     <div className="Qr-Centered title-margin">
                //         <div className="Qr-s-title">Downloads</div>
                //         <p className="Qr-s-subtitle">下载二维码 — {styleList[this.state.selectedIndex].value}</p>
                //     </div>
                //     <div className="Qr-Centered">
                //         <div className="div-btn">
                //             <button className="dl-btn" onClick={this.downloadSvg}>SVG</button>
                //             <button className="dl-btn" onClick={this.downloadImg}>JPG</button>
                //         </div>
                //         <div id="wx-message"></div>
                //     </div>
                //
                // </div>
        );
    }
}

export default Qrcode;

window.onload = function(){
    if(isWeiXin()){
        const outer = document.getElementById("wx-message");
        const inner = document.createElement("div");
        inner.className = "note-font";
        inner.id = "wx-message-inner";
        inner.innerHTML = "当前客户端不支持下载，请在浏览器中打开。";
        outer.appendChild(inner);
    }
}
